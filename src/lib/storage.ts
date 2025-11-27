const GAME_DIR = 'games';
const WRITE_CHUNK_SIZE = 64 * 1024 * 1024; // 64mb chunks

// cache directory handle for performance
let dirHandle: FileSystemDirectoryHandle | null = null;

// retrieve directory with caching
async function getDir(): Promise<FileSystemDirectoryHandle> {
  if (!dirHandle) {
    const root = await navigator.storage.getDirectory();
    dirHandle = await root.getDirectoryHandle(GAME_DIR, { create: true });
  }
  return dirHandle;
}

// chunked writing for large files
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

    // process file in chunks
    while (offset < size) {
      const end = Math.min(offset + WRITE_CHUNK_SIZE, size);
      const chunk = file.slice(offset, end);

      await writable.write(chunk);
      offset = end;

      if (onProgress) {
        onProgress(Math.round((offset / size) * 100));
      }

      // yield to event loop
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

// check if file exists
export async function gameFileExists(gameId: number): Promise<boolean> {
  try {
    const dir = await getDir();
    await dir.getFileHandle(`${gameId}.rom`);
    return true;
  } catch {
    return false;
  }
}

// list all game file ids
export async function listAllGameFiles(): Promise<number[]> {
  try {
    const dir = await getDir();
    const ids: number[] = [];
    // @ts-ignore iteration supported in modern browsers
    for await (const [name] of dir.entries()) {
      if (name.endsWith('.rom')) {
        const id = parseInt(name.replace('.rom', ''));
        if (!isNaN(id)) ids.push(id);
      }
    }
    return ids;
  } catch {
    return [];
  }
}

// calculate storage statistics
export async function getStorageStats(): Promise<{
  totalGames: number;
  totalSize: number;
  games: Array<{ id: number; size: number; name: string }>;
}> {
  try {
    const dir = await getDir();
    const games: Array<{ id: number; size: number; name: string }> = [];
    let totalSize = 0;

    // @ts-ignore
    for await (const [name, entry] of dir.entries()) {
      if (entry.kind === 'file' && name.endsWith('.rom')) {
        const file = await entry.getFile();
        const id = parseInt(name.replace('.rom', ''));
        if (!isNaN(id)) {
          games.push({ id, size: file.size, name: file.name });
          totalSize += file.size;
        }
      }
    }

    return { totalGames: games.length, totalSize, games };
  } catch {
    return { totalGames: 0, totalSize: 0, games: [] };
  }
}

// check opfs browser support
export function isOPFSSupported(): boolean {
  return typeof navigator !== 'undefined' &&
    'storage' in navigator &&
    'getDirectory' in navigator.storage;
}

// get available storage quota
export async function getStorageQuota(): Promise<{ usage: number; quota: number; available: number }> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    return { usage, quota, available: quota - usage };
  }
  return { usage: 0, quota: 0, available: 0 };
}