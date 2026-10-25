// Origin Private File System helpers shared by the stores that keep files
// there (ROMs, save states, custom covers). Each store owns one top-level
// directory and only decides its file names.

export const isNotFound = (e: unknown) => e instanceof DOMException && e.name === 'NotFoundError';

const dirs = new Map<string, Promise<FileSystemDirectoryHandle>>();

/** A top-level OPFS directory, created on first use. The handle is cached; a
 *  failed lookup isn't, so the next call retries. */
export function opfsDir(name: string): Promise<FileSystemDirectoryHandle> {
    let p = dirs.get(name);
    if (!p) {
        p = navigator.storage.getDirectory()
            .then(root => root.getDirectoryHandle(name, { create: true }))
            .catch(e => { dirs.delete(name); throw e; });
        dirs.set(name, p);
    }
    return p;
}

/** The file, or null when it doesn't exist. */
export async function readFile(dir: FileSystemDirectoryHandle, name: string): Promise<File | null> {
    try {
        return await (await dir.getFileHandle(name)).getFile();
    } catch (e) {
        if (isNotFound(e)) return null;
        throw e;
    }
}

/** Create or replace a file. A failed write is aborted, leaving any previous
 *  contents in place. */
export async function writeFile(dir: FileSystemDirectoryHandle, name: string, data: Blob | Uint8Array): Promise<void> {
    // Emscripten heap views can be backed by a SharedArrayBuffer, which
    // FileSystemWritableFileStream refuses.
    const body = data instanceof Uint8Array && !(data.buffer instanceof ArrayBuffer)
        ? new Uint8Array(data)
        : data;
    const writable = await (await dir.getFileHandle(name, { create: true })).createWritable();
    try {
        await writable.write(body as Blob | Uint8Array<ArrayBuffer>);
        await writable.close();
    } catch (e) {
        await writable.abort();
        throw e;
    }
}

/** Remove files, ignoring any that are already gone. */
export async function removeFiles(dir: FileSystemDirectoryHandle, names: string[]): Promise<void> {
    await Promise.all(names.map(async name => {
        try { await dir.removeEntry(name); }
        catch (e) { if (!isNotFound(e)) throw e; }
    }));
}

/** Remove every file whose name starts with `prefix`, except `keep`. */
export async function removeByPrefix(dir: FileSystemDirectoryHandle, prefix: string, keep?: string): Promise<void> {
    const names: string[] = [];
    for await (const name of dir.keys()) {
        if (name.startsWith(prefix) && name !== keep) names.push(name);
    }
    await removeFiles(dir, names);
}
