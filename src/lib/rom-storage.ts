import { loadString, saveString } from '@/lib/local-storage';

const GAME_DIR = 'games';
const CHUNK_SIZE = 64 * 1024 * 1024;
const MIGRATED_KEY = 'joet_emulator_roms_migrated';

let dirHandle: FileSystemDirectoryHandle | null = null;

async function getDir(): Promise<FileSystemDirectoryHandle> {
    if (!dirHandle) {
        const root = await navigator.storage.getDirectory();
        dirHandle = await root.getDirectoryHandle(GAME_DIR, { create: true });
    }
    return dirHandle;
}

// Disc 0 keeps the legacy `${id}.rom` name so existing libraries stay valid.
const romName = (id: number, disc = 0) => disc ? `${id}.disc${disc}.rom` : `${id}.rom`;
const isNotFound = (e: unknown) => e instanceof DOMException && e.name === 'NotFoundError';

export async function saveGameFile(gameId: number, data: Blob | ReadableStream<Uint8Array>, onProgress?: (percent: number) => void, disc = 0): Promise<void> {
    const dir = await getDir();
    const writable = await (await dir.getFileHandle(romName(gameId, disc), { create: true })).createWritable();

    // A stream pipes straight to disk, one chunk in memory at a time; pipeTo
    // closes the destination on success and aborts it on failure.
    if (!(data instanceof Blob)) {
        await data.pipeTo(writable);
        return;
    }
    try {
        for (let offset = 0; offset < data.size; offset += CHUNK_SIZE) {
            const end = Math.min(offset + CHUNK_SIZE, data.size);
            await writable.write(data.slice(offset, end));
            onProgress?.(Math.round((end / data.size) * 100));
            if (end < data.size) await new Promise(r => setTimeout(r, 0));
        }
        await writable.close();
    } catch (error) {
        await writable.abort();
        throw error;
    }
}

export async function getGameFile(gameId: number, disc = 0): Promise<File | null> {
    try {
        return await (await (await getDir()).getFileHandle(romName(gameId, disc))).getFile();
    } catch (e) {
        if (isNotFound(e)) return null;
        throw e;
    }
}

/** Load every stored disc of a game, pairing disc slot `i` with `discNames[i]`
 *  (an empty name falls back to the OPFS file's own name). Missing discs are
 *  skipped with a warning. */
export async function getGameDiscs(gameId: number, discNames: string[]): Promise<Array<{ name: string; bytes: Uint8Array }>> {
    const discs = await Promise.all(discNames.map(async (name, disc) => {
        const file = await getGameFile(gameId, disc);
        if (!file) { console.warn('missing disc file:', name || gameId); return null; }
        return { name: name || file.name, bytes: new Uint8Array(await file.arrayBuffer()) };
    }));
    return discs.filter(d => d !== null);
}

export async function deleteGameFile(gameId: number): Promise<void> {
    const dir = await getDir();
    // `${id}.` prefix scan removes every disc of a multi-disc game in one pass.
    const prefix = `${gameId}.`;
    const names: string[] = [];
    for await (const name of dir.keys()) {
        if (name.startsWith(prefix)) names.push(name);
    }
    await Promise.all(names.map(async name => {
        try {
            await dir.removeEntry(name);
        } catch (e) {
            if (!isNotFound(e)) throw e;
        }
    }));
}

export async function migrateLegacyRoms(games: Array<{ id: number; title: string; fileName?: string; fileData?: string }>): Promise<void> {
    if (loadString(MIGRATED_KEY) === 'true') return;

    for (const game of games) {
        if (!game.fileData) continue;
        try {
            const blob = await (await fetch(game.fileData)).blob();
            await saveGameFile(
                game.id,
                new File([blob], game.fileName || game.title, { type: 'application/octet-stream' }),
            );
        } catch (e) {
            console.error(`Migration failed for ${game.title}:`, e);
        }
    }
    saveString(MIGRATED_KEY, 'true');
}
