import type { CwrapPrimitive, LibretroModule } from '@/lib/ra/types';

const STATE_FILE = 'game.state';

type CFn<R> = (...args: unknown[]) => R;

export class GameController {
    private readonly fn: {
        saveStateInfo: CFn<string>;
        loadState:     CFn<number>;
        simulateInput: CFn<void>;
        toggleLoop:    CFn<void>;
        cmdSavefiles:  CFn<void>;
        fastForward:   CFn<void>;
        rewind:        CFn<void>;
        getCoreOpts:   CFn<string>;
        setVariable:   CFn<void>;
        toggleShader:  CFn<void>;
    };

    constructor(public readonly mod: LibretroModule) {
        const w = <R>(name: string, ret: CwrapPrimitive, args: CwrapPrimitive[]) =>
            mod.cwrap<R>(name, ret, args) as CFn<R>;
        this.fn = {
            saveStateInfo: w<string>('save_state_info',    'string', []),
            loadState:     w<number>('load_state',         'number', ['string', 'number']),
            simulateInput: w<void>  ('simulate_input',     'null',   ['number', 'number', 'number']),
            toggleLoop:    w<void>  ('toggleMainLoop',     'null',   ['number']),
            cmdSavefiles:  w<void>  ('cmd_savefiles',      'null',   []),
            fastForward:   w<void>  ('toggle_fastforward', 'null',   ['number']),
            rewind:        w<void>  ('toggle_rewind',      'null',   ['number']),
            getCoreOpts:   w<string>('get_core_options',   'string', []),
            setVariable:   w<void>  ('ejs_set_variable',   'null',   ['string', 'string']),
            toggleShader:  w<void>  ('shader_enable',      'null',   ['number']),
        };
    }

    saveState(): Uint8Array {
        const [sizeStr, ptrStr, ok] = this.fn.saveStateInfo().split('|');
        if (ok !== '1') throw new Error('save_state_info failed');
        const size = parseInt(sizeStr, 10);
        const ptr = parseInt(ptrStr, 10);
        return new Uint8Array(this.mod.HEAPU8.subarray(ptr, ptr + size));
    }

    loadState(state: Uint8Array): void {
        try { this.mod.FS.unlink(STATE_FILE); } catch { /* not present */ }
        this.mod.FS.writeFile(STATE_FILE, state);
        this.fn.loadState(STATE_FILE, 0);
    }

    pause():  void { this.fn.toggleLoop(0); }
    resume(): void { this.fn.toggleLoop(1); }

    saveSRAM(): void { this.fn.cmdSavefiles(); }
    syncSRAM(): void { this.mod.FS.syncfs(false, () => {}); }

    simulateInput(player: number, button: number, value: number): void {
        this.fn.simulateInput(player, button, value);
    }

    toggleFastForward(enabled: boolean): void { this.fn.fastForward(enabled ? 1 : 0); }
    toggleRewind(enabled: boolean):      void { this.fn.rewind(enabled ? 1 : 0); }
    toggleShader(enabled: boolean):      void { this.fn.toggleShader(enabled ? 1 : 0); }
    setVariable(option: string, value: string): void { this.fn.setVariable(option, value); }

    /** Raw EmulatorJS core-options dump. Returns '' if the core hasn't exported the function. */
    getCoreOptionsRaw(): string { return this.fn.getCoreOpts() ?? ''; }
}
