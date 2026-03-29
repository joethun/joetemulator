export function crc32(uint8Array: Uint8Array): string {
    const table = new Uint32Array(256);
    for (let current = 0; current < 256; current++) {
        let c = current;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[current] = c;
    }
    let crc = -1;
    for (let i = 0; i < uint8Array.length; i++) {
        crc = (crc >>> 8) ^ table[(crc ^ uint8Array[i]) & 0xFF];
    }
    return ((crc ^ -1) >>> 0).toString(16).padStart(8, '0');
}

export function computeRomCrc(uint8Array: Uint8Array, system: string): string {
    let data = uint8Array;
    if ((system === 'SNES' || system === 'Super Nintendo') && data.length % 1024 === 512) {
        data = data.slice(512);
    }
    if ((system === 'NES' || system === 'Nintendo Entertainment System') && data.length % 1024 === 16) {
        data = data.slice(16);
    }
    return crc32(data);
}
