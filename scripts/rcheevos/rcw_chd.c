/*
 * rcw_chd.c — CHD support for rcheevos disc hashing.
 *
 * rcheevos' default cdreader understands .cue/.gdi/.bin/.iso but not CHD, so
 * this cdreader wraps it: .chd paths are served through libchdr, everything
 * else is forwarded to the default reader. Track and sector semantics are
 * ported from RetroArch (libretro-common/streams/chd_stream.c + formats/cdfs)
 * so hashes match what RetroArch and RAHasher produce for the same image.
 *
 * All file I/O goes through the hash iterator's filereader, i.e. the same
 * in-memory JS buffers the rest of hashing uses.
 */

#include <stdlib.h>
#include <string.h>
#include <strings.h>

#include "rc_hash.h"
#include "libchdr/chd.h"

#define SECTOR_DATA_SIZE 2048
#define SECTOR_RAW_SIZE 2352
#define TRACK_PAD 4

typedef struct {
  uint32_t track;
  uint32_t frames;
  uint32_t extra;   /* padding frames after the track in the CHD */
  uint32_t pregap;
  char type[32];
  char pgtype[32];
} chd_meta_t;

typedef struct {
  const rc_hash_filereader_t* reader;
  void* file;
} chd_io_t;

typedef struct {
  chd_file* chd;
  uint8_t* hunk;
  int32_t hunknum;
  uint32_t hunkbytes;
  uint32_t unitbytes;
  uint32_t frames_per_hunk;
  uint32_t frame_size;        /* bytes of each frame exposed by the track stream */
  uint32_t track_frame;       /* first frame of the track within the CHD */
  uint64_t track_start;       /* stream offset where stored data starts (after a virtual pregap) */
  uint64_t track_end;
  int swab;                   /* audio tracks are stored byte-swapped */
  /* cdfs view on top of the stream */
  uint32_t first_sector_offset;   /* bytes to skip to reach sector 0 (the pregap) */
  uint32_t first_sector_index;    /* absolute sector number of the track's sector 0 */
  uint32_t sector_size;
  uint32_t sector_header_size;
} chd_track_t;

/* ── libchdr file callbacks over the rcheevos filereader ────────────────── */

static uint64_t io_fsize(void* p) {
  chd_io_t* io = (chd_io_t*)p;
  io->reader->seek(io->file, 0, SEEK_END);
  return (uint64_t)io->reader->tell(io->file);
}

static size_t io_fread(void* ptr, size_t size, size_t count, void* p) {
  chd_io_t* io = (chd_io_t*)p;
  if (!size) return 0;
  return io->reader->read(io->file, ptr, size * count) / size;
}

static int io_fclose(void* p) {
  chd_io_t* io = (chd_io_t*)p;
  if (io->reader->close) io->reader->close(io->file);
  free(io);
  return 0;
}

static int io_fseek(void* p, int64_t offset, int whence) {
  chd_io_t* io = (chd_io_t*)p;
  io->reader->seek(io->file, offset, whence);
  return 0;
}

static const core_file_callbacks g_io_callbacks = { io_fsize, io_fread, io_fclose, io_fseek };

/* ── track metadata ─────────────────────────────────────────────────────── */

static uint32_t padding_frames(uint32_t frames) {
  return ((frames + TRACK_PAD - 1) & ~(uint32_t)(TRACK_PAD - 1)) - frames;
}

/* Copy the value of "KEY:" out of a space-separated metadata string. */
static int meta_field(const char* meta, const char* key, char* out, size_t out_size) {
  const char* p = meta;
  size_t klen = strlen(key);
  while ((p = strstr(p, key)) != NULL) {
    if ((p == meta || p[-1] == ' ') && p[klen] == ':') {
      const char* v = p + klen + 1;
      size_t n = strcspn(v, " ");
      if (n >= out_size) n = out_size - 1;
      memcpy(out, v, n);
      out[n] = '\0';
      return 1;
    }
    p += klen;
  }
  return 0;
}

static uint32_t meta_uint(const char* meta, const char* key) {
  char tmp[16];
  return meta_field(meta, key, tmp, sizeof(tmp)) ? (uint32_t)strtoul(tmp, NULL, 10) : 0;
}

static int chd_get_meta(chd_file* chd, uint32_t idx, chd_meta_t* md) {
  char meta[256];
  uint32_t len = 0;
  memset(md, 0, sizeof(*md));

  if (chd_get_metadata(chd, CDROM_TRACK_METADATA2_TAG, idx, meta, sizeof(meta) - 1, &len, NULL, NULL) != CHDERR_NONE &&
      chd_get_metadata(chd, CDROM_TRACK_METADATA_TAG, idx, meta, sizeof(meta) - 1, &len, NULL, NULL) != CHDERR_NONE &&
      chd_get_metadata(chd, GDROM_TRACK_METADATA_TAG, idx, meta, sizeof(meta) - 1, &len, NULL, NULL) != CHDERR_NONE)
    return 0;

  meta[len < sizeof(meta) ? len : sizeof(meta) - 1] = '\0';
  md->track = meta_uint(meta, "TRACK");
  md->frames = meta_uint(meta, "FRAMES");
  md->pregap = meta_uint(meta, "PREGAP");
  meta_field(meta, "TYPE", md->type, sizeof(md->type));
  meta_field(meta, "PGTYPE", md->pgtype, sizeof(md->pgtype));
  md->extra = padding_frames(md->frames);
  return md->track != 0;
}

/* Locate `track` (1-based, or an RC_HASH_CDTRACK_* special value). On success
 * fills `md`, its frame offset in the CHD and the absolute first sector. */
static int chd_find_track(chd_file* chd, uint32_t track, chd_meta_t* md, uint32_t* frame_offset, uint32_t* first_sector) {
  chd_meta_t it;
  uint32_t i, frames = 0, sectors = 0;
  int found = 0;
  /* LAST and LARGEST scan every track, keeping the latest match. */
  const int scan_all = track == RC_HASH_CDTRACK_LAST || track == RC_HASH_CDTRACK_LARGEST;

  for (i = 0; chd_get_meta(chd, i, &it); ++i) {
    const int is_audio = strcmp(it.type, "AUDIO") == 0;
    int match;
    if (track == RC_HASH_CDTRACK_FIRST_DATA) match = !is_audio;
    else if (track == RC_HASH_CDTRACK_LAST) match = 1;
    else if (track == RC_HASH_CDTRACK_LARGEST) match = !is_audio && it.frames > (found ? md->frames : 0);
    else match = it.track == track;

    if (match) {
      *md = it; *frame_offset = frames; *first_sector = sectors; found = 1;
      if (!scan_all) break;
    }
    /* chdstream_get_first_track_sector: sum of stored frames of prior tracks */
    sectors += it.frames;
    frames += it.frames + it.extra;
  }
  return found;
}

/* ── track stream (chdstream_read) ──────────────────────────────────────── */

static int chd_load_hunk(chd_track_t* t, uint32_t hunknum) {
  if ((int32_t)hunknum == t->hunknum) return 1;
  if (chd_read(t->chd, hunknum, t->hunk) != CHDERR_NONE) return 0;
  if (t->swab) {
    uint32_t i;
    for (i = 0; i + 1 < t->hunkbytes; i += 2) {
      uint8_t tmp = t->hunk[i]; t->hunk[i] = t->hunk[i + 1]; t->hunk[i + 1] = tmp;
    }
  }
  t->hunknum = (int32_t)hunknum;
  return 1;
}

static size_t chd_stream_read(chd_track_t* t, uint64_t offset, uint8_t* out, size_t bytes) {
  size_t done = 0;
  uint64_t end;
  if (offset >= t->track_end) return 0;
  if (t->track_end - offset < bytes) bytes = (size_t)(t->track_end - offset);
  end = offset + bytes;

  while (offset < end) {
    const uint32_t frame_off = (uint32_t)(offset % t->frame_size);
    uint32_t amount = t->frame_size - frame_off;
    if (amount > end - offset) amount = (uint32_t)(end - offset);

    if (offset < t->track_start) {
      memset(out + done, 0, amount);  /* virtual pregap */
    } else {
      const uint32_t chd_frame = t->track_frame + (uint32_t)((offset - t->track_start) / t->frame_size);
      const uint32_t hunk = chd_frame / t->frames_per_hunk;
      const uint32_t hunk_off = (chd_frame % t->frames_per_hunk) * t->unitbytes;
      if (!chd_load_hunk(t, hunk)) return done;
      memcpy(out + done, t->hunk + hunk_off + frame_off, amount);
    }
    done += amount;
    offset += amount;
  }
  return done;
}

/* cdfs_determine_sector_size: sniff the header size from sector 16. */
static void chd_determine_sector_size(chd_track_t* t) {
  uint8_t b[32];
  static const uint8_t sync[12] = { 0, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0 };
  if (chd_stream_read(t, (uint64_t)16 * SECTOR_RAW_SIZE + t->first_sector_offset, b, sizeof(b)) == sizeof(b)) {
    if (memcmp(&b[25], "CD001", 5) == 0) { t->sector_size = SECTOR_RAW_SIZE; t->sector_header_size = 24; return; }
    if (memcmp(&b[17], "CD001", 5) == 0) { t->sector_size = SECTOR_RAW_SIZE; t->sector_header_size = 16; return; }
    if (memcmp(b, sync, sizeof(sync)) == 0) { t->sector_size = SECTOR_RAW_SIZE; t->sector_header_size = 16; return; }
  }
  /* cdfs_open_chd_track fallback */
  t->sector_size = t->frame_size;
  t->sector_header_size = t->frame_size == SECTOR_RAW_SIZE ? 16 : t->frame_size == 2336 ? 8 : 0;
}

static void* chd_open_track(const char* path, uint32_t track, const rc_hash_iterator_t* iterator) {
  const rc_hash_filereader_t* reader = &iterator->callbacks.filereader;
  chd_io_t* io;
  chd_file* chd = NULL;
  chd_track_t* t;
  chd_meta_t md;
  const chd_header* hd;
  uint32_t frame_offset = 0, first_sector = 0;
  void* file;

  if (!reader->open || !(file = reader->open(path))) return NULL;
  io = (chd_io_t*)calloc(1, sizeof(*io));
  io->reader = reader;
  io->file = file;
  /* libchdr takes ownership of io (closed via io_fclose) */
  if (chd_open_core_file_callbacks(&g_io_callbacks, io, CHD_OPEN_READ, NULL, &chd) != CHDERR_NONE) {
    io_fclose(io);
    return NULL;
  }
  if (!chd_find_track(chd, track, &md, &frame_offset, &first_sector)) {
    chd_close(chd);
    return NULL;
  }

  hd = chd_get_header(chd);
  t = (chd_track_t*)calloc(1, sizeof(*t));
  t->chd = chd;
  t->hunkbytes = hd->hunkbytes;
  t->unitbytes = hd->unitbytes;
  t->frames_per_hunk = hd->unitbytes ? hd->hunkbytes / hd->unitbytes : 0;
  t->hunk = (uint8_t*)malloc(hd->hunkbytes);
  t->hunknum = -1;
  if (!t->frames_per_hunk || !t->hunk) {
    free(t->hunk); free(t); chd_close(chd);
    return NULL;
  }

  if (md.type[0] == 'M') {
    if (md.type[5] == '_') t->frame_size = md.type[6] == 'R' ? SECTOR_RAW_SIZE : hd->unitbytes; /* *_RAW vs MODE2_FORM* */
    else t->frame_size = SECTOR_DATA_SIZE;                                                      /* MODE1 */
  } else if (md.type[0] == 'A') {
    t->frame_size = SECTOR_RAW_SIZE;
    t->swab = 1;
  } else {
    t->frame_size = hd->unitbytes;
  }

  /* Pregap data is only in the file when PGTYPE starts with 'V'. */
  t->track_frame = frame_offset;
  t->track_start = md.pgtype[0] != 'V' ? (uint64_t)md.pregap * t->frame_size : 0;
  t->track_end = t->track_start + (uint64_t)md.frames * t->frame_size;
  /* chdstream_get_track_start returns the pregap unconditionally */
  t->first_sector_offset = md.pregap * t->frame_size;
  t->first_sector_index = first_sector;
  chd_determine_sector_size(t);
  return t;
}

static size_t chd_read_sector(chd_track_t* t, uint32_t sector, void* buffer, size_t requested_bytes) {
  uint8_t* out = (uint8_t*)buffer;
  size_t total = 0;
  uint32_t rel;
  if (sector < t->first_sector_index) return 0;
  rel = sector - t->first_sector_index;

  while (requested_bytes) {
    const size_t chunk = requested_bytes > SECTOR_DATA_SIZE ? SECTOR_DATA_SIZE : requested_bytes;
    const uint64_t pos = (uint64_t)rel * t->sector_size + t->sector_header_size + t->first_sector_offset;
    const size_t n = chd_stream_read(t, pos, out, chunk);
    total += n;
    if (n < chunk) break;
    out += n;
    requested_bytes -= n;
    ++rel;
  }
  return total;
}

static void chd_close_track(chd_track_t* t) {
  if (!t) return;
  chd_close(t->chd); /* closes io via io_fclose */
  free(t->hunk);
  free(t);
}

/* ── dispatching cdreader: CHD here, everything else to the default ─────── */

typedef struct {
  int is_chd;
  void* inner;
} disc_handle_t;

static rc_hash_cdreader_t g_default_cdreader;

static int is_chd_path(const char* path) {
  const char* dot = strrchr(path, '.');
  return dot && strcasecmp(dot, ".chd") == 0;
}

static void* disc_open_track_iterator(const char* path, uint32_t track, const rc_hash_iterator_t* iterator) {
  disc_handle_t* h;
  void* inner;
  const int chd = is_chd_path(path);
  if (chd) inner = chd_open_track(path, track, iterator);
  else inner = g_default_cdreader.open_track_iterator(path, track, iterator);
  if (!inner) return NULL;
  h = (disc_handle_t*)malloc(sizeof(*h));
  h->is_chd = chd;
  h->inner = inner;
  return h;
}

/* rcheevos only copies a cdreader whose open_track is set; the iterator
 * variant above is the one it actually calls. */
static void* disc_open_track(const char* path, uint32_t track) {
  (void)path; (void)track;
  return NULL;
}

static size_t disc_read_sector(void* handle, uint32_t sector, void* buffer, size_t requested_bytes) {
  disc_handle_t* h = (disc_handle_t*)handle;
  return h->is_chd ? chd_read_sector((chd_track_t*)h->inner, sector, buffer, requested_bytes)
                   : g_default_cdreader.read_sector(h->inner, sector, buffer, requested_bytes);
}

static void disc_close_track(void* handle) {
  disc_handle_t* h = (disc_handle_t*)handle;
  if (!h) return;
  if (h->is_chd) chd_close_track((chd_track_t*)h->inner);
  else g_default_cdreader.close_track(h->inner);
  free(h);
}

static uint32_t disc_first_track_sector(void* handle) {
  disc_handle_t* h = (disc_handle_t*)handle;
  return h->is_chd ? ((chd_track_t*)h->inner)->first_sector_index
                   : g_default_cdreader.first_track_sector(h->inner);
}

void rcw_get_cdreader(rc_hash_cdreader_t* cdreader) {
  rc_hash_get_default_cdreader(&g_default_cdreader);
  cdreader->open_track = disc_open_track;
  cdreader->open_track_iterator = disc_open_track_iterator;
  cdreader->read_sector = disc_read_sector;
  cdreader->close_track = disc_close_track;
  cdreader->first_track_sector = disc_first_track_sector;
}
