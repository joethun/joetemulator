const GAME_DIR = 'games';
const CHUNK_SIZE = 64 * 1024 * 1024;

let dirHandle: FileSystemDirectoryHandle | null = null;

async function getDir(): Promise<FileSystemDirectoryHandle> {
  if (!dirHandle) {
    const root = await navigator.storage.getDirectory();
    dirHandle = await root.getDirectoryHandle(GAME_DIR, { create: true });
  }
  return dirHandle;
}

const romName = (id: number) => `${id}.rom`;

export async function saveGameFile(gameId: number, file: File, onProgress?: (percent: number) => void): Promise<void> {
  const dir = await getDir();
  const writable = await (await dir.getFileHandle(romName(gameId), { create: true })).createWritable();

  try {
    for (let offset = 0; offset < file.size; offset += CHUNK_SIZE) {
      const end = Math.min(offset + CHUNK_SIZE, file.size);
      await writable.write(file.slice(offset, end));
      onProgress?.(Math.round((end / file.size) * 100));
      if (end < file.size) await new Promise(r => setTimeout(r, 0));
    }
    await writable.close();
  } catch (error) {
    await writable.abort();
    throw error;
  }
}

export async function getGameFile(gameId: number): Promise<File | null> {
  try {
    return await (await (await getDir()).getFileHandle(romName(gameId))).getFile();
  } catch (e) {
    if ((e as DOMException).name === 'NotFoundError') return null;
    throw e;
  }
}

export async function deleteGameFile(gameId: number): Promise<void> {
  try {
    const dir = await getDir();
    await dir.removeEntry(romName(gameId));
  } catch (e) {
    if ((e as DOMException).name !== 'NotFoundError') throw e;
  }
}

export async function migrateLegacyRoms(games: any[]): Promise<void> {
  const MIGRATED_KEY = 'joet_emulator_roms_migrated';
  if (localStorage.getItem(MIGRATED_KEY) === 'true') return;

  for (const game of games.filter(g => g.fileData)) {
    try {
      const resp = await fetch(game.fileData);
      const blob = await resp.blob();
      await saveGameFile(game.id, new File([blob], game.fileName || game.title, { type: 'application/octet-stream' }));
    } catch (e) {
      console.error(`Migration failed for ${game.title}:`, e);
    }
  }
  localStorage.setItem(MIGRATED_KEY, 'true');
}