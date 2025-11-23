// OPFS-based storage - much faster than IndexedDB for large files
const GAME_DIR = 'games';

// Check if OPFS is supported
function isOPFSSupported(): boolean {
  return typeof navigator !== 'undefined' && 
         'storage' in navigator && 
         'getDirectory' in navigator.storage;
}

// Get the root directory handle
async function getRootDirectory(): Promise<FileSystemDirectoryHandle> {
  if (!isOPFSSupported()) {
    throw new Error('OPFS not supported in this browser');
  }
  return await navigator.storage.getDirectory();
}

// Get or create the games directory
async function getGamesDirectory(): Promise<FileSystemDirectoryHandle> {
  const root = await getRootDirectory();
  return await root.getDirectoryHandle(GAME_DIR, { create: true });
}

// Save file to OPFS
export async function saveGameFile(gameId: number, file: File): Promise<void> {
  try {
    const gamesDir = await getGamesDirectory();
    const fileHandle = await gamesDir.getFileHandle(`${gameId}.rom`, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(file);
    await writable.close();
  } catch (error) {
    console.error(`Failed to save game ${gameId}:`, error);
    throw error;
  }
}

// Retrieve file from OPFS
export async function getGameFile(gameId: number): Promise<File | null> {
  try {
    const gamesDir = await getGamesDirectory();
    const fileHandle = await gamesDir.getFileHandle(`${gameId}.rom`);
    return await fileHandle.getFile();
  } catch (error) {
    if ((error as any).name === 'NotFoundError') {
      return null;
    }
    console.error(`Failed to get game ${gameId}:`, error);
    return null;
  }
}

// Delete file from OPFS
export async function deleteGameFile(gameId: number): Promise<void> {
  try {
    const gamesDir = await getGamesDirectory();
    await gamesDir.removeEntry(`${gameId}.rom`);
  } catch (error) {
    if ((error as any).name === 'NotFoundError') {
      return; // Already deleted
    }
    console.error(`Failed to delete game ${gameId}:`, error);
    throw error;
  }
}

// Check if a game file exists
export async function gameFileExists(gameId: number): Promise<boolean> {
  try {
    const gamesDir = await getGamesDirectory();
    await gamesDir.getFileHandle(`${gameId}.rom`);
    return true;
  } catch {
    return false;
  }
}

// Get all game file names (for cleanup/debugging)
export async function listAllGameFiles(): Promise<string[]> {
  try {
    const gamesDir = await getGamesDirectory();
    const files: string[] = [];
    // @ts-ignore - TypeScript may not recognize async iteration on FileSystemDirectoryHandle
    for await (const [name, entry] of gamesDir.entries()) {
      if (entry.kind === 'file') {
        files.push(name);
      }
    }
    return files;
  } catch (error) {
    console.error('Failed to list games:', error);
    return [];
  }
}

// Fallback check - returns true if OPFS is available
export function canUseOPFS(): boolean {
  return isOPFSSupported();
}