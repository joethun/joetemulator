const GAME_DIR = 'games';
const WRITE_CHUNK_SIZE = 64 * 1024 * 1024; // 64mb chunks

// cached directory handle for performance
let dirHandle: FileSystemDirectoryHandle | null = null;

// get directory with caching
async function getDir(): Promise<FileSystemDirectoryHandle> {
  if (!dirHandle) {
    const root = await navigator.storage.getDirectory();
    dirHandle = await root.getDirectoryHandle(GAME_DIR, { create: true });
  }
  return dirHandle;
}

// save file in chunks for large files
export async function saveGameFile(
  gameId: number,
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> {
  const dir = await getDir();
  const handle = await dir.getFileHandle(`${gameId}.rom`, { create: true });
  const writable = await handle.createWritable();

  try {
    const size = file.size;
    let offset = 0;

    // write file in chunks
    while (offset < size) {
      const end = Math.min(offset + WRITE_CHUNK_SIZE, size);
      const chunk = file.slice(offset, end);

      await writable.write(chunk);
      offset = end;

      if (onProgress) {
        onProgress(Math.round((offset / size) * 100));
      }

      // yield to browser
      if (offset < size) {
        await new Promise(r => setTimeout(r, 0));
      }
    }

    await writable.close();
  } catch (error) {
    await writable.abort();
    throw error;
  }
}

// direct file read
export async function getGameFile(gameId: number): Promise<File | null> {
  try {
    const dir = await getDir();
    const handle = await dir.getFileHandle(`${gameId}.rom`);
    return await handle.getFile();
  } catch (error) {
    if ((error as any).name === 'NotFoundError') return null;
    throw error;
  }
}

// remove game file
export async function deleteGameFile(gameId: number): Promise<void> {
  try {
    const dir = await getDir();
    await dir.removeEntry(`${gameId}.rom`);
  } catch (error) {
    if ((error as any).name !== 'NotFoundError') throw error;
  }
}