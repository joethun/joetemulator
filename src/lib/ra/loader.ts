import { CORES_REQUIRING_THREADS, CORES_REQUIRING_WEBGL2 } from '@/lib/ra/cores';
import type { CoreInfo, CoreVariant, ModuleFactory, ResolvedCore } from '@/lib/ra/types';

interface SevenZipFS {
    writeFile(path: string, data: Uint8Array): void;
    readFile(path: string, opts: { encoding: 'binary' }): Uint8Array;
    readdir(path: string): string[];
    stat(path: string): { mode: number };
    isFile(mode: number): boolean;
}
interface SevenZipModule { FS: SevenZipFS; callMain(args: string[]): void }
type SevenZipFactory = (opts: object) => Promise<SevenZipModule>;

declare global {
    interface Window {
        EJS_Runtime?: ModuleFactory;
        SevenZip?: SevenZipFactory;
    }
}

const SCRIPT_MARK = 'data-ra-core-script';

// Blob URLs handed out for the core's JS + wasm. Revoked together on dispose so
// pthread workers (which capture `_scriptName` = the JS blob URL) keep working
// for the lifetime of the session.
const liveBlobUrls = new Set<string>();

// CoreInfo by libretroName, populated as cores are extracted. Read by the
// LicensePanel so it doesn't need to refetch and re-decompress the archive
// just to surface a repo URL.
const coreInfoByName = new Map<string, CoreInfo>();
export const getCachedCoreInfo = (libretroName: string): CoreInfo | undefined =>
    coreInfoByName.get(libretroName);

const VARIANT_SUFFIX: Record<CoreVariant, string> = {
    'default':        '',
    'legacy':         '-legacy',
    'thread':         '-thread',
    'thread-legacy': '-thread-legacy',
};

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

// The 7z decoder is loaded once via a side-loaded UMD script (the npm package
// has Node-only branches that confuse the bundler). The wasm binary is fetched
// alongside it and reused per extraction so each archive gets a fresh FS but
// pays the wasm cost only once.
let sevenZipFactoryPromise: Promise<SevenZipFactory> | null = null;
let sevenZipBinaryPromise:  Promise<ArrayBuffer>    | null = null;

const get7zFactory = (): Promise<SevenZipFactory> => {
    sevenZipFactoryPromise ??= new Promise<SevenZipFactory>((resolve, reject) => {
        if (window.SevenZip) { resolve(window.SevenZip); return; }
        const script = document.createElement('script');
        script.src = '/lib/7zz.js';
        script.onload = () => {
            if (window.SevenZip) resolve(window.SevenZip);
            else reject(new Error('7zz.js loaded but did not expose SevenZip'));
        };
        script.onerror = () => reject(new Error('Failed to load /lib/7zz.js'));
        document.head.appendChild(script);
    });
    return sevenZipFactoryPromise;
};

const get7zBinary = (): Promise<ArrayBuffer> => {
    sevenZipBinaryPromise ??= fetch('/lib/7zz.wasm').then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} fetching 7zz.wasm`);
        return r.arrayBuffer();
    });
    return sevenZipBinaryPromise;
};

async function extractArchive(archive: Uint8Array): Promise<Map<string, Uint8Array>> {
    const [factory, wasmBinary] = await Promise.all([get7zFactory(), get7zBinary()]);
    const sevenZip = await factory({
        wasmBinary,
        print:    () => {},
        printErr: () => {},
    });

    const archiveName = 'in.7z';
    sevenZip.FS.writeFile(archiveName, archive);
    sevenZip.callMain(['x', archiveName, '-y']);

    const out = new Map<string, Uint8Array>();
    for (const name of sevenZip.FS.readdir('/')) {
        if (name === '.' || name === '..' || name === archiveName) continue;
        try {
            const stat = sevenZip.FS.stat(name);
            if (!sevenZip.FS.isFile(stat.mode)) continue;
            out.set(name, sevenZip.FS.readFile(name, { encoding: 'binary' }));
        } catch { /* directory entries that aren't readable as files */ }
    }
    return out;
}

function makeBlobUrl(bytes: Uint8Array, type: string): string {
    // Copy into a fresh ArrayBuffer — Emscripten's HEAPU8 view is backed by a
    // SharedArrayBuffer in threaded builds, which Blob refuses.
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    const url = URL.createObjectURL(new Blob([copy.buffer], { type }));
    liveBlobUrls.add(url);
    return url;
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
    const archiveUrl = `/cores/${libretroName}${VARIANT_SUFFIX[variant]}-wasm.data`;

    onProgress?.(`Loading ${libretroName} (${variant})…`);
    const res = await fetch(archiveUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${archiveUrl}`);
    const archive = new Uint8Array(await res.arrayBuffer());

    const files = await extractArchive(archive);

    const coreJsonBytes = files.get('core.json');
    if (!coreJsonBytes) throw new Error(`core.json missing in ${archiveUrl}`);
    const coreInfo = JSON.parse(new TextDecoder().decode(coreJsonBytes)) as CoreInfo;

    const jsName   = `${coreInfo.name}_libretro.js`;
    const wasmName = `${coreInfo.name}_libretro.wasm`;
    const jsBytes   = files.get(jsName);
    const wasmBytes = files.get(wasmName);
    if (!jsBytes)   throw new Error(`${jsName} missing in ${archiveUrl}`);
    if (!wasmBytes) throw new Error(`${wasmName} missing in ${archiveUrl}`);

    const wasmUrl    = makeBlobUrl(wasmBytes, 'application/wasm');
    const jsBlobUrl  = makeBlobUrl(jsBytes,  'application/javascript');
    const moduleFactory = await injectScript(jsBlobUrl, archiveUrl);

    coreInfoByName.set(libretroName, coreInfo);
    return { libretroName, coreInfo, moduleFactory, wasmUrl };
}
