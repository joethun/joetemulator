import type { CwrapPrimitive, LibretroModule } from '@/lib/ra/types';

const STATE_FILE = 'game.state';

export class GameController {
    private readonly saveStateInfo:     () => string;
    private readonly _loadState:        (path: string, slot: number) => number;
    private readonly _simulateInput:    (player: number, button: number, value: number) => void;
    private readonly toggleMainLoop:    (running: number) => void;
    private readonly saveSaveFiles:     () => void;
    private readonly _toggleFastForward: (enabled: number) => void;
    private readonly _getCoreOptions:   () => string;
    private readonly _setVariable:      (option: string, value: string) => void;
    private readonly _toggleShader:     (enabled: number) => void;

    constructor(public readonly mod: LibretroModule) {
        const w = <R>(name: string, ret: CwrapPrimitive, args: CwrapPrimitive[]) =>
            mod.cwrap<R>(name, ret, args);
        this.saveStateInfo      = w('save_state_info',    'string', []);
        this._loadState         = w('load_state',         'number', ['string', 'number']);
        this._simulateInput     = w('simulate_input',     'null',   ['number', 'number', 'number']);
        this.toggleMainLoop     = w('toggleMainLoop',     'null',   ['number']);
        this.saveSaveFiles      = w('cmd_savefiles',      'null',   []);
        this._toggleFastForward = w('toggle_fastforward', 'null',   ['number']);
        this._getCoreOptions    = w('get_core_options',   'string', []);
        this._setVariable       = w('ejs_set_variable',   'null',   ['string', 'string']);
        this._toggleShader      = w('shader_enable',      'null',   ['number']);
    }

    saveState(): Uint8Array {
        const [sizeStr, ptrStr, ok] = this.saveStateInfo().split('|');
        if (ok !== '1') throw new Error(sizeStr || 'save_state_info failed');
        const size = parseInt(sizeStr, 10);
        const ptr = parseInt(ptrStr, 10);
        return new Uint8Array(this.mod.HEAPU8.subarray(ptr, ptr + size));
    }

    loadState(state: Uint8Array): void {
        try { this.mod.FS.unlink(STATE_FILE); } catch { /* not present */ }
        this.mod.FS.writeFile(STATE_FILE, state);
        this._loadState(STATE_FILE, 0);
    }

    pause():  void { this.toggleMainLoop(0); }
    resume(): void { this.toggleMainLoop(1); }

    saveSRAM(): void { this.saveSaveFiles(); }
    syncSRAM(): void { this.mod.FS.syncfs(false, () => {}); }

    simulateInput(player: number, button: number, value: number): void {
        this._simulateInput(player, button, value);
    }

    toggleFastForward(enabled: boolean): void { this._toggleFastForward(enabled ? 1 : 0); }
    toggleShader(enabled: boolean): void { this._toggleShader(enabled ? 1 : 0); }
    setVariable(option: string, value: string): void { this._setVariable(option, value); }

    /** Raw EmulatorJS core-options dump. Returns '' if the core hasn't exported the function. */
    getCoreOptionsRaw(): string { return this._getCoreOptions() ?? ''; }
}
