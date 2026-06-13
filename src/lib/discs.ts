import { fileExt, isJunkPath, normalizeTitle } from '@/lib/files';
import { openZipEntry, readZipDirectory } from '@/lib/zip';
import { stripExt } from '@/lib/utils';
import type { ZipDiscRef } from '@/types';

/** File extensions that can be part of a CD-image disc set. */
const DISC_EXTS = new Set(['cue', 'ccd', 'toc', 'mdf', 'chd', 'pbp', 'iso', 'img', 'bin', 'sub']);

/** Descriptor files that reference companion track files (cue → bin, ccd → img/sub, …).
 *  When any are present, only descriptors belong in the playlist. */
const DESCRIPTOR_EXTS = new Set(['cue', 'ccd', 'toc', 'mdf']);

// "(Disc 1)", "[Disk 2]", "(CD 3 of 4)", "- disc1", … A separator is required
// before the keyword so titles like "ABCD 2" don't match.
const DISC_TAG = /(?:^|[\s._([-])(?:dis[ck]|cd)\s*[#._-]?\s*(\d+)(?:\s*of\s*\d+)?[)\]]?/i;

// "(Track 01)" — redump-style cue sheets split each disc into per-track .bin files.
const TRACK_TAG = /(?:^|[\s._([-])track\s*[#._-]?\s*\d+[)\]]?/i;

export function discNumber(name: string): number | null {
    const m = stripExt(name).match(DISC_TAG);
    return m ? parseInt(m[1], 10) : null;
}

/** Identity of a file ignoring disc/track tags and extension, for set grouping. */
const baseKey = (name: string) =>
    normalizeTitle(stripExt(name).replace(DISC_TAG, ' ').replace(TRACK_TAG, ' '));

/** The file names that belong in an .m3u playlist (descriptors when present,
 *  raw disc images otherwise), sorted by disc number. */
export function playlistEntries(names: string[]): string[] {
    const descriptors = names.filter(n => DESCRIPTOR_EXTS.has(fileExt(n)));
    const entries = descriptors.length
        ? descriptors
        : names.filter(n => DISC_EXTS.has(fileExt(n)) && fileExt(n) !== 'sub');
    return [...entries].sort((a, b) =>
        (discNumber(a) ?? 0) - (discNumber(b) ?? 0) || a.localeCompare(b));
}

export interface DiscSet<T extends { name: string } = File> {
    /** Game title with the disc tag stripped, e.g. "Final Fantasy VII (USA)". */
    title: string;
    /** Playlist entries (disc order) first, then companion track files. */
    files: T[];
}

function arrange<T extends { name: string }>(files: T[], entryNames: string[], title: string): DiscSet<T> {
    const byName = new Map(files.map(f => [f.name, f]));
    const entrySet = new Set(entryNames);
    return {
        title,
        files: [
            ...entryNames.map(n => byName.get(n)!),
            ...files.filter(f => !entrySet.has(f.name)),
        ],
    };
}

/**
 * Decide whether a multi-file selection is one multi-disc game (or one
 * cue/bin-style disc with its track files) rather than separate games: every
 * file must be a CD-image type sharing the same name once disc/track tags are
 * stripped, and each playlist entry must carry a disc number when there is
 * more than one.
 */
export function detectDiscSet<T extends { name: string }>(files: T[]): DiscSet<T> | null {
    if (files.length < 2) return null;
    if (!files.every(f => DISC_EXTS.has(fileExt(f.name)))) return null;

    const key = baseKey(files[0].name);
    if (!key || files.some(f => baseKey(f.name) !== key)) return null;

    const entryNames = playlistEntries(files.map(f => f.name));
    if (!entryNames.length) return null;
    if (entryNames.length > 1 && !entryNames.every(n => discNumber(n) !== null)) return null;

    const title = stripExt(entryNames[0])
        .replace(DISC_TAG, ' ')
        .replace(/\s{2,}/g, ' ')
        .replace(/[\s._-]+$/, '')
        .trim();

    return arrange(files, entryNames, title || stripExt(entryNames[0]));
}

export interface BootPlan {
    /** File name the core should boot from. */
    boot: string;
    /** Generated .m3u playlist to write alongside the discs, present when the
     *  set has more than one playlist entry. */
    m3u?: { name: string; content: string };
}

/** How a core should boot a set of rom files (primary first): a single file
 *  directly, or a multi-disc set from a generated .m3u over the disc entries
 *  (cue/chd/…; bin track files stay out of the playlist) so the core's
 *  disk-control interface can swap discs. The .m3u is named after disc 1 so
 *  the core writes the same .srm as playing that disc standalone. */
export function bootPlan(names: string[]): BootPlan {
    const entries = playlistEntries(names);
    if (entries.length < 2) return { boot: names[0] };
    const m3uName = stripExt(names[0]) + '.m3u';
    return { boot: m3uName, m3u: { name: m3uName, content: entries.join('\n') + '\n' } };
}

// Extras that ride along in rom-site zips (readmes, art, checksums) and can be
// dropped. A zip-internal .m3u is dropped too — the runtime generates its own.
export const IGNORABLE_EXTS = new Set([
    'txt', 'nfo', 'diz', 'md', 'htm', 'html', 'url',
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'pdf', 'sfv', 'md5', 'sha1', 'm3u',
]);

/**
 * If `file` is a zip of CD-image files (a zipped disc set), list its disc
 * entries in playlist order, titled after the zip itself — cores read cue/chd
 * files from the FS, not zips, so the discs upload as one game. Readme/art
 * extras are dropped. Nothing is extracted or even fully read here: only the
 * zip's central directory is parsed (ranged reads, a few KB), so the system
 * picker can open immediately; extraction happens later via zippedDiscSources.
 * Returns null when the file isn't a listable zip or holds any other content
 * (DOS games, zipped cartridge ROMs): those keep today's behavior of being
 * stored whole.
 */
export async function listZippedDiscs(file: File): Promise<DiscSet<ZipDiscRef> | null> {
    const entries = (await readZipDirectory(file))?.filter(e => !isJunkPath(e.path));
    if (!entries) return null;

    const discs = entries.filter(e => DISC_EXTS.has(fileExt(e.path)));
    if (!discs.length) return null;
    if (!entries.every(e => DISC_EXTS.has(fileExt(e.path)) || IGNORABLE_EXTS.has(fileExt(e.path)))) return null;

    const refs: ZipDiscRef[] = discs.map(e => ({ ...e, name: e.path.split('/').pop() ?? e.path }));
    const entryNames = playlistEntries(refs.map(r => r.name));
    return entryNames.length ? arrange(refs, entryNames, stripExt(file.name)) : null;
}

/** One disc of a game being uploaded: name and size known up front, content
 *  produced on demand (a plain file, or a zip entry extracted lazily). */
export interface DiscSource {
    name: string;
    /** Uncompressed size in bytes — drives upload progress weighting. */
    size: number;
    /** Materialize the disc: a Blob (plain file or stored zip entry — progress
     *  comes from whoever reads it), or a stream that inflates as it is
     *  consumed, reporting `onProgress` 0–100 against the uncompressed size. */
    open(onProgress?: (percent: number) => void): Promise<Blob | ReadableStream<Uint8Array>>;
}

/** Lazily-extracting sources for the discs listed by listZippedDiscs — each
 *  open() reads only its own entry's byte range, during the visible upload,
 *  not at drop time or while the system picker sits open. */
export function zippedDiscSources(zip: File, refs: ZipDiscRef[]): DiscSource[] {
    return refs.map(ref => ({
        name: ref.name,
        size: ref.size,
        open: onProgress => openZipEntry(zip, ref, onProgress),
    }));
}
