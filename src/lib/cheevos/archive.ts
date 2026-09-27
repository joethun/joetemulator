import { consoleIdFor } from '@/lib/cheevos/consoles';
import { extractRomFromZip, fileExt, rankRomEntries } from '@/lib/files';
import { extractArchive } from '@/lib/ra/loader';

type GameFile = { name: string; bytes: Uint8Array };

/** RA hashes these consoles' archives as-is: arcade by the zip's file name,
 *  MS-DOS by the zip's contents (rhash's own zip hasher). */
const HASH_ARCHIVE_AS_IS = new Set([26, 27]);

/**
 * Cartridge games stored as a .zip/.7z are hashed by the ROM inside, the way
 * RetroArch decompresses content before identifying it — hashing the archive
 * itself never matches RetroAchievements' database. Returns the files and
 * boot path the hasher should see (unchanged when there's nothing to unpack)
 * and the RA console, refined by the unpacked ROM (a zipped .gbc is GBC).
 */
export async function unpackForHashing(
    files: GameFile[], bootPath: string, system: string,
): Promise<{ files: GameFile[]; bootPath: string; consoleId: number | null }> {
    const primary = files[0];
    const consoleId = consoleIdFor(system, primary?.name ?? bootPath);
    const ext = primary && fileExt(primary.name);
    if (!primary || (ext !== 'zip' && ext !== '7z') || (consoleId != null && HASH_ARCHIVE_AS_IS.has(consoleId))) {
        return { files, bootPath, consoleId };
    }

    let rom: GameFile | null = null;
    try {
        if (ext === 'zip') {
            rom = await extractRomFromZip(new File([primary.bytes as Uint8Array<ArrayBuffer>], primary.name));
        } else {
            const members = await extractArchive(primary.bytes);
            const best = rankRomEntries([...members].map(([path, bytes]) => ({ path, size: bytes.length, bytes })))[0];
            if (best) rom = { name: best.path, bytes: best.bytes };
        }
    } catch (e) {
        console.warn('Could not unpack archive for achievements:', e);
    }
    if (!rom) return { files, bootPath, consoleId };
    return {
        files: [rom, ...files.slice(1)],
        bootPath: '/' + rom.name,
        consoleId: consoleIdFor(system, rom.name) ?? consoleId,
    };
}
