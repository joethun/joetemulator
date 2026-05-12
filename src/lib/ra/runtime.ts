import { ensureAudioPatch } from '@/lib/ra/audio';
import { resolveLibretroCore } from '@/lib/ra/cores';
import {
    parseCoreOptions, loadStoredCoreOptions, saveStoredCoreOption, clearStoredCoreOptions,
    type CoreOption,
} from '@/lib/ra/core-options';
import {
    mountSaveFS, unmountSaveFS, writeFile, writeCoreOptionsFile,
    RETROARCH_CFG, RA_CFG_PATH,
} from '@/lib/ra/fs';
import { GameController } from '@/lib/ra/game';
import { InputController, DEFAULT_BINDINGS, type InputBindings, type InputHandlers } from '@/lib/ra/input';
import { disposeCoreScripts, loadCore } from '@/lib/ra/loader';
import {
    loadShaderMap, writeShaderFiles, getStoredShader, setStoredShader,
    SHADER_DISABLED,
} from '@/lib/ra/shaders';
import type { EmulatorPhase, LibretroModule, ResolvedCore } from '@/lib/ra/types';

const SRM_SYNC_INTERVAL_MS = 10_000;

export interface RuntimeOptions {
    canvas: HTMLCanvasElement;
    system: string;
    coreOverride?: string;
    rom: { name: string; bytes: Uint8Array };
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

    get controller(): GameController | null { return this.gc; }
    get libretroName(): string | null { return this.resolved?.libretroName ?? null; }

    async start(opts: RuntimeOptions): Promise<void> {
        const { canvas, system, coreOverride, rom, bindings, handlers, onPhase } = opts;

        // Patch AudioContext before the core's module factory creates one.
        ensureAudioPatch();

        onPhase?.('loading-core');
        const libretroName = resolveLibretroCore(system, coreOverride);
        this.resolved = await loadCore(libretroName, msg => onPhase?.('loading-core', msg));

        onPhase?.('booting');
        const { coreInfo, wasmUrl, moduleFactory } = this.resolved;
        this.mod = await moduleFactory({
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

        await mountSaveFS(this.mod);
        writeFile(this.mod, RA_CFG_PATH, RETROARCH_CFG);
        writeCoreOptionsFile(this.mod, coreInfo);
        writeFile(this.mod, '/' + rom.name, rom.bytes);

        this.gc = new GameController(this.mod);
        this.input = new InputController(
            this.gc,
            { ...DEFAULT_BINDINGS, ...bindings },
            handlers ?? {},
        );

        onPhase?.('running');
        this.mod.callMain(['/' + rom.name]);
        this.mod.resumeMainLoop();
        canvas.focus();
        this.input.attach();

        // Replay any persisted core option overrides now that the core is live.
        for (const [key, value] of Object.entries(loadStoredCoreOptions(libretroName))) {
            this.gc.setVariable(key, value);
        }

        this.srmTimer = setInterval(() => {
            this.gc?.saveSRAM();
            this.gc?.syncSRAM();
        }, SRM_SYNC_INTERVAL_MS);

        // Re-apply the user's last shader for this core, if any.
        const storedShader = getStoredShader(libretroName);
        if (storedShader !== SHADER_DISABLED) {
            loadShaderMap().then(() => this.setShader(storedShader)).catch(() => {});
        }
    }

    pause():  void { this.gc?.pause(); }
    resume(): void { this.gc?.resume(); }
    setInputBindings(b: InputBindings): void { this.input?.setBindings(b); }

    getCoreOptions(): CoreOption[] {
        if (!this.gc || !this.resolved) return [];
        const raw = this.gc.getCoreOptionsRaw();
        const parsed = parseCoreOptions(raw, this.resolved.libretroName);
        const stored = loadStoredCoreOptions(this.resolved.libretroName);
        // Surface the user's saved value (set live via setVariable, but the core
        // still reports its own internal current value in get_core_options).
        return parsed.map(opt => stored[opt.key] ? { ...opt, current: stored[opt.key] } : opt);
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

    resetCoreOptions(): void {
        if (!this.gc || !this.resolved) return;
        for (const opt of parseCoreOptions(this.gc.getCoreOptionsRaw(), this.resolved.libretroName)) {
            this.gc.setVariable(opt.key, opt.defaultValue);
        }
        clearStoredCoreOptions(this.resolved.libretroName);
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
        disposeCoreScripts();
    }
}
