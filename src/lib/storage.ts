const DB_NAME = 'joetemulator';
const DB_VERSION = 1;
const STORE_NAME = 'gameFiles';

let dbPromise: Promise<IDBDatabase> | null = null;

// opens or returns existing db connection
function openDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('indexeddb not supported'));
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }
  return dbPromise;
}

// helper for transaction operations
async function executeStoreOperation<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], mode);
    const store = transaction.objectStore(STORE_NAME);
    let result: T;

    const request = operation(store);

    request.onerror = () => reject(request.error);
    
    // Capture the result immediately on success
    request.onsuccess = () => {
      result = request.result;
    };
    
    // Resolve only when the transaction fully completes.
    // This is the key to ensure the write lock is released before resolution.
    transaction.oncomplete = () => {
      // TEMPORARY DEBUG LOGGING: Shows when the transaction fully commits
      console.log(`[IDB] Transaction ${mode} completed.`); 
      resolve(result);
    };

    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(new Error('Transaction aborted'));
  });
}

// saves file to indexeddb
export async function saveGameFile(gameId: number, file: File): Promise<void> {
  try {
    await executeStoreOperation('readwrite', (store) => store.put(file, gameId));
  } catch (error) {
    console.error(`failed to save game ${gameId}:`, error);
    throw error;
  }
}

// retrieves file from indexeddb
export async function getGameFile(gameId: number): Promise<File | null> {
  try {
    const result = await executeStoreOperation('readonly', (store) => store.get(gameId));
    return result || null;
  } catch (error) {
    console.error(`failed to get game ${gameId}:`, error);
    return null;
  }
}

// deletes file from indexeddb
export async function deleteGameFile(gameId: number): Promise<void> {
  try {
    await executeStoreOperation('readwrite', (store) => store.delete(gameId));
  } catch (error) {
    console.error(`failed to delete game ${gameId}:`, error);
    throw error;
  }
}