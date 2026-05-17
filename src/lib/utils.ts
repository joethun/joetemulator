import type { ThemeColors } from '@/types';

export const stripExt = (name: string) => name.replace(/\.[^/.]+$/, '');

export const focusRingStyle = (active: boolean, colors: ThemeColors) => ({
    borderColor: active ? colors.highlight : colors.midDark,
    boxShadow: active ? `0 0 0 2px ${colors.highlight}30` : 'none',
});

export function base64ToBytes(b64: string): Uint8Array {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

export function dataUrlToBytes(dataUrl: string): Uint8Array | null {
    const i = dataUrl.indexOf('base64,');
    if (i < 0) return null;
    try { return base64ToBytes(dataUrl.slice(i + 7)); }
    catch { return null; }
}

export function blobToDataUrl(blob: Blob): Promise<string | null> {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
    });
}
