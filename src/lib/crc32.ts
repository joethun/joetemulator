const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        t[i] = c;
    }
    return t;
})();

function crc32(data: Uint8Array): string {
    let crc = -1;
    for (let i = 0; i < data.length; i++) {
        crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ data[i]) & 0xFF];
    }
    return ((crc ^ -1) >>> 0).toString(16).padStart(8, '0');
}

export function computeRomCrc(data: Uint8Array, system: string): string {
    if ((system === 'SNES' || system === 'Super Nintendo') && data.length % 1024 === 512)
        data = data.slice(512);
    if ((system === 'NES' || system === 'Nintendo Entertainment System') && data.length % 1024 === 16)
        data = data.slice(16);
    return crc32(data);
}