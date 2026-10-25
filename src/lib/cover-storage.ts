import { useEffect, useState } from 'react';
import { opfsDir, removeByPrefix, writeFile } from '@/lib/opfs';

// Covers the user uploads live in OPFS beside the ROMs. The library record
// (localStorage, ~5 MB quota) keeps only a `custom-cover:<gameId>:<version>`
// reference — a base64 data URL there filled the quota after a few images and
// the library silently stopped persisting.

const COVER_DIR = 'covers';
const REF_PREFIX = 'custom-cover:';

const getDir = () => opfsDir(COVER_DIR);

export const isCustomCoverRef = (src: string | undefined): src is string =>
    !!src?.startsWith(REF_PREFIX);

// `custom-cover:12:1700000000000` ↔ `12-1700000000000`. The version changes on
// every upload, so a replaced cover gets a new src and a new object URL.
const fileNameForRef = (ref: string) => ref.slice(REF_PREFIX.length).replace(':', '-');

// Object URLs by ref. Settled URLs are also kept synchronously so a remounted
// card renders its cover on the first frame instead of flashing a placeholder.
const pending = new Map<string, Promise<string | null>>();
const settled = new Map<string, string | null>();

function resolveCustomCover(ref: string): Promise<string | null> {
    let p = pending.get(ref);
    if (!p) {
        p = getDir()
            .then(dir => dir.getFileHandle(fileNameForRef(ref)))
            .then(handle => handle.getFile())
            .then(file => URL.createObjectURL(file))
            .catch(e => { console.warn('custom cover unavailable:', ref, e); return null; })
            .then(url => { settled.set(ref, url); return url; });
        pending.set(ref, p);
    }
    return p;
}

function forgetGame(gameId: number): void {
    const prefix = `${REF_PREFIX}${gameId}:`;
    for (const [ref, url] of settled) {
        if (!ref.startsWith(prefix)) continue;
        if (url) URL.revokeObjectURL(url);
        settled.delete(ref);
    }
    for (const ref of pending.keys()) {
        if (ref.startsWith(prefix)) pending.delete(ref);
    }
}

const removeCoverFiles = async (gameId: number, keep?: string) =>
    removeByPrefix(await getDir(), `${gameId}-`, keep);

/** Remove every stored custom cover of a game. */
export async function deleteCustomCover(gameId: number): Promise<void> {
    forgetGame(gameId);
    await removeCoverFiles(gameId);
}

async function writeCover(gameId: number, version: number, image: Blob): Promise<string> {
    const ref = `${REF_PREFIX}${gameId}:${version}`;
    await writeFile(await getDir(), fileNameForRef(ref), image);
    return ref;
}

/** Store `image` as the game's custom cover, replacing any previous one, and
 *  return the reference to keep in `Game.coverArt`. */
export async function saveCustomCover(gameId: number, image: Blob): Promise<string> {
    const ref = await writeCover(gameId, Date.now(), image);
    forgetGame(gameId);
    // The new cover already landed; a leftover old file only wastes space.
    await removeCoverFiles(gameId, fileNameForRef(ref))
        .catch(e => console.warn('failed to remove old covers:', e));
    return ref;
}

/**
 * Display URL for a `Game.coverArt` value: remote URLs pass through, custom
 * cover references resolve to an object URL. `undefined` while a reference is
 * still resolving, `null` when there is no cover or its file is missing.
 */
export function useCoverSrc(src: string | undefined): string | null | undefined {
    const [resolved, setResolved] = useState<{ ref: string; url: string | null } | null>(null);

    useEffect(() => {
        if (!isCustomCoverRef(src) || settled.has(src)) return;
        let live = true;
        void resolveCustomCover(src).then(url => { if (live) setResolved({ ref: src, url }); });
        return () => { live = false; };
    }, [src]);

    if (!isCustomCoverRef(src)) return src ?? null;
    if (settled.has(src)) return settled.get(src);
    return resolved?.ref === src ? resolved.url : undefined;
}

/** Move a legacy data-URL cover into OPFS. Returns the new reference, or the
 *  original value when it isn't a data URL or the move failed. Always writes
 *  version 0 and removes nothing, so overlapping runs (StrictMode re-runs the
 *  library load) converge on the same file instead of deleting each other's. */
export async function migrateDataUrlCover(gameId: number, coverArt: string | undefined): Promise<string | undefined> {
    if (!coverArt?.startsWith('data:')) return coverArt;
    try {
        return await writeCover(gameId, 0, await (await fetch(coverArt)).blob());
    } catch (e) {
        console.error('cover migration failed:', e);
        return coverArt;
    }
}
