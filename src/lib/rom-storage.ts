import { loadString, saveString } from '@/lib/local-storage';
import { opfsDir, readFile, removeByPrefix } from '@/lib/opfs';

const GAME_DIR = 'games';
const CHUNK_SIZE = 64 * 1024 * 1024;
const MIGRATED_KEY = 'joet_emulator_roms_migrated';

const getDir = () => opfsDir(GAME_DIR);

// Disc 0 keeps the legacy `${id}.rom` name so existing libraries stay valid.
const romName = (id: number, disc = 0) => disc ? `${id}.disc${disc}.rom` : `${id}.rom`;

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
    return readFile(await getDir(), romName(gameId, disc));
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
    // `${id}.` prefix scan removes every disc of a multi-disc game in one pass.
    await removeByPrefix(await getDir(), `${gameId}.`);
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
