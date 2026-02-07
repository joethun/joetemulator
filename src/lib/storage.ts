// opfs game storage using chunked writes for large files
const GAME_DIR = 'games';
const CHUNK_SIZE = 64 * 1024 * 1024;

let dirHandle: FileSystemDirectoryHandle | null = null;

/**
 * gets or creates the games directory handle
 */
async function getDir(): Promise<FileSystemDirectoryHandle> {
  if (!dirHandle) {
    const root = await navigator.storage.getDirectory();
    dirHandle = await root.getDirectoryHandle(GAME_DIR, { create: true });
  }
  return dirHandle;
}

/**
 * saves a game file to opfs with progress reporting
 */
export async function saveGameFile(
  gameId: number,
  file: File,
  onProgress?: (percent: number) => void
): Promise<void> {
  const dir = await getDir();
  const fileHandle = await dir.getFileHandle(`${gameId}.rom`, { create: true });
  const writable = await fileHandle.createWritable();

  try {
    const size = file.size;
    for (let offset = 0; offset < size; offset += CHUNK_SIZE) {
      const chunk = file.slice(offset, Math.min(offset + CHUNK_SIZE, size));
      await writable.write(chunk);
      onProgress?.(Math.round(((offset + CHUNK_SIZE) / size) * 100));

      // yield to main thread between chunks
      if (offset + CHUNK_SIZE < size) {
        await new Promise(r => setTimeout(r, 0));
      }
    }
    await writable.close();
  } catch (error) {
    await writable.abort();
    throw error;
  }
}

/**
 * retrieves a game file from opfs by id
 */
export async function getGameFile(gameId: number): Promise<File | null> {
  try {
    const dir = await getDir();
    const fileHandle = await dir.getFileHandle(`${gameId}.rom`);
    return await fileHandle.getFile();
  } catch (error) {
    if ((error as DOMException).name === 'NotFoundError') {
      return null;
    }
    throw error;
  }
}

/**
 * deletes a game file from opfs
 */
export async function deleteGameFile(gameId: number): Promise<void> {
  try {
    const dir = await getDir();
    await dir.removeEntry(`${gameId}.rom`);
  } catch (error) {
    // ignore not found errors
    if ((error as DOMException).name !== 'NotFoundError') {
      throw error;
    }
  }
}