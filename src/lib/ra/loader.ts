import { CORES_REQUIRING_THREADS, CORES_REQUIRING_WEBGL2 } from '@/lib/ra/cores';
import type { CoreInfo, CoreVariant, ModuleFactory, ResolvedCore } from '@/lib/ra/types';

declare global {
    interface Window { EJS_Runtime?: ModuleFactory }
}

const SCRIPT_MARK = 'data-ra-core-script';

// Blob URLs handed out for the core's JS + wasm. Revoked together on dispose so
// pthread workers (which capture `_scriptName` = the JS blob URL) keep working
// for the lifetime of the session.
const liveBlobUrls = new Set<string>();

const hasWebGL2 = (): boolean => {
    if (typeof document === 'undefined') return false;
    try { return !!document.createElement('canvas').getContext('webgl2'); }
    catch { return false; }
};

const hasThreads = (): boolean =>
    typeof window !== 'undefined'
    && typeof SharedArrayBuffer === 'function'
    && (window as { crossOriginIsolated?: boolean }).crossOriginIsolated === true;

export function pickVariant(libretroName: string): CoreVariant {
    const threads = hasThreads();
    const webgl2 = hasWebGL2();
    if (CORES_REQUIRING_THREADS.has(libretroName) && !threads) {
        throw new Error(
            `Core "${libretroName}" requires threads, but SharedArrayBuffer is unavailable. ` +
            `Verify COOP/COEP headers are present.`,
        );
    }
    if (CORES_REQUIRING_WEBGL2.has(libretroName) && !webgl2) {
        throw new Error(`Core "${libretroName}" requires WebGL2.`);
    }
    if (threads && webgl2) return 'thread';
    if (threads)           return 'thread-legacy';
    if (webgl2)            return 'default';
    return 'legacy';
}

async function fetchAsBlobUrl(url: string, type: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const blobUrl = URL.createObjectURL(new Blob([await res.arrayBuffer()], { type }));
    liveBlobUrls.add(blobUrl);
    return blobUrl;
}

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.json() as Promise<T>;
}

// Load the core script via a blob URL (matching EmulatorJS). Threaded cores
// capture `document.currentScript.src` as `_scriptName` and reuse it to spawn
// pthread workers — pointing the tag at a same-origin /cores/… URL works on
// most browsers, but on ChromeOS the subsequent Worker fetch can hang under
// COEP/service-worker mediation. A blob URL sidesteps both.
function injectScript(blobUrl: string, sourceUrl: string): Promise<ModuleFactory> {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = blobUrl;
        script.setAttribute(SCRIPT_MARK, '1');
        script.onload = () => {
            const factory = window.EJS_Runtime;
            window.EJS_Runtime = undefined;
            if (typeof factory !== 'function') reject(new Error('Core script did not expose EJS_Runtime'));
            else resolve(factory);
        };
        script.onerror = () => reject(new Error(`Failed to load ${sourceUrl}`));
        document.head.appendChild(script);
    });
}

export function disposeCoreScripts(): void {
    document.querySelectorAll(`script[${SCRIPT_MARK}]`).forEach(s => s.remove());
    for (const url of liveBlobUrls) URL.revokeObjectURL(url);
    liveBlobUrls.clear();
}

export async function loadCore(
    libretroName: string,
    onProgress?: (msg: string) => void,
): Promise<ResolvedCore> {
    const variant = pickVariant(libretroName);
    const base = `/cores/${libretroName}/${variant}`;

    onProgress?.(`Loading ${libretroName} (${variant})…`);
    const coreInfo = await fetchJson<CoreInfo>(`${base}/core.json`);

    const fileBase = `${coreInfo.name}_libretro`;
    const jsUrl = `${base}/${fileBase}.js`;
    const [wasmUrl, jsBlobUrl] = await Promise.all([
        fetchAsBlobUrl(`${base}/${fileBase}.wasm`, 'application/wasm'),
        fetchAsBlobUrl(jsUrl, 'application/javascript'),
    ]);
    const moduleFactory = await injectScript(jsBlobUrl, jsUrl);

    return { libretroName, coreInfo, moduleFactory, wasmUrl };
}
