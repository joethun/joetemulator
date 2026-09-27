// Loads public/lib/rcheevos.{js,wasm} (built by scripts/rcheevos/build.sh).
// Like 7zz, the Emscripten output is side-loaded as a classic script so the
// bundler never sees it; it exposes a global `RcheevosModule` factory.

import { loadGlobalScript } from '@/lib/ra/loader';

type Ptr = number;

/** Hooks called from rcw.c's EM_JS imports. Assigned once after load. */
interface RcHooks {
    rcReadMemory(address: number, buffer: Ptr, numBytes: number): number;
    rcServerCall(reqId: number, url: Ptr, post: Ptr, contentType: Ptr): void;
    rcOnEvent(json: Ptr): void;
    rcOnComplete(reqId: number, result: number, error: Ptr): void;
    rcLog(message: Ptr): void;
    rcFileOpen(path: Ptr): number;
    rcFileSeek(handle: number, offset: number, origin: number): void;
    rcFileTell(handle: number): number;
    rcFileRead(handle: number, buffer: Ptr, n: number): number;
    rcFileClose(handle: number): void;
    rcCoreMemoryInfo(id: number): [number, number];
}

export interface RcModule extends Partial<RcHooks> {
    HEAPU8: Uint8Array;
    UTF8ToString(ptr: Ptr): string;
    stringToNewUTF8(s: string): Ptr;
    _malloc(n: number): Ptr;
    _free(ptr: Ptr): void;

    _rcw_init(logLevel: number): number;
    _rcw_set_hardcore(enabled: number): void;
    _rcw_login_password(user: Ptr, pass: Ptr, reqId: number): void;
    _rcw_login_token(user: Ptr, token: Ptr, reqId: number): void;
    _rcw_logout(): void;
    _rcw_user_json(): Ptr;
    _rcw_identify_and_load_game(consoleId: number, path: Ptr, reqId: number): void;
    _rcw_change_media(path: Ptr, reqId: number): void;
    _rcw_unload_game(): void;
    _rcw_is_game_loaded(): number;
    _rcw_generate_hash(consoleId: number, path: Ptr): Ptr;
    _rcw_game_json(): Ptr;
    _rcw_achievement_list_json(category: number, grouping: number): Ptr;
    _rcw_do_frame(): void;
    _rcw_idle(): void;
    _rcw_reset(): void;
    _rcw_can_pause(): number;
    _rcw_user_agent_clause(): Ptr;
    _rcw_progress_size(): number;
    _rcw_serialize_progress(buffer: Ptr, size: number): number;
    _rcw_deserialize_progress(buffer: Ptr, size: number): number;
    _rcw_deliver(reqId: number, body: Ptr, length: number, status: number): void;
    _rcw_memory_init(consoleId: number, words: Ptr, count: number): number;
    _rcw_memory_region_count(): number;
    _rcw_memory_region_ptr(i: number): number;
    _rcw_memory_region_size(i: number): number;
    _rcw_is_setting_allowed(library: Ptr, consoleId: number, key: Ptr, value: Ptr): number;
}

type RcFactory = (opts: object) => Promise<RcModule>;

declare global {
    interface Window { RcheevosModule?: RcFactory }
}

const SCRIPT_URL = '/lib/rcheevos.js';
const WASM_URL = '/lib/rcheevos.wasm';

let modulePromise: Promise<RcModule> | null = null;

/** Instantiate the rcheevos module once per page. */
export function loadRcheevos(): Promise<RcModule> {
    modulePromise ??= loadGlobalScript(SCRIPT_URL, 'RcheevosModule')
        .then(factory => factory({
            locateFile: (name: string) => name.endsWith('.wasm') ? WASM_URL : name,
            print: (msg: string) => console.debug('[rcheevos]', msg),
            printErr: (msg: string) => console.warn('[rcheevos]', msg),
        }))
        .catch(e => { modulePromise = null; throw e; });
    return modulePromise;
}

/** Read and free a malloc'd C string returned by an rcw_* function. */
export function takeString(mod: RcModule, ptr: Ptr): string | null {
    if (!ptr) return null;
    const s = mod.UTF8ToString(ptr);
    mod._free(ptr);
    return s;
}

export function takeJSON<T>(mod: RcModule, ptr: Ptr): T | null {
    const s = takeString(mod, ptr);
    if (s == null) return null;
    try { return JSON.parse(s) as T; }
    catch { return null; }
}

/** Run `fn` with temporary C strings, freeing them afterwards. */
export function withStrings<R>(mod: RcModule, strings: string[], fn: (...ptrs: Ptr[]) => R): R {
    const ptrs = strings.map(s => mod.stringToNewUTF8(s));
    try { return fn(...ptrs); }
    finally { ptrs.forEach(p => mod._free(p)); }
}
