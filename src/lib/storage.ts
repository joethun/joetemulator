// Optimized OPFS with chunked writing for large files
// This prevents UI blocking on slower devices like Chromebooks
const GAME_DIR = 'games';
const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks

// Cached directory handle
let gamesDirCache: FileSystemDirectoryHandle | null = null;

// Track progress callbacks for uploads
const progressCallbacks = new Map<number, (progress: number) => void>();

function isOPFSSupported(): boolean {
  return typeof navigator !== 'undefined' && 
         'storage' in navigator && 
         'getDirectory' in navigator.storage;
}

async function getGamesDirectory(): Promise<FileSystemDirectoryHandle> {
  if (gamesDirCache) return gamesDirCache;
  
  const root = await navigator.storage.getDirectory();
  gamesDirCache = await root.getDirectoryHandle(GAME_DIR, { create: true });
  return gamesDirCache;
}

// Save file with chunked writing to avoid blocking on large files
export async function saveGameFile(
  gameId: number, 
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> {
  const gamesDir = await getGamesDirectory();
  const fileHandle = await gamesDir.getFileHandle(`${gameId}.rom`, { create: true });
  const writable = await fileHandle.createWritable();
  
  try {
    const fileSize = file.size;
    let bytesWritten = 0;
    
    // Write in chunks to avoid blocking
    while (bytesWritten < fileSize) {
      const chunk = file.slice(bytesWritten, bytesWritten + CHUNK_SIZE);
      await writable.write(chunk);
      bytesWritten += chunk.size;
      
      // Report progress
      const progress = Math.round((bytesWritten / fileSize) * 100);
      if (onProgress) onProgress(progress);
      
      // Yield to event loop to prevent blocking UI
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    await writable.close();
    if (onProgress) onProgress(100);
  } catch (error) {
    await writable.abort();
    throw error;
  }
}

// Save file in background (non-blocking version)
export async function saveGameFileAsync(
  gameId: number,
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> {
  return saveGameFile(gameId, file, onProgress).catch(error => {
    console.error(`Background save failed for game ${gameId}:`, error);
    throw error;
  });
}

// Get file - direct read
export async function getGameFile(gameId: number): Promise<File | null> {
  try {
    const gamesDir = await getGamesDirectory();
    const fileHandle = await gamesDir.getFileHandle(`${gameId}.rom`);
    return await fileHandle.getFile();
  } catch (error) {
    if ((error as any).name === 'NotFoundError') {
      return null;
    }
    throw error;
  }
}

// Delete file
export async function deleteGameFile(gameId: number): Promise<void> {
  try {
    const gamesDir = await getGamesDirectory();
    await gamesDir.removeEntry(`${gameId}.rom`);
  } catch (error) {
    if ((error as any).name === 'NotFoundError') {
      return;
    }
    throw error;
  }
}

// Fast existence check
export async function gameFileExists(gameId: number): Promise<boolean> {
  try {
    const gamesDir = await getGamesDirectory();
    await gamesDir.getFileHandle(`${gameId}.rom`);
    return true;
  } catch {
    return false;
  }
}

// List all game files
export async function listAllGameFiles(): Promise<string[]> {
  try {
    const gamesDir = await getGamesDirectory();
    const files: string[] = [];
    // @ts-ignore
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

export function canUseOPFS(): boolean {
  return isOPFSSupported();
}

// Storage stats
export async function getStorageStats(): Promise<{
  totalGames: number;
  totalSize: number;
  games: Array<{ id: string; size: number; name: string }>;
}> {
  try {
    const gamesDir = await getGamesDirectory();
    const games: Array<{ id: string; size: number; name: string }> = [];
    let totalSize = 0;

    // @ts-ignore
    for await (const [name, entry] of gamesDir.entries()) {
      if (entry.kind === 'file') {
        const file = await entry.getFile();
        games.push({
          id: name.replace('.rom', ''),
          size: file.size,
          name: file.name
        });
        totalSize += file.size;
      }
    }

    return {
      totalGames: games.length,
      totalSize,
      games
    };
  } catch (error) {
    console.error('Failed to get storage stats:', error);
    return { totalGames: 0, totalSize: 0, games: [] };
  }
}

// Debug logging
export async function debugLogAllGames(): Promise<void> {
  const stats = await getStorageStats();
  console.log('=== OPFS Storage Debug ===');
  console.log(`Total Games: ${stats.totalGames}`);
  console.log(`Total Size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log('Games:');
  stats.games.forEach(game => {
    console.log(`  - ID: ${game.id}, Size: ${(game.size / 1024).toFixed(2)} KB, Name: ${game.name}`);
  });
  console.log('========================');
}