import { crc32 } from '@/lib/crc32';

/**
 * Minimal zip implementation tailored to this app, replacing JSZip:
 *
 * - readZipDirectory lists entries by parsing the central directory with
 *   ranged reads — a few KB of I/O regardless of the zip's size, where JSZip
 *   must load the entire file into memory.
 * - openZipEntry extracts one entry: stored entries are disk-backed Blob
 *   slices (no memory, no CPU), deflated entries inflate through the native
 *   DecompressionStream as they are consumed.
 * - buildZip writes small stored-entry bundles (save-state exports).
 */

/** A file entry from a zip's central directory. */
export interface ZipDirEntry {
    /** Zip-internal path. */
    path: string;
    /** Uncompressed size in bytes. */
    size: number;
    /** Compressed size in bytes (equals `size` for stored entries). */
    compressedSize: number;
    /** Compression method: 0 = stored, 8 = deflate. Others are rejected. */
    method: number;
    /** Offset of the entry's local header within the file. */
    headerOffset: number;
}

const EOCD_SIG = 0x06054b50;       // end of central directory
const EOCD64_LOC_SIG = 0x07064b50; // zip64 EOCD locator
const EOCD64_SIG = 0x06064b50;     // zip64 EOCD record
const CEN_SIG = 0x02014b50;        // central directory file header
const LOC_SIG = 0x04034b50;        // local file header

// The EOCD record is 22 bytes plus a trailing comment of up to 65535 bytes.
const EOCD_SCAN_LEN = 22 + 0xFFFF;

// A disc-set zip holds a handful of entries; anything past these caps is some
// other kind of archive and can fall back to being stored whole.
const MAX_ENTRIES = 10_000;
const MAX_CD_BYTES = 16 * 1024 * 1024;

const view = async (file: File, start: number, end: number) =>
    new DataView(await file.slice(start, end).arrayBuffer());

/**
 * List a zip's file entries by parsing the central directory with ranged
 * reads. Suitable for drop time: a few KB of I/O regardless of the zip's
 * size.
 *
 * Returns null when the file isn't a zip, or uses features openZipEntry
 * can't extract (encryption, compression methods other than stored/deflate,
 * non-ASCII names without the UTF-8 flag, malformed or truncated records).
 * Callers treat null as "not a usable zip" and keep the file whole.
 */
export async function readZipDirectory(file: File): Promise<ZipDirEntry[] | null> {
    try {
        if (file.size < 22) return null;

        // Find the end-of-central-directory record by scanning back over the
        // (possibly present) archive comment.
        const tailStart = Math.max(0, file.size - EOCD_SCAN_LEN);
        const tail = await view(file, tailStart, file.size);
        let eocd = -1;
        for (let i = tail.byteLength - 22; i >= 0; i--) {
            if (tail.getUint32(i, true) === EOCD_SIG) { eocd = i; break; }
        }
        if (eocd < 0) return null;

        let count = tail.getUint16(eocd + 10, true);
        let cdSize: number = tail.getUint32(eocd + 12, true);
        let cdOffset: number = tail.getUint32(eocd + 16, true);

        // ZIP64: the real values live in a separate record, found via a
        // locator sitting immediately before the EOCD.
        if (count === 0xFFFF || cdSize === 0xFFFFFFFF || cdOffset === 0xFFFFFFFF) {
            const locStart = tailStart + eocd - 20;
            if (locStart < 0) return null;
            const loc = await view(file, locStart, locStart + 20);
            if (loc.getUint32(0, true) !== EOCD64_LOC_SIG) return null;
            const recStart = Number(loc.getBigUint64(8, true));
            const rec = await view(file, recStart, recStart + 56);
            if (rec.byteLength < 56 || rec.getUint32(0, true) !== EOCD64_SIG) return null;
            count = Number(rec.getBigUint64(32, true));
            cdSize = Number(rec.getBigUint64(40, true));
            cdOffset = Number(rec.getBigUint64(48, true));
        }
        if (count > MAX_ENTRIES || cdSize > MAX_CD_BYTES || cdOffset + cdSize > file.size) return null;

        const cd = await view(file, cdOffset, cdOffset + cdSize);
        const utf8 = new TextDecoder('utf-8', { fatal: true });
        const entries: ZipDirEntry[] = [];
        let p = 0;
        for (let i = 0; i < count; i++) {
            if (p + 46 > cd.byteLength || cd.getUint32(p, true) !== CEN_SIG) return null;
            const flags = cd.getUint16(p + 8, true);
            const method = cd.getUint16(p + 10, true);
            let compressedSize = cd.getUint32(p + 20, true);
            let size = cd.getUint32(p + 24, true);
            const nameLen = cd.getUint16(p + 28, true);
            const extraLen = cd.getUint16(p + 30, true);
            const commentLen = cd.getUint16(p + 32, true);
            let headerOffset = cd.getUint32(p + 42, true);
            if (p + 46 + nameLen + extraLen > cd.byteLength) return null;
            if (flags & 0x1) return null;                  // encrypted
            if (method !== 0 && method !== 8) return null; // can't inflate it later

            // Names must decode unambiguously: UTF-8 when flagged (bit 11),
            // plain ASCII otherwise.
            const nameBytes = new Uint8Array(cd.buffer, cd.byteOffset + p + 46, nameLen);
            if (!(flags & 0x800) && nameBytes.some(b => b >= 0x80)) return null;
            const path = utf8.decode(nameBytes);

            if (size === 0xFFFFFFFF || compressedSize === 0xFFFFFFFF || headerOffset === 0xFFFFFFFF) {
                const z64 = readZip64Extra(cd, p + 46 + nameLen, extraLen, size, compressedSize, headerOffset);
                if (!z64) return null;
                ({ size, compressedSize, headerOffset } = z64);
            }

            if (!path.endsWith('/')) entries.push({ path, size, compressedSize, method, headerOffset });
            p += 46 + nameLen + extraLen + commentLen;
        }
        return entries;
    } catch {
        return null; // unreadable or malformed — treat as not a usable zip
    }
}

/** The ZIP64 extra field (id 0x0001): 64-bit values present only for the
 *  fixed fields that overflowed, in this exact order. */
function readZip64Extra(
    cd: DataView, extraStart: number, extraLen: number,
    size: number, compressedSize: number, headerOffset: number,
): { size: number; compressedSize: number; headerOffset: number } | null {
    let q = extraStart;
    const end = extraStart + extraLen;
    while (q + 4 <= end) {
        const id = cd.getUint16(q, true);
        const len = cd.getUint16(q + 2, true);
        if (id === 0x0001) {
            let r = q + 4;
            const fieldEnd = r + len;
            const next = () => {
                if (r + 8 > fieldEnd) return null;
                const v = Number(cd.getBigUint64(r, true));
                r += 8;
                return v;
            };
            if (size === 0xFFFFFFFF) { const v = next(); if (v === null) return null; size = v; }
            if (compressedSize === 0xFFFFFFFF) { const v = next(); if (v === null) return null; compressedSize = v; }
            if (headerOffset === 0xFFFFFFFF) { const v = next(); if (v === null) return null; headerOffset = v; }
            return { size, compressedSize, headerOffset };
        }
        q += 4 + len;
    }
    return null;
}

/**
 * Open one entry's uncompressed content. Stored entries come back as a
 * disk-backed slice of the zip (no memory, no CPU, no progress); deflated
 * entries come back as a stream that inflates as it is consumed, reporting
 * `onProgress` 0–100 against the uncompressed size. Throws on a malformed
 * entry.
 */
export async function openZipEntry(
    file: File, entry: ZipDirEntry, onProgress?: (percent: number) => void,
): Promise<Blob | ReadableStream<Uint8Array>> {
    // The local header's name/extra lengths can differ from the central
    // directory's copy, so read them from the local record itself.
    const lh = await view(file, entry.headerOffset, entry.headerOffset + 30);
    if (lh.byteLength < 30 || lh.getUint32(0, true) !== LOC_SIG) {
        throw new Error(`bad local header: ${entry.path}`);
    }
    const dataStart = entry.headerOffset + 30 + lh.getUint16(26, true) + lh.getUint16(28, true);
    const compressed = file.slice(dataStart, dataStart + entry.compressedSize);
    if (entry.method === 0) return compressed;

    let inflated = 0;
    const counter = new TransformStream<Uint8Array, Uint8Array>({
        transform(chunk, controller) {
            controller.enqueue(chunk);
            inflated += chunk.byteLength;
            onProgress?.(Math.min(100, (inflated / (entry.size || 1)) * 100));
        },
    });
    return compressed.stream()
        .pipeThrough(new DecompressionStream('deflate-raw'))
        .pipeThrough(counter);
}

// DOS timestamp fields are mandatory; a fixed 1980-01-01 keeps output deterministic.
const DOS_DATE = (1 << 5) | 1;

/** Build a zip of stored (uncompressed) entries — for small bundles like
 *  save-state exports, where compression isn't worth the complexity. */
export function buildZip(files: Array<{ path: string; data: Uint8Array }>): Blob {
    const enc = new TextEncoder();
    const parts: BlobPart[] = [];
    const central: BlobPart[] = [];
    let offset = 0;
    let cdSize = 0;

    for (const { path, data } of files) {
        const name = enc.encode(path);
        const crc = crc32(data);

        // Local header: sig, version, flags (UTF-8 names), method (stored),
        // time/date, crc, sizes, name length.
        const local = new DataView(new ArrayBuffer(30));
        local.setUint32(0, LOC_SIG, true);
        local.setUint16(4, 20, true);
        local.setUint16(6, 0x0800, true);
        local.setUint16(12, DOS_DATE, true);
        local.setUint32(14, crc, true);
        local.setUint32(18, data.length, true);
        local.setUint32(22, data.length, true);
        local.setUint16(26, name.length, true);

        const cen = new DataView(new ArrayBuffer(46));
        cen.setUint32(0, CEN_SIG, true);
        cen.setUint16(4, 20, true);
        cen.setUint16(6, 20, true);
        cen.setUint16(8, 0x0800, true);
        cen.setUint16(14, DOS_DATE, true);
        cen.setUint32(16, crc, true);
        cen.setUint32(20, data.length, true);
        cen.setUint32(24, data.length, true);
        cen.setUint16(28, name.length, true);
        cen.setUint32(42, offset, true);

        // Never SharedArrayBuffer-backed in practice; BlobPart just can't prove it.
        parts.push(local.buffer, name, data as Uint8Array<ArrayBuffer>);
        central.push(cen.buffer, name);
        offset += 30 + name.length + data.length;
        cdSize += 46 + name.length;
    }

    const eocd = new DataView(new ArrayBuffer(22));
    eocd.setUint32(0, EOCD_SIG, true);
    eocd.setUint16(8, files.length, true);
    eocd.setUint16(10, files.length, true);
    eocd.setUint32(12, cdSize, true);
    eocd.setUint32(16, offset, true);

    return new Blob([...parts, ...central, eocd.buffer], { type: 'application/zip' });
}
