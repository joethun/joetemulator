import { fileExt } from '@/lib/files';

// libretro memory ids passed to the core's get_memory_data export.
const RETRO_MEMORY_SAVE_RAM = 0;
const RETRO_MEMORY_SYSTEM_RAM = 2;
const RETRO_MEMORY_VIDEO_RAM = 3;

/** The blocks rc_libretro maps when a core registers no memory map. */
export const RAM_BLOCK_IDS = [RETRO_MEMORY_SYSTEM_RAM, RETRO_MEMORY_SAVE_RAM, RETRO_MEMORY_VIDEO_RAM];

/** [core-heap pointer, size] for a libretro memory id; [0, 0] when absent. */
export type MemoryInfoFn = (id: number) => [number, number];

/** One retro_memory_descriptor, as the 7 words rcw_memory_init expects. */
export type Descriptor = [flags: number, ptr: number, offset: number, start: number, select: number, disconnect: number, len: number];

const desc = (ptr: number, start: number, len: number, select = 0): Descriptor =>
    [0, ptr, 0, start, select, 0, len];

/**
 * Fallback for stock EmulatorJS cores, built without the ejs_get_memory_map
 * export (scripts/cores rebuilds the ones that need it). Without a map
 * rc_libretro lays SYSTEM_RAM/SAVE_RAM over the console's address space,
 * which is wrong for a few cores whose blocks don't match RA's layout. For
 * those we rebuild the descriptors the core itself registers (from its
 * libretro.c), using the pointers we can reach. Returns null to use the
 * generic fallback.
 */
export function syntheticMemoryMap(libretroName: string, bootName: string, info: MemoryInfoFn): Descriptor[] | null {
    const [sys, sysSize] = info(RETRO_MEMORY_SYSTEM_RAM);
    const [save, saveSize] = info(RETRO_MEMORY_SAVE_RAM);

    switch (libretroName) {
        case 'nestopia': {
            // A descriptor lets rc_libretro resolve the $0800-$1FFF mirrors.
            if (!sys || sysSize < 0x800) return [];
            const d: Descriptor[] = [desc(sys, 0x0000, 0x800)];
            // FDS images report the disk image as SAVE_RAM — not $6000.
            if (save && saveSize && fileExt(bootName) !== 'fds') d.push(desc(save, 0x6000, Math.min(saveSize, 0x2000)));
            return d;
        }
        case 'vice_x64sc': {
            // SYSTEM_RAM is the flat 64K bus; screen RAM at $0400 lives in it.
            if (!sys || sysSize < 0x10000) return null;
            return [desc(sys, 0x0000, 0x10000)];
        }
        default:
            return null;
    }
}

/** Parse ejs_get_memory_map's "flags|ptr|offset|start|select|disconnect|len;…". */
export function parseCoreMemoryMap(raw: string): Descriptor[] {
    const out: Descriptor[] = [];
    for (const record of raw.split(';')) {
        const v = record.split('|').map(Number);
        if (v.length === 7 && v.every(Number.isFinite)) out.push(v as Descriptor);
    }
    return out;
}

export const flattenDescriptors = (d: Descriptor[]): Uint32Array =>
    Uint32Array.from(d.flat(), v => v >>> 0);

interface Region { ptr: number; size: number }

/**
 * Reads RA addresses out of the core's heap using the region table
 * rc_libretro computed. Mirrors rc_libretro_memory_read exactly: regions are
 * laid end to end, a null region ends the read.
 */
export class CoreMemory {
    private regions: Region[] = [];
    /** The core heap pinned for one frame's reads (rc_client reads every
     *  memref each frame), so each read skips the host lookup. */
    private frameHeap: Uint8Array | null = null;

    constructor(private readonly heap: () => Uint8Array) {}

    setRegions(regions: Region[]): void { this.regions = regions; }

    get hasValidRegion(): boolean { return this.regions.some(r => r.ptr !== 0); }

    /** Pin the heap for a frame. False while a region points past the current
     *  heap view — a thread build's Module.HEAPU8 can lag a growth done by a
     *  worker until the next glue call. */
    beginFrame(): boolean {
        const heap = this.heap();
        if (!this.regions.every(r => !r.ptr || r.ptr + r.size <= heap.length)) return false;
        this.frameHeap = heap;
        return true;
    }

    endFrame(): void { this.frameHeap = null; }

    read(address: number, dst: Uint8Array, dstPtr: number, numBytes: number): number {
        const heap = this.frameHeap ?? this.heap();
        let read = 0;
        for (const { ptr, size } of this.regions) {
            if (address >= size) { address -= size; continue; }
            if (!ptr) break;
            const avail = size - address;
            const n = Math.min(avail, numBytes);
            const src = ptr + address;
            if (n <= 4) {
                for (let i = 0; i < n; i++) dst[dstPtr + read + i] = heap[src + i];
            } else {
                dst.set(heap.subarray(src, src + n), dstPtr + read);
            }
            read += n;
            numBytes -= n;
            if (!numBytes) break;
            address = 0;
        }
        return read;
    }
}
