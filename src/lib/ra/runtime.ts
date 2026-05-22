import { ensureAudioPatch } from '@/lib/ra/audio';
import { resolveLibretroCore } from '@/lib/ra/cores';
import {
    parseCoreOptions, loadStoredCoreOptions, saveStoredCoreOption, clearStoredCoreOptions,
    type CoreOption,
} from '@/lib/ra/core-options';
import {
    parseControllerPortInfo, loadStoredControllerDevices, saveStoredControllerDevice,
    resolveDeviceForPort, type ControllerPort,
} from '@/lib/ra/controllers';
import {
    mountSaveFS, unmountSaveFS, writeFile, writeCoreOptionsFile,
    RETROARCH_CFG, RA_CFG_PATH,
} from '@/lib/ra/fs';
import { GameController } from '@/lib/ra/game';
import {
    InputController, DEFAULT_BINDINGS, filterBindingsToButtons,
    type InputBindings, type InputHandlers,
} from '@/lib/ra/input';
import { getRetroIdsForCore } from '@/lib/ra/control-schemes';
import { disposeCoreScripts, loadCore } from '@/lib/ra/loader';
import {
    writeShaderFiles, getStoredShader, setStoredShader, SHADER_DISABLED,
} from '@/lib/ra/shaders';
import type { EmulatorPhase, LibretroModule, ResolvedCore } from '@/lib/ra/types';

const SRM_SYNC_INTERVAL_MS = 10_000;

const patchedCanvases = new WeakSet<HTMLCanvasElement>();

function forcePreserveDrawingBuffer(canvas: HTMLCanvasElement): void {
    if (patchedCanvases.has(canvas)) return;
    type GetContext = (id: string, opts?: object) => RenderingContext | null;
    const orig = canvas.getContext.bind(canvas) as GetContext;
    (canvas as unknown as { getContext: GetContext }).getContext =
        (id, opts) => orig(id, { ...opts, preserveDrawingBuffer: true });
    patchedCanvases.add(canvas);
}

export interface RuntimeOptions {
    canvas: HTMLCanvasElement;
    system: string;
    coreOverride?: string;
    rom: { name: string; bytes: Uint8Array };
    gameBaseName: string;
    bindings?: Partial<InputBindings>;
    handlers?: InputHandlers;
    onPhase?: (phase: EmulatorPhase, message?: string) => void;
}

export class Runtime {
    private mod: LibretroModule | null = null;
    private gc: GameController | null = null;
    private input: InputController | null = null;
    private resolved: ResolvedCore | null = null;
    private srmTimer: ReturnType<typeof setInterval> | null = null;
    private controllerPorts: ControllerPort[] = [];
    private allowedRetroIds: ReadonlySet<number> | null = null;
    private gameBaseName: string | null = null;

    get controller(): GameController | null { return this.gc; }
    get libretroName(): string | null { return this.resolved?.libretroName ?? null; }
    getControllerPorts(): readonly ControllerPort[] { return this.controllerPorts; }

    async start(opts: RuntimeOptions): Promise<void> {
        const { canvas, system, coreOverride, rom, gameBaseName, bindings, handlers, onPhase } = opts;
        this.gameBaseName = gameBaseName;

        // Patch AudioContext before the core's module factory creates one.
        ensureAudioPatch();

        // Cover snapshots use toBlob; without this flag the readback is blank.
        forcePreserveDrawingBuffer(canvas);

        onPhase?.('loading-core');
        const resolved = await loadCore(
            resolveLibretroCore(system, coreOverride),
            msg => onPhase?.('loading-core', msg),
        );
        this.resolved = resolved;
        const { libretroName, coreInfo, wasmUrl, moduleFactory } = resolved;

        onPhase?.('booting');
        const mod = await moduleFactory({
            canvas,
            // Emscripten registers `specialHTMLTargets["!parent"] = Module.parent` and looks
            // it up via findEventTarget. Without this, the core eventually calls
            // document.querySelector("!parent") and throws SyntaxError.
            parent: canvas.parentElement ?? document.body,
            print:    (msg: string) => console.debug('[core]', msg),
            printErr: (msg: string) => console.warn('[core]', msg),
            locateFile: (fileName: string) => {
                if (fileName.endsWith('.wasm')) return wasmUrl;
                if (fileName.endsWith('.worker.js')) return wasmUrl.replace(/\.wasm$/, '.worker.js');
                return fileName;
            },
            getSavExt: () => coreInfo.save ? `.${coreInfo.save}` : '.srm',
            noInitialRun: true,
        });
        this.mod = mod;

        await mountSaveFS(mod);
        writeFile(mod, RA_CFG_PATH, RETROARCH_CFG);
        writeCoreOptionsFile(mod, coreInfo);
        const romPath = '/' + rom.name;
        writeFile(mod, romPath, rom.bytes);

        const gc = new GameController(mod, canvas);
        this.gc = gc;
        this.allowedRetroIds = getRetroIdsForCore(system);
        const merged = { ...DEFAULT_BINDINGS, ...bindings };
        this.input = new InputController(
            gc,
            filterBindingsToButtons(merged, this.allowedRetroIds),
            handlers ?? {},
        );

        onPhase?.('running');
        mod.callMain([romPath]);
        mod.resumeMainLoop();
        canvas.focus();
        this.input.attach();

        // Replay any persisted core option overrides now that the core is live.
        for (const [key, value] of Object.entries(loadStoredCoreOptions(libretroName))) {
            gc.setVariable(key, value);
        }

        // Probe and apply controller-port device selection. Core reports which
        // devices each port supports; we prefer the user's saved pick, falling
        // back to an analog-capable device when available so the analog stick
        // is actually recognised on cores whose default device is digital-only
        // (e.g. PCSX-ReARMed → DualShock).
        this.controllerPorts = parseControllerPortInfo(gc.getControllerPortInfoRaw());
        const storedDevices = loadStoredControllerDevices(gameBaseName);
        for (const port of this.controllerPorts) {
            const device = resolveDeviceForPort(port, storedDevices);
            if (device != null) {
                gc.setControllerPortDevice(port.port, device);
                port.currentDevice = device;
            }
        }

        this.srmTimer = setInterval(() => { gc.saveSRAM(); gc.syncSRAM(); }, SRM_SYNC_INTERVAL_MS);

        // Re-apply the user's last shader. Swallow errors so a missing/renamed
        // shader doesn't break the boot — the core just runs without one.
        const storedShader = getStoredShader(libretroName);
        if (storedShader !== SHADER_DISABLED) {
            try { this.setShader(storedShader); } catch { /* shader unavailable */ }
        }
    }

    pause():  void { this.gc?.pause(); }
    resume(): void { this.gc?.resume(); }
    setInputBindings(b: InputBindings): void {
        if (!this.input || !this.allowedRetroIds) return;
        this.input.setBindings(filterBindingsToButtons(b, this.allowedRetroIds));
    }

    getCoreOptions(): CoreOption[] {
        if (!this.gc || !this.resolved) return [];
        const { libretroName } = this.resolved;
        const stored = loadStoredCoreOptions(libretroName);
        // Surface the user's saved value (set live via setVariable, but the core
        // still reports its own internal current value in get_core_options).
        return parseCoreOptions(this.gc.getCoreOptionsRaw(), libretroName)
            .map(opt => stored[opt.key] ? { ...opt, current: stored[opt.key] } : opt);
    }

    setShader(name: string): void {
        if (!this.mod || !this.gc || !this.resolved) return;
        this.gc.toggleShader(writeShaderFiles(this.mod, name));
        setStoredShader(this.resolved.libretroName, name);
    }

    setCoreOption(key: string, value: string): void {
        if (!this.gc || !this.resolved) return;
        this.gc.setVariable(key, value);
        saveStoredCoreOption(this.resolved.libretroName, key, value);
    }

    setControllerDevice(port: number, deviceId: number): void {
        if (!this.gc || !this.gameBaseName) return;
        this.gc.setControllerPortDevice(port, deviceId);
        saveStoredControllerDevice(this.gameBaseName, port, deviceId);
        const entry = this.controllerPorts.find(p => p.port === port);
        if (entry) entry.currentDevice = deviceId;
    }

    resetCoreOptions(): void {
        if (!this.gc || !this.resolved) return;
        const { libretroName } = this.resolved;
        for (const opt of parseCoreOptions(this.gc.getCoreOptionsRaw(), libretroName)) {
            this.gc.setVariable(opt.key, opt.defaultValue);
        }
        clearStoredCoreOptions(libretroName);
    }

    destroy(): void {
        if (this.srmTimer) clearInterval(this.srmTimer);
        this.srmTimer = null;

        try { this.gc?.saveSRAM(); } catch { /* core may already be torn down */ }
        this.input?.detach();
        if (this.mod) {
            unmountSaveFS(this.mod);
            // Emscripten's abort() throws a RuntimeError to halt execution — swallow it.
            try { this.mod.abort?.(); } catch { /* expected */ }
        }
        this.mod = null;
        this.gc = null;
        this.input = null;
        this.resolved = null;
        this.controllerPorts = [];
        this.allowedRetroIds = null;
        this.gameBaseName = null;
        disposeCoreScripts();
    }
}
