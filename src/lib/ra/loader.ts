import { CORES_REQUIRING_THREADS, CORES_REQUIRING_WEBGL2 } from '@/lib/ra/cores';
import type { CoreInfo, CoreVariant, ModuleFactory, ResolvedCore } from '@/lib/ra/types';

declare global {
    interface Window { EJS_Runtime?: ModuleFactory }
}

const SCRIPT_MARK = 'data-ra-core-script';

const supportsWebGL2 = (): boolean => {
    if (typeof document === 'undefined') return false;
    try { return !!document.createElement('canvas').getContext('webgl2'); }
    catch { return false; }
};

const threadsAvailable = (): boolean =>
    typeof window !== 'undefined'
    && typeof SharedArrayBuffer === 'function'
    && (window as { crossOriginIsolated?: boolean }).crossOriginIsolated === true;

function pickVariant(libretroName: string): CoreVariant {
    const threads = threadsAvailable();
    const webgl2 = supportsWebGL2();
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

async function loadFactory(jsUrl: string): Promise<ModuleFactory> {
    await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = jsUrl;
        script.setAttribute(SCRIPT_MARK, '1');
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${jsUrl}`));
        document.head.appendChild(script);
    });
    const factory = window.EJS_Runtime;
    window.EJS_Runtime = undefined;
    if (typeof factory !== 'function') throw new Error('Core script did not expose EJS_Runtime');
    return factory;
}

export function disposeCoreScripts(): void {
    document.querySelectorAll(`script[${SCRIPT_MARK}]`).forEach(s => s.remove());
}

export async function loadCore(
    libretroName: string,
    onProgress?: (msg: string) => void,
): Promise<ResolvedCore> {
    const variant = pickVariant(libretroName);
    const base = `/cores/${libretroName}/${variant}`;

    onProgress?.(`Loading ${libretroName} (${variant})…`);
    const res = await fetch(`${base}/core.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${base}/core.json`);
    const coreInfo = await res.json() as CoreInfo;

    const fileBase = `${coreInfo.name}_libretro`;
    const moduleFactory = await loadFactory(`${base}/${fileBase}.js`);

    return { libretroName, coreInfo, moduleFactory, wasmUrl: `${base}/${fileBase}.wasm` };
}
