/*
 * rcw.c — thin WebAssembly bridge between rcheevos' rc_client and the
 * TypeScript runtime in src/lib/cheevos/.
 *
 * rcheevos runs in its own wasm module, separate from the emulator core, so
 * everything that crosses the boundary goes through the Module.rc* hooks
 * installed by src/lib/cheevos/client.ts:
 *
 *   Module.rcReadMemory(address, bufPtr, numBytes) -> bytes read
 *   Module.rcServerCall(reqId, urlPtr, postPtr, contentTypePtr)
 *   Module.rcOnEvent(jsonPtr)
 *   Module.rcOnComplete(reqId, result, errorPtr)
 *   Module.rcLog(msgPtr)
 *   Module.rcFileOpen(pathPtr) -> handle (0 = not found)
 *   Module.rcFileSeek(handle, offset, origin)
 *   Module.rcFileTell(handle) -> offset
 *   Module.rcFileRead(handle, bufPtr, n) -> bytes read
 *   Module.rcFileClose(handle)
 *   Module.rcCoreMemoryInfo(retroMemoryId) -> [corePtr, size]
 *
 * Memory: rcheevos' own rc_libretro maps the console's address space onto
 * libretro memory blocks. The blocks live in the *core's* wasm heap, not
 * ours, so the "pointers" handed to rc_libretro are core-heap addresses. It
 * only does arithmetic on them (never dereferences), and JS performs the
 * actual reads from the core's HEAPU8 using the resulting region table.
 *
 * Structured data (user/game/achievement lists, events) is handed to JS as
 * JSON so the TS side never depends on C struct layouts.
 */

#include <emscripten.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "rc_client.h"
#include "rc_hash.h"
#include "rc_libretro.h"

/* rcw_chd.c: cdreader that adds CHD support on top of rcheevos' default. */
void rcw_get_cdreader(rc_hash_cdreader_t* cdreader);

/* ── JS imports ─────────────────────────────────────────────────────────── */

EM_JS(uint32_t, js_read_memory, (uint32_t address, uint8_t* buffer, uint32_t num_bytes), {
  return Module.rcReadMemory(address, buffer, num_bytes) >>> 0;
});

EM_JS(void, js_server_call, (uint32_t req_id, const char* url, const char* post, const char* content_type), {
  Module.rcServerCall(req_id, url, post, content_type);
});

EM_JS(void, js_on_event, (const char* json), {
  Module.rcOnEvent(json);
});

EM_JS(void, js_on_complete, (uint32_t req_id, int result, const char* error_message), {
  Module.rcOnComplete(req_id, result, error_message);
});

EM_JS(void, js_log, (const char* message), {
  Module.rcLog(message);
});

EM_JS(uint32_t, js_file_open, (const char* path), {
  return Module.rcFileOpen(path) >>> 0;
});

EM_JS(void, js_file_seek, (uint32_t handle, double offset, int origin), {
  Module.rcFileSeek(handle, offset, origin);
});

EM_JS(double, js_file_tell, (uint32_t handle), {
  return Module.rcFileTell(handle);
});

EM_JS(uint32_t, js_file_read, (uint32_t handle, void* buffer, uint32_t n), {
  return Module.rcFileRead(handle, buffer, n) >>> 0;
});

EM_JS(void, js_file_close, (uint32_t handle), {
  Module.rcFileClose(handle);
});

EM_JS(void, js_core_memory_info, (uint32_t id, uint32_t* out), {
  var info = Module.rcCoreMemoryInfo(id);
  HEAPU32[out >> 2] = info[0] >>> 0;
  HEAPU32[(out >> 2) + 1] = info[1] >>> 0;
});

/* ── JSON builder ───────────────────────────────────────────────────────── */

typedef struct { char* buf; size_t len; size_t cap; } sb_t;

static void sb_reserve(sb_t* sb, size_t extra) {
  if (sb->len + extra + 1 <= sb->cap) return;
  size_t cap = sb->cap ? sb->cap : 256;
  while (cap < sb->len + extra + 1) cap *= 2;
  sb->buf = (char*)realloc(sb->buf, cap);
  sb->cap = cap;
}

static void sb_raw(sb_t* sb, const char* s) {
  size_t n = strlen(s);
  sb_reserve(sb, n);
  memcpy(sb->buf + sb->len, s, n);
  sb->len += n;
  sb->buf[sb->len] = '\0';
}

static void sb_str(sb_t* sb, const char* s) {
  if (!s) { sb_raw(sb, "null"); return; }
  sb_reserve(sb, strlen(s) + 2);
  sb->buf[sb->len++] = '"';
  for (const unsigned char* p = (const unsigned char*)s; *p; ++p) {
    char esc[8];
    switch (*p) {
      case '"':  sb_raw(sb, "\\\""); continue;
      case '\\': sb_raw(sb, "\\\\"); continue;
      case '\n': sb_raw(sb, "\\n");  continue;
      case '\r': sb_raw(sb, "\\r");  continue;
      case '\t': sb_raw(sb, "\\t");  continue;
      default:
        if (*p < 0x20) { snprintf(esc, sizeof(esc), "\\u%04x", *p); sb_raw(sb, esc); continue; }
        sb_reserve(sb, 1);
        sb->buf[sb->len++] = (char)*p;
        sb->buf[sb->len] = '\0';
    }
  }
  sb_raw(sb, "\"");
}

static void sb_num(sb_t* sb, double v) {
  char tmp[32];
  if (v == (double)(long long)v) snprintf(tmp, sizeof(tmp), "%lld", (long long)v);
  else snprintf(tmp, sizeof(tmp), "%.4f", v);
  sb_raw(sb, tmp);
}

/* key/value helpers — `first` tracks comma placement inside an object; each
 * nested object opens a block with its own `first`. Only the fields
 * src/lib/cheevos/types.ts declares are emitted. */
static void sb_key(sb_t* sb, int* first, const char* key) {
  if (!*first) sb_raw(sb, ",");
  *first = 0;
  sb_str(sb, key);
  sb_raw(sb, ":");
}
#define KV_STR(k, v) do { sb_key(sb, &first, k); sb_str(sb, v); } while (0)
#define KV_NUM(k, v) do { sb_key(sb, &first, k); sb_num(sb, (double)(v)); } while (0)

/* Caller owns the returned buffer (JS frees it with _free). Every builder
 * writes at least "null", so the buffer is always allocated. */
static char* sb_take(sb_t* sb) { return sb->buf; }

static void json_achievement(sb_t* sb, const rc_client_achievement_t* a) {
  int first = 1;
  if (!a) { sb_raw(sb, "null"); return; }
  sb_raw(sb, "{");
  KV_NUM("id", a->id);
  KV_STR("title", a->title);
  KV_STR("description", a->description);
  KV_NUM("points", a->points);
  KV_STR("badgeUrl", a->badge_url);
  KV_STR("badgeLockedUrl", a->badge_locked_url);
  KV_STR("measuredProgress", a->measured_progress);
  KV_NUM("measuredPercent", a->measured_percent);
  KV_NUM("unlocked", a->unlocked);
  sb_raw(sb, "}");
}

/* ── client state ───────────────────────────────────────────────────────── */

static rc_client_t* g_client = NULL;

/* Pending server requests: rc_client hands us a callback + opaque data that
 * must be invoked exactly once. JS gets a numeric id and calls rcw_deliver. */
typedef struct pending_req {
  uint32_t id;
  rc_client_server_callback_t callback;
  void* callback_data;
  struct pending_req* next;
} pending_req_t;

static pending_req_t* g_pending = NULL;
static uint32_t g_next_req_id = 1;

static uint32_t read_memory(uint32_t address, uint8_t* buffer, uint32_t num_bytes, rc_client_t* client) {
  (void)client;
  return js_read_memory(address, buffer, num_bytes);
}

static void server_call(const rc_api_request_t* request, rc_client_server_callback_t callback,
                        void* callback_data, rc_client_t* client) {
  (void)client;
  pending_req_t* req = (pending_req_t*)malloc(sizeof(pending_req_t));
  req->id = g_next_req_id++;
  req->callback = callback;
  req->callback_data = callback_data;
  req->next = g_pending;
  g_pending = req;
  /* request strings are only valid for the duration of this call — JS copies them */
  js_server_call(req->id, request->url, request->post_data, request->content_type);
}

EMSCRIPTEN_KEEPALIVE
void rcw_deliver(uint32_t req_id, const char* body, uint32_t body_length, int http_status_code) {
  pending_req_t** link = &g_pending;
  while (*link && (*link)->id != req_id) link = &(*link)->next;
  pending_req_t* req = *link;
  if (!req) return;
  *link = req->next;

  rc_api_server_response_t response;
  memset(&response, 0, sizeof(response));
  response.body = body;
  response.body_length = body_length;
  response.http_status_code = http_status_code;
  req->callback(&response, req->callback_data);
  free(req);
}

static void log_message(const char* message, const rc_client_t* client) {
  (void)client;
  js_log(message);
}

static void libretro_message(const char* message) {
  js_log(message);
}

static void on_complete(int result, const char* error_message, rc_client_t* client, void* userdata) {
  (void)client;
  js_on_complete((uint32_t)(uintptr_t)userdata, result, error_message);
}

static void event_handler(const rc_client_event_t* event, rc_client_t* client) {
  sb_t sbv = {0}; sb_t* sb = &sbv;
  int first = 1;
  (void)client;

  sb_raw(sb, "{");
  KV_NUM("type", event->type);

  if (event->achievement) { sb_key(sb, &first, "achievement"); json_achievement(sb, event->achievement); }
  if (event->leaderboard) {
    sb_key(sb, &first, "leaderboard");
    { int first = 1; sb_raw(sb, "{");
      KV_STR("title", event->leaderboard->title);
      KV_STR("trackerValue", event->leaderboard->tracker_value);
      sb_raw(sb, "}"); }
  }
  if (event->leaderboard_tracker) {
    sb_key(sb, &first, "tracker");
    { int first = 1; sb_raw(sb, "{");
      KV_NUM("id", event->leaderboard_tracker->id);
      KV_STR("display", event->leaderboard_tracker->display);
      sb_raw(sb, "}"); }
  }
  if (event->leaderboard_scoreboard) {
    sb_key(sb, &first, "scoreboard");
    { int first = 1; sb_raw(sb, "{");
      KV_STR("bestScore", event->leaderboard_scoreboard->best_score);
      KV_NUM("newRank", event->leaderboard_scoreboard->new_rank);
      KV_NUM("numEntries", event->leaderboard_scoreboard->num_entries);
      sb_raw(sb, "}"); }
  }
  if (event->server_error) {
    sb_key(sb, &first, "serverError");
    { int first = 1; sb_raw(sb, "{");
      KV_STR("message", event->server_error->error_message);
      sb_raw(sb, "}"); }
  }
  if (event->subset) {
    sb_key(sb, &first, "subset");
    { int first = 1; sb_raw(sb, "{");
      KV_STR("title", event->subset->title);
      KV_STR("badgeUrl", event->subset->badge_url);
      sb_raw(sb, "}"); }
  }
  sb_raw(sb, "}");

  js_on_event(sb_take(sb));
  free(sb->buf);
}

/* ── hash file reader (backed by in-memory ROM buffers on the JS side) ──── */

static void* file_open(const char* path) {
  uint32_t handle = js_file_open(path);
  return handle ? (void*)(uintptr_t)handle : NULL;
}
static void file_seek(void* h, int64_t offset, int origin) { js_file_seek((uint32_t)(uintptr_t)h, (double)offset, origin); }
static int64_t file_tell(void* h) { return (int64_t)js_file_tell((uint32_t)(uintptr_t)h); }
static size_t file_read(void* h, void* buffer, size_t n) { return js_file_read((uint32_t)(uintptr_t)h, buffer, (uint32_t)n); }
static void file_close(void* h) { js_file_close((uint32_t)(uintptr_t)h); }

static void hash_message(const char* message, const rc_hash_iterator_t* iterator) {
  (void)iterator;
  js_log(message);
}

/* File access and CHD support, shared by rc_client's hashing and rcw_generate_hash. */
static void init_hash_callbacks(rc_hash_callbacks_t* callbacks) {
  callbacks->error_message = hash_message;
  callbacks->filereader.open = file_open;
  callbacks->filereader.seek = file_seek;
  callbacks->filereader.tell = file_tell;
  callbacks->filereader.read = file_read;
  callbacks->filereader.close = file_close;
  rcw_get_cdreader(&callbacks->cdreader);
}

/* ── exported API ───────────────────────────────────────────────────────── */

EMSCRIPTEN_KEEPALIVE
int rcw_init(int log_level) {
  if (g_client) return 1;
  g_client = rc_client_create(read_memory, server_call);
  if (!g_client) return 0;

  rc_client_enable_logging(g_client, log_level, log_message);
  /* rc_libretro reports each memory region it registers — invaluable when a
   * core's layout doesn't match what an achievement set expects. */
  if (log_level >= RC_CLIENT_LOG_LEVEL_INFO) rc_libretro_init_verbose_message_callback(libretro_message);
  rc_client_set_event_handler(g_client, event_handler);

  rc_hash_callbacks_t callbacks;
  memset(&callbacks, 0, sizeof(callbacks));
  callbacks.verbose_message = log_level >= RC_CLIENT_LOG_LEVEL_VERBOSE ? hash_message : NULL;
  init_hash_callbacks(&callbacks);
  rc_client_set_hash_callbacks(g_client, &callbacks);
  return 1;
}

EMSCRIPTEN_KEEPALIVE void rcw_set_hardcore(int enabled) { rc_client_set_hardcore_enabled(g_client, enabled); }

EMSCRIPTEN_KEEPALIVE
void rcw_login_password(const char* username, const char* password, uint32_t req_id) {
  rc_client_begin_login_with_password(g_client, username, password, on_complete, (void*)(uintptr_t)req_id);
}

EMSCRIPTEN_KEEPALIVE
void rcw_login_token(const char* username, const char* token, uint32_t req_id) {
  rc_client_begin_login_with_token(g_client, username, token, on_complete, (void*)(uintptr_t)req_id);
}

EMSCRIPTEN_KEEPALIVE void rcw_logout(void) { rc_client_logout(g_client); }

EMSCRIPTEN_KEEPALIVE
char* rcw_user_json(void) {
  const rc_client_user_t* u = rc_client_get_user_info(g_client);
  sb_t sbv = {0}; sb_t* sb = &sbv;
  int first = 1;
  if (!u) { sb_raw(sb, "null"); return sb_take(sb); }
  sb_raw(sb, "{");
  KV_STR("displayName", u->display_name);
  KV_STR("username", u->username);
  KV_STR("token", u->token);
  sb_raw(sb, "}");
  return sb_take(sb);
}

EMSCRIPTEN_KEEPALIVE
void rcw_identify_and_load_game(uint32_t console_id, const char* path, uint32_t req_id) {
  rc_client_begin_identify_and_load_game(g_client, console_id, path, NULL, 0, on_complete, (void*)(uintptr_t)req_id);
}

EMSCRIPTEN_KEEPALIVE
void rcw_change_media(const char* path, uint32_t req_id) {
  rc_client_begin_identify_and_change_media(g_client, path, NULL, 0, on_complete, (void*)(uintptr_t)req_id);
}

EMSCRIPTEN_KEEPALIVE void rcw_unload_game(void) { rc_client_unload_game(g_client); }
EMSCRIPTEN_KEEPALIVE int  rcw_is_game_loaded(void) { return rc_client_is_game_loaded(g_client); }

/* Hash a file without loading it (the library's achievements view). */
EMSCRIPTEN_KEEPALIVE
char* rcw_generate_hash(uint32_t console_id, const char* path) {
  rc_hash_iterator_t iterator;
  char hash[33];
  char* out = NULL;
  memset(&iterator, 0, sizeof(iterator));
  rc_hash_initialize_iterator(&iterator, path, NULL, 0);
  init_hash_callbacks(&iterator.callbacks);
  if (rc_hash_generate(hash, console_id, &iterator)) {
    out = (char*)malloc(33);
    memcpy(out, hash, 33);
  }
  rc_hash_destroy_iterator(&iterator);
  return out;
}

EMSCRIPTEN_KEEPALIVE
char* rcw_game_json(void) {
  const rc_client_game_t* g = rc_client_get_game_info(g_client);
  sb_t sbv = {0}; sb_t* sb = &sbv;
  int first = 1;
  if (!g) { sb_raw(sb, "null"); return sb_take(sb); }

  rc_client_user_game_summary_t summary;
  memset(&summary, 0, sizeof(summary));
  rc_client_get_user_game_summary(g_client, &summary);

  sb_raw(sb, "{");
  KV_NUM("id", g->id);
  KV_STR("title", g->title);
  KV_STR("hash", g->hash);
  KV_STR("badgeUrl", g->badge_url);
  sb_key(sb, &first, "summary");
  { int first = 1; sb_raw(sb, "{");
    KV_NUM("numCoreAchievements", summary.num_core_achievements);
    KV_NUM("numUnlockedAchievements", summary.num_unlocked_achievements);
    KV_NUM("pointsCore", summary.points_core);
    KV_NUM("pointsUnlocked", summary.points_unlocked);
    sb_raw(sb, "}"); }
  sb_raw(sb, "}");
  return sb_take(sb);
}

EMSCRIPTEN_KEEPALIVE
char* rcw_achievement_list_json(int category, int grouping) {
  rc_client_achievement_list_t* list = rc_client_create_achievement_list(g_client, category, grouping);
  sb_t sbv = {0}; sb_t* sb = &sbv;
  sb_raw(sb, "[");
  for (uint32_t i = 0; list && i < list->num_buckets; ++i) {
    const rc_client_achievement_bucket_t* b = &list->buckets[i];
    int first = 1;
    if (i) sb_raw(sb, ",");
    sb_raw(sb, "{");
    KV_STR("label", b->label);
    KV_NUM("bucketType", b->bucket_type);
    KV_NUM("subsetId", b->subset_id);
    sb_key(sb, &first, "achievements");
    sb_raw(sb, "[");
    for (uint32_t j = 0; j < b->num_achievements; ++j) {
      if (j) sb_raw(sb, ",");
      json_achievement(sb, b->achievements[j]);
    }
    sb_raw(sb, "]}");
  }
  sb_raw(sb, "]");
  if (list) rc_client_destroy_achievement_list(list);
  return sb_take(sb);
}

EMSCRIPTEN_KEEPALIVE void rcw_do_frame(void) { rc_client_do_frame(g_client); }
EMSCRIPTEN_KEEPALIVE void rcw_idle(void) { rc_client_idle(g_client); }
EMSCRIPTEN_KEEPALIVE void rcw_reset(void) { rc_client_reset(g_client); }

/* Returns -1 when pausing is allowed, otherwise the frames until it will be. */
EMSCRIPTEN_KEEPALIVE
int rcw_can_pause(void) {
  uint32_t frames_remaining = 0;
  return rc_client_can_pause(g_client, &frames_remaining) ? -1 : (int)frames_remaining;
}

EMSCRIPTEN_KEEPALIVE
char* rcw_user_agent_clause(void) {
  char* buf = (char*)malloc(64);
  buf[0] = '\0';
  rc_client_get_user_agent_clause(g_client, buf, 64);
  return buf;
}

EMSCRIPTEN_KEEPALIVE uint32_t rcw_progress_size(void) { return (uint32_t)rc_client_progress_size(g_client); }

EMSCRIPTEN_KEEPALIVE
int rcw_serialize_progress(uint8_t* buffer, uint32_t size) {
  return rc_client_serialize_progress_sized(g_client, buffer, size);
}

EMSCRIPTEN_KEEPALIVE
int rcw_deserialize_progress(const uint8_t* buffer, uint32_t size) {
  return rc_client_deserialize_progress_sized(g_client, buffer, size);
}

/* ── memory mapping (rc_libretro) ───────────────────────────────────────── */

static rc_libretro_memory_regions_t g_regions;

static void core_memory_info(uint32_t id, rc_libretro_core_memory_info_t* info) {
  uint32_t out[2] = {0, 0};
  js_core_memory_info(id, out);
  info->data = (uint8_t*)(uintptr_t)out[0];
  info->size = out[1];
}

/* Descriptors arrive as a flat uint32 array, 7 words each:
 * flags, ptr, offset, start, select, disconnect, len. Pass count 0 to use
 * the core's SYSTEM_RAM / SAVE_RAM / VIDEO_RAM blocks directly. */
EMSCRIPTEN_KEEPALIVE
int rcw_memory_init(uint32_t console_id, const uint32_t* words, uint32_t count) {
  struct retro_memory_descriptor descs[32];
  struct retro_memory_map mmap;
  uint32_t i;

  if (count > 32) count = 32;
  memset(descs, 0, sizeof(descs));
  for (i = 0; i < count; ++i) {
    const uint32_t* w = &words[i * 7];
    descs[i].flags = w[0];
    descs[i].ptr = (void*)(uintptr_t)w[1];
    descs[i].offset = w[2];
    descs[i].start = w[3];
    descs[i].select = w[4];
    descs[i].disconnect = w[5];
    descs[i].len = w[6];
  }
  mmap.descriptors = descs;
  mmap.num_descriptors = count;

  return rc_libretro_memory_init(&g_regions, count ? &mmap : NULL, core_memory_info, console_id);
}

EMSCRIPTEN_KEEPALIVE uint32_t rcw_memory_region_count(void) { return g_regions.count; }
EMSCRIPTEN_KEEPALIVE uint32_t rcw_memory_region_ptr(uint32_t i) { return i < g_regions.count ? (uint32_t)(uintptr_t)g_regions.data[i] : 0; }
EMSCRIPTEN_KEEPALIVE uint32_t rcw_memory_region_size(uint32_t i) { return i < g_regions.count ? (uint32_t)g_regions.size[i] : 0; }

/* ── hardcore setting validation (rc_libretro) ──────────────────────────── */

EMSCRIPTEN_KEEPALIVE
int rcw_is_setting_allowed(const char* library_name, uint32_t console_id, const char* key, const char* value) {
  const rc_disallowed_setting_t* settings = rc_libretro_get_disallowed_settings(library_name);
  if (settings && !rc_libretro_is_setting_allowed(settings, key, value)) return 0;
  settings = rc_libretro_get_disallowed_settings_for_system(library_name, console_id);
  if (settings && !rc_libretro_is_setting_allowed(settings, key, value)) return 0;
  return 1;
}
