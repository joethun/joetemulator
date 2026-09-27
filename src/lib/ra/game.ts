import { DEFAULT_COVER_ASPECT } from '@/lib/savestates';
import type { CwrapPrimitive, LibretroModule } from '@/lib/ra/types';

const STATE_FILE = '/game.state';

/** Key strings the fork's get_memory_data accepts, indexed by RETRO_MEMORY_* id. */
const MEMORY_KEYS = [
    'RETRO_MEMORY_SAVE_RAM', 'RETRO_MEMORY_RTC', 'RETRO_MEMORY_SYSTEM_RAM', 'RETRO_MEMORY_VIDEO_RAM',
];

type CFn<R> = (...args: unknown[]) => R;

export class GameController {
    private readonly fn: {
        saveStateInfo: CFn<string>;
        loadState:     CFn<number>;
        simulateInput: CFn<void>;
        toggleLoop:    CFn<void>;
        cmdSavefiles:  CFn<void>;
        fastForward:   CFn<void>;
        getCoreOpts:   CFn<string>;
        setVariable:   CFn<void>;
        toggleShader:  CFn<void>;
        getVideoDimensions: CFn<number>;
        setPortDevice: CFn<void>;
        getPortInfo:   CFn<string>;
        getDiskCount:   CFn<number>;
        getCurrentDisk: CFn<number>;
        setCurrentDisk: CFn<void>;
        getMemoryData:  CFn<string>;
        frameCount:     CFn<number>;
        restart:        CFn<void>;
    };

    constructor(
        private readonly mod: LibretroModule,
        /** The GL canvas the core renders into. Read directly to grab cover snapshots. */
        public readonly videoCanvas: HTMLCanvasElement,
    ) {
        const w = <R>(name: string, ret: CwrapPrimitive, args: CwrapPrimitive[]): CFn<R> =>
            mod.cwrap<R>(name, ret, args);
        this.fn = {
            saveStateInfo: w<string>('save_state_info',    'string', []),
            loadState:     w<number>('load_state',         'number', ['string', 'number']),
            simulateInput: w<void>  ('simulate_input',     'null',   ['number', 'number', 'number']),
            toggleLoop:    w<void>  ('toggleMainLoop',     'null',   ['number']),
            cmdSavefiles:  w<void>  ('cmd_savefiles',      'null',   []),
            fastForward:   w<void>  ('toggle_fastforward', 'null',   ['number']),
            getCoreOpts:   w<string>('get_core_options',   'string', []),
            setVariable:   w<void>  ('ejs_set_variable',   'null',   ['string', 'string']),
            toggleShader:  w<void>  ('shader_enable',      'null',   ['number']),
            getVideoDimensions: w<number>('get_video_dimensions', 'number', ['string']),
            setPortDevice: w<void>  ('ejs_set_controller_port_device', 'null',   ['number', 'number']),
            getPortInfo:   w<string>('ejs_get_controller_port_info',   'string', []),
            getDiskCount:   w<number>('get_disk_count',   'number', []),
            getCurrentDisk: w<number>('get_current_disk', 'number', []),
            setCurrentDisk: w<void>  ('set_current_disk', 'null',   ['number']),
            getMemoryData:  w<string>('get_memory_data',  'string', ['string']),
            frameCount:     w<number>('get_current_frame_count', 'number', []),
            restart:        w<void>  ('system_restart',   'null',   []),
        };
    }

    // ASYNCIFY: cores like ppsspp serialize on the emu thread and the main-thread call
    // yields via emscripten_sleep, so cwrap returns a Promise. Sync cores return a string
    // directly; awaiting the non-Promise is a no-op.
    async saveState(): Promise<Uint8Array | null> {
        const info = await this.fn.saveStateInfo();
        const [sizeStr, ptrStr, ok] = info.split('|');
        if (ok !== '1') return null;
        const size = parseInt(sizeStr, 10);
        const ptr = parseInt(ptrStr, 10);
        return new Uint8Array(this.mod.HEAPU8.subarray(ptr, ptr + size));
    }

    async loadState(state: Uint8Array): Promise<void> {
        this.mod.FS.writeFile(STATE_FILE, state);
        await this.fn.loadState(STATE_FILE, 0);
    }

    pause():  void { this.fn.toggleLoop(0); }
    resume(): void { this.fn.toggleLoop(1); }

    saveSRAM(): void { this.fn.cmdSavefiles(); }
    syncSRAM(): void { this.mod.FS.syncfs(false, () => {}); }

    simulateInput(player: number, button: number, value: number): void {
        this.fn.simulateInput(player, button, value);
    }

    toggleFastForward(enabled: boolean): void { this.fn.fastForward(enabled ? 1 : 0); }
    toggleShader(enabled: boolean):      void { this.fn.toggleShader(enabled ? 1 : 0); }
    setVariable(option: string, value: string): void { this.fn.setVariable(option, value); }

    /** Raw EmulatorJS core-options dump. Returns '' if the core hasn't exported the function. */
    getCoreOptionsRaw(): string { return this.fn.getCoreOpts() ?? ''; }

    /** Tell the core which libretro device type is connected to a port. */
    setControllerPortDevice(port: number, device: number): void {
        try { this.fn.setPortDevice(port, device); } catch { /* core may not export */ }
    }

    /** Raw EmulatorJS port-info dump. Lines: `port:deviceId:description`. */
    getControllerPortInfoRaw(): string {
        try { return this.fn.getPortInfo() ?? ''; } catch { return ''; }
    }

    /** Discs in the core's disk-control playlist (m3u/pbp). 0 or 1 when not multi-disc. */
    getDiscCount(): number {
        try { return this.fn.getDiskCount() || 0; } catch { return 0; }
    }

    getCurrentDisc(): number {
        try { return this.fn.getCurrentDisk() || 0; } catch { return 0; }
    }

    setCurrentDisc(index: number): void {
        try { this.fn.setCurrentDisk(index); } catch { /* core may not export */ }
    }

    /**
     * [core-heap pointer, size] of a libretro memory block (RETRO_MEMORY_* id),
     * or [0, 0] if the core doesn't expose it.
     *
     * Deliberately not EmulatorJS's `EmulatorJSGetMemoryData` wrapper: the C
     * side returns a pointer into its own (already popped) stack frame and
     * the wrapper then free()s it. cwrap's 'string' return copies the text
     * out immediately and never frees.
     */
    getMemoryInfo(id: number): [number, number] {
        const key = MEMORY_KEYS[id];
        if (!key) return [0, 0];
        try {
            const [size, ptr] = (this.fn.getMemoryData(key) ?? '').split('|').map(Number);
            return Number.isFinite(size) && Number.isFinite(ptr) && ptr > 0 && size > 0 ? [ptr, size] : [0, 0];
        } catch {
            // e.g. mGBA traps before content is loaded
            return [0, 0];
        }
    }

    /**
     * The memory map the core registered (RETRO_ENVIRONMENT_SET_MEMORY_MAPS),
     * as the raw "flags|ptr|offset|start|select|disconnect|len;…" string from
     * the ejs_get_memory_map export (scripts/cores/retroarch-memory-map.patch).
     * null when the core predates the export; "" when it registered no map.
     */
    getMemoryMapRaw(): string | null {
        const fn = (this.mod as unknown as { _ejs_get_memory_map?: () => number })._ejs_get_memory_map;
        if (typeof fn !== 'function') return null;
        try {
            const ptr = fn();
            // Static buffer owned by RetroArch: read, never free.
            return ptr ? (this.mod as unknown as { UTF8ToString(p: number): string }).UTF8ToString(ptr) : '';
        } catch {
            return null;
        }
    }

    /** RetroArch main-loop iterations so far (advances once per emulated frame). */
    frameCount(): number {
        try { return this.fn.frameCount() || 0; } catch { return 0; }
    }

    /** Hard-reset the emulated system. */
    restart(): void {
        try { this.fn.restart(); } catch { /* core may not export */ }
    }

    get heap(): Uint8Array { return this.mod.HEAPU8; }

    /**
     * Core-reported DAR for the running game (e.g. ~4/3 for SNES, despite the 256×224
     * framebuffer). Returns 4/3 if the core doesn't export the function.
     */
    getDisplayAspect(): number {
        try {
            const v = this.fn.getVideoDimensions('aspect');
            if (Number.isFinite(v) && v > 0) return v;
        } catch { /* core may not export this */ }
        return DEFAULT_COVER_ASPECT;
    }
}
