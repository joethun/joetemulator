import { loadRcheevos, takeJSON, takeString, withStrings, type RcModule } from '@/lib/cheevos/module';
import {
    CoreMemory, flattenDescriptors, parseCoreMemoryMap, syntheticMemoryMap, type MemoryInfoFn,
} from '@/lib/cheevos/memory';
import {
    RA_BUCKET, RA_CATEGORY_CORE, RA_GROUPING_LOCK_STATE, RC_EXPIRED_TOKEN, RC_INVALID_CREDENTIALS,
    isWarningAchievement, type RAAchievementBucket, type RAEvent, type RAGame, type RAUser,
} from '@/lib/cheevos/types';

/** Same-origin pass-through to retroachievements.org/dorequest.php (see
 *  src/app/api/retroachievements/route.ts) — the Connect API sends no CORS
 *  headers and needs a User-Agent a browser can't set. */
const PROXY_URL = '/api/retroachievements';

const LOG_LEVEL_INFO = 3;
/** RC_API_SERVER_RESPONSE_RETRYABLE_CLIENT_ERROR — rc_client retries these. */
const RETRYABLE_CLIENT_ERROR = -2;

interface CompletionResult { result: number; error: string | null }

/** Where rcheevos gets the running game's memory from. */
export interface MemorySource {
    heap: () => Uint8Array;
    info: MemoryInfoFn;
    /** The core's registered memory map (raw export string), or null when
     *  the core wasn't built with the export. */
    memoryMap: () => string | null;
    libretroName: string;
    consoleId: number;
    bootName: string;
}

type ReadMode = 'uninitialized' | 'dummy' | 'real' | 'unavailable';

/**
 * Page-wide wrapper around the rcheevos wasm module (rc_client). One per
 * page: the emulator reloads the page on exit, so a login lives exactly as
 * long as the play session that needs it.
 */
class CheevosClient {
    private mod: RcModule | null = null;
    private initPromise: Promise<RcModule> | null = null;
    private completions = new Map<number, (r: CompletionResult) => void>();
    private nextReqId = 1;

    private files = new Map<string, Uint8Array>();
    private handles = new Map<number, { data: Uint8Array; pos: number }>();
    private nextHandle = 1;

    private memorySource: MemorySource | null = null;
    private memory: CoreMemory | null = null;
    private readMode: ReadMode = 'uninitialized';
    private loading = false;

    private listeners = new Set<(e: RAEvent) => void>();
    private userAgentClause = '';

    /** Load and initialise the wasm module (idempotent). */
    init(): Promise<RcModule> {
        this.initPromise ??= loadRcheevos().then(mod => {
            this.installHooks(mod);
            if (!mod._rcw_init(LOG_LEVEL_INFO)) throw new Error('rc_client_create failed');
            this.userAgentClause = takeString(mod, mod._rcw_user_agent_clause()) ?? '';
            this.mod = mod;
            return mod;
        }).catch(e => { this.initPromise = null; throw e; });
        return this.initPromise;
    }

    get ready(): boolean { return this.mod !== null; }

    onEvent(fn: (e: RAEvent) => void): () => void {
        this.listeners.add(fn);
        return () => { this.listeners.delete(fn); };
    }

    // ── user ────────────────────────────────────────────────────────────

    loginWithPassword(username: string, password: string): Promise<RAUser> {
        return this.login(username, password, (mod, u, p, id) => mod._rcw_login_password(u, p, id));
    }

    loginWithToken(username: string, token: string): Promise<RAUser> {
        return this.login(username, token, (mod, u, t, id) => mod._rcw_login_token(u, t, id));
    }

    private async login(
        username: string, secret: string, start: (mod: RcModule, user: number, secret: number, id: number) => void,
    ): Promise<RAUser> {
        const mod = await this.init();
        const res = await this.request(id => withStrings(mod, [username, secret], (u, s) => start(mod, u, s, id)));
        const user = this.getUser();
        if (res.result !== 0 || !user) throw new CheevosError(res.result, res.error ?? 'Login failed');
        return user;
    }

    logout(): void { this.mod?._rcw_logout(); }

    getUser(): RAUser | null {
        return this.mod ? takeJSON<RAUser>(this.mod, this.mod._rcw_user_json()) : null;
    }

    // ── game ────────────────────────────────────────────────────────────

    setHardcore(enabled: boolean): void { this.mod?._rcw_set_hardcore(enabled ? 1 : 0); }

    /** Files the hasher may open, keyed by the path rcheevos will ask for. */
    setFiles(files: Array<{ name: string; bytes: Uint8Array }>): void {
        this.files = new Map(files.map(f => ['/' + f.name, f.bytes]));
    }

    /**
     * Identify the game from its files and start a session. Resolves with the
     * rc_client result; RC_NO_GAME_LOADED means RA doesn't know the hash.
     */
    async loadGame(consoleId: number, bootPath: string, source: MemorySource): Promise<CompletionResult> {
        const mod = await this.init();
        this.memorySource = source;
        this.memory = new CoreMemory(source.heap);
        this.readMode = 'uninitialized';
        this.loading = true;
        try {
            const res = await this.request(id => withStrings(mod, [bootPath],
                p => mod._rcw_identify_and_load_game(consoleId, p, id)));
            // readMode is advanced by readMemory() during the load; TS can't see that.
            if (res.result === 0 && (this.readMode as ReadMode) !== 'real') {
                // Mirrors RetroArch: cores like mupen64plus expose memory only
                // after the first retro_run, so retry now that we're loaded.
                this.readMode = this.initMemory() ? 'real' : 'unavailable';
                if (this.readMode === 'unavailable') {
                    mod._rcw_unload_game();
                    return { result: -1, error: 'This core does not expose memory for achievements' };
                }
            }
            return res;
        } finally {
            this.loading = false;
        }
    }

    async changeMedia(path: string): Promise<CompletionResult> {
        const mod = await this.init();
        return this.request(id => withStrings(mod, [path], p => mod._rcw_change_media(p, id)));
    }

    /** Hash files (registered with setFiles) the way RetroArch identifies them. */
    async generateHash(consoleId: number, path: string): Promise<string | null> {
        const mod = await this.init();
        return takeString(mod, withStrings(mod, [path], p => mod._rcw_generate_hash(consoleId, p)));
    }

    unloadGame(): void {
        this.mod?._rcw_unload_game();
        this.memorySource = null;
        this.memory = null;
        this.readMode = 'uninitialized';
        this.files.clear();
        this.handles.clear();
    }

    isGameLoaded(): boolean { return !!this.mod?._rcw_is_game_loaded(); }

    getGame(): RAGame | null {
        return this.mod ? takeJSON<RAGame>(this.mod, this.mod._rcw_game_json()) : null;
    }

    /** Unlocked, then Locked, then Unsupported, each in the set's own order. */
    getAchievements(): RAAchievementBucket[] {
        if (!this.mod) return [];
        const buckets = takeJSON<RAAchievementBucket[]>(
            this.mod, this.mod._rcw_achievement_list_json(RA_CATEGORY_CORE, RA_GROUPING_LOCK_STATE)) ?? [];
        return buckets
            .map(b => ({ ...b, achievements: b.achievements.filter(a => !isWarningAchievement(a)) }))
            .filter(b => b.achievements.length > 0)
            .sort((a, b) => bucketRank(a.bucketType) - bucketRank(b.bucketType));
    }

    // ── per-frame ───────────────────────────────────────────────────────

    /** Evaluate achievements for one emulated frame. */
    doFrame(): void {
        const mod = this.mod;
        const memory = this.memory;
        if (!mod || !memory) return;
        // Skip rather than read short: a short read permanently disables the
        // achievements that touch that address.
        if (!memory.beginFrame() && this.readMode === 'real') return;
        try { mod._rcw_do_frame(); } finally { memory.endFrame(); }
    }

    /** Keep the session alive (pings, retries) while no frames are running. */
    idle(): void { this.mod?._rcw_idle(); }

    /** Tell rcheevos the emulated system was reset. */
    reset(): void {
        this.mod?._rcw_reset();
        // Some cores reallocate memory on reset.
        this.refreshMemory();
    }

    /** Re-derive the region table (after reset, state load, or pointer moves). */
    refreshMemory(): void {
        if (this.readMode === 'real') this.initMemory();
    }

    /** Frames until pausing is allowed in hardcore, or 0 when it is. */
    pauseFramesRemaining(): number {
        const v = this.mod?._rcw_can_pause() ?? -1;
        return v < 0 ? 0 : v;
    }

    // ── save-state progress ─────────────────────────────────────────────

    serializeProgress(): Uint8Array | null {
        const mod = this.mod;
        if (!mod || !this.isGameLoaded()) return null;
        const size = mod._rcw_progress_size();
        if (!size) return null;
        const ptr = mod._malloc(size);
        try {
            if (mod._rcw_serialize_progress(ptr, size) !== 0) return null;
            return mod.HEAPU8.slice(ptr, ptr + size);
        } finally { mod._free(ptr); }
    }

    /** Restore achievement progress captured with a save state. `null` resets
     *  it, which is correct for states saved without progress. */
    deserializeProgress(data: Uint8Array | null): void {
        const mod = this.mod;
        if (!mod || !this.isGameLoaded()) return;
        if (!data?.length) { mod._rcw_deserialize_progress(0, 0); return; }
        const ptr = mod._malloc(data.length);
        try {
            mod.HEAPU8.set(data, ptr);
            if (mod._rcw_deserialize_progress(ptr, data.length) !== 0) mod._rcw_deserialize_progress(0, 0);
        } finally { mod._free(ptr); }
    }

    // ── hardcore settings validation ────────────────────────────────────

    isSettingAllowed(libraryName: string, consoleId: number, key: string, value: string): boolean {
        const mod = this.mod;
        if (!mod) return true;
        return !!withStrings(mod, [libraryName, key, value],
            (l, k, v) => mod._rcw_is_setting_allowed(l, consoleId, k, v));
    }

    /** POST a dorequest.php call through the same-origin proxy. */
    async post(query: string, body: string, contentType?: string | null): Promise<Response> {
        await this.init(); // for the User-Agent client clause
        return fetch(PROXY_URL + query, {
            method: 'POST',
            body,
            headers: {
                'content-type': contentType || 'application/x-www-form-urlencoded',
                'x-ra-client': this.clientClause(),
            },
            cache: 'no-store',
        });
    }

    // ── internals ───────────────────────────────────────────────────────

    private request(start: (id: number) => void): Promise<CompletionResult> {
        const id = this.nextReqId++;
        return new Promise(resolve => {
            this.completions.set(id, resolve);
            start(id);
        });
    }

    private initMemory(): boolean {
        const mod = this.mod;
        const src = this.memorySource;
        if (!mod || !src || !this.memory) return false;

        // Prefer the map the core itself registered — exactly what RetroArch's
        // own achievements code uses. Cores built before the export (or that
        // register no map) fall back to per-core maps / plain RAM blocks.
        const coreMap = parseCoreMemoryMap(src.memoryMap() ?? '');
        const descriptors = coreMap.length
            ? coreMap
            : syntheticMemoryMap(src.libretroName, src.bootName, src.info);
        console.debug('[rcheevos] memory map from', coreMap.length ? 'core' : descriptors ? 'per-core fallback' : 'RAM blocks');
        // [] = the core uses a synthetic map but its pointers aren't live yet.
        if (descriptors && !descriptors.length) return false;

        let ok: number;
        if (descriptors) {
            const words = flattenDescriptors(descriptors);
            const ptr = mod._malloc(words.byteLength);
            try {
                mod.HEAPU8.set(new Uint8Array(words.buffer), ptr);
                ok = mod._rcw_memory_init(src.consoleId, ptr, descriptors.length);
            } finally { mod._free(ptr); }
        } else {
            ok = mod._rcw_memory_init(src.consoleId, 0, 0);
        }

        const regions = [];
        for (let i = 0, n = mod._rcw_memory_region_count(); i < n; i++) {
            regions.push({ ptr: mod._rcw_memory_region_ptr(i), size: mod._rcw_memory_region_size(i) });
        }
        this.memory.setRegions(regions);
        return !!ok && this.memory.hasValidRegion;
    }

    private readMemory(address: number, buffer: number, numBytes: number): number {
        const mod = this.mod!;
        if (this.readMode === 'uninitialized') {
            // Mirrors RetroArch's rcheevos_client_read_memory_uninitialized.
            if (this.initMemory()) this.readMode = 'real';
            else this.readMode = this.loading ? 'dummy' : 'unavailable';
        }
        switch (this.readMode) {
            case 'real':
                return this.memory!.read(address, mod.HEAPU8, buffer, numBytes);
            case 'dummy':
                // Pretend memory exists during load so address validation
                // doesn't disable everything; re-evaluated once loaded.
                mod.HEAPU8.fill(0, buffer, buffer + numBytes);
                return numBytes;
            default:
                return 0;
        }
    }

    private async serverCall(reqId: number, url: string, post: string | null, contentType: string | null): Promise<void> {
        let body: Uint8Array;
        let status: number;
        try {
            const res = await this.post(new URL(url).search, post ?? '', contentType);
            body = new Uint8Array(await res.arrayBuffer());
            status = res.status;
        } catch {
            body = new Uint8Array(0);
            status = RETRYABLE_CLIENT_ERROR;
        }
        this.deliver(reqId, body, status);
    }

    /** "rcheevos/12.5 fceumm_libretro" — appended to the proxy's User-Agent. */
    private clientClause(): string {
        const core = this.memorySource?.libretroName;
        return core ? `${this.userAgentClause} ${core}_libretro` : this.userAgentClause;
    }

    private deliver(reqId: number, body: Uint8Array, status: number): void {
        const mod = this.mod;
        if (!mod) return;
        const ptr = mod._malloc(body.length + 1);
        try {
            mod.HEAPU8.set(body, ptr);
            mod.HEAPU8[ptr + body.length] = 0;
            mod._rcw_deliver(reqId, ptr, body.length, status);
        } finally { mod._free(ptr); }
    }

    private resolvePath(path: string): Uint8Array | undefined {
        const direct = this.files.get(path);
        if (direct) return direct;
        // cue/m3u entries can differ in case or use a directory prefix.
        const base = path.slice(path.lastIndexOf('/') + 1).toLowerCase();
        for (const [name, data] of this.files) {
            if (name.slice(1).toLowerCase() === base) return data;
        }
        return undefined;
    }

    private installHooks(mod: RcModule): void {
        mod.rcReadMemory = (address, buffer, numBytes) => this.readMemory(address, buffer, numBytes);
        mod.rcServerCall = (reqId, url, post, contentType) => {
            // The strings are only valid during this call — copy them now.
            void this.serverCall(
                reqId,
                mod.UTF8ToString(url),
                post ? mod.UTF8ToString(post) : null,
                contentType ? mod.UTF8ToString(contentType) : null,
            );
        };
        mod.rcOnEvent = json => {
            let event: RAEvent;
            try { event = JSON.parse(mod.UTF8ToString(json)) as RAEvent; }
            catch { return; }
            for (const fn of this.listeners) {
                try { fn(event); } catch (e) { console.error('cheevos event handler failed:', e); }
            }
        };
        mod.rcOnComplete = (reqId, result, error) => {
            const done = this.completions.get(reqId);
            if (!done) return;
            this.completions.delete(reqId);
            done({ result, error: error ? mod.UTF8ToString(error) : null });
        };
        mod.rcLog = msg => console.debug('[rcheevos]', mod.UTF8ToString(msg));
        mod.rcFileOpen = path => {
            const data = this.resolvePath(mod.UTF8ToString(path));
            if (!data) return 0;
            const handle = this.nextHandle++;
            this.handles.set(handle, { data, pos: 0 });
            return handle;
        };
        mod.rcFileSeek = (handle, offset, origin) => {
            const f = this.handles.get(handle);
            if (!f) return;
            const base = origin === 1 ? f.pos : origin === 2 ? f.data.length : 0;
            f.pos = Math.max(0, Math.min(f.data.length, base + offset));
        };
        mod.rcFileTell = handle => this.handles.get(handle)?.pos ?? 0;
        mod.rcFileRead = (handle, buffer, n) => {
            const f = this.handles.get(handle);
            if (!f) return 0;
            const chunk = f.data.subarray(f.pos, f.pos + n);
            mod.HEAPU8.set(chunk, buffer);
            f.pos += chunk.length;
            return chunk.length;
        };
        mod.rcFileClose = handle => { this.handles.delete(handle); };
        mod.rcCoreMemoryInfo = id => this.memorySource?.info(id) ?? [0, 0];
    }
}

// rc_client lists Locked first and Unsupported before Unlocked; show what's
// been earned first and keep achievements that can't be earned at the bottom.
const BUCKET_ORDER: number[] = [RA_BUCKET.UNLOCKED, RA_BUCKET.LOCKED, RA_BUCKET.UNSUPPORTED];
const bucketRank = (type: number) => {
    const i = BUCKET_ORDER.indexOf(type);
    return i < 0 ? BUCKET_ORDER.length : i;
};

export class CheevosError extends Error {
    constructor(public readonly code: number, message: string) {
        super(message);
        this.name = 'CheevosError';
    }

    /** The stored token (or the password) was rejected. */
    get loginExpired(): boolean {
        return this.code === RC_INVALID_CREDENTIALS || this.code === RC_EXPIRED_TOKEN;
    }
}

export const cheevos = new CheevosClient();
