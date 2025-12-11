const GAME_DIR = 'games';
const CHUNK_SIZE = 64 * 1024 * 1024;

let dirHandle: FileSystemDirectoryHandle | null = null;

async function getDir() {
  return dirHandle ||= await (await navigator.storage.getDirectory()).getDirectoryHandle(GAME_DIR, { create: true });
}

export async function saveGameFile(gameId: number, file: File, onProgress?: (p: number) => void) {
  const dir = await getDir();
  const writable = await (await dir.getFileHandle(`${gameId}.rom`, { create: true })).createWritable();

  try {
    const size = file.size;
    for (let offset = 0; offset < size; offset += CHUNK_SIZE) {
      await writable.write(file.slice(offset, Math.min(offset + CHUNK_SIZE, size)));
      onProgress?.(Math.round(((offset + CHUNK_SIZE) / size) * 100));
      if (offset + CHUNK_SIZE < size) await new Promise(r => setTimeout(r, 0));
    }
    await writable.close();
  } catch (e) {
    await writable.abort();
    throw e;
  }
}

export async function getGameFile(gameId: number): Promise<File | null> {
  try {
    return await (await (await getDir()).getFileHandle(`${gameId}.rom`)).getFile();
  } catch (e) {
    return (e as any).name === 'NotFoundError' ? null : (() => { throw e; })();
  }
}

export async function deleteGameFile(gameId: number) {
  try {
    await (await getDir()).removeEntry(`${gameId}.rom`);
  } catch (e) {
    if ((e as any).name !== 'NotFoundError') throw e;
  }
}