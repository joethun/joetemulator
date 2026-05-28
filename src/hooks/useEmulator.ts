'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Runtime, type RuntimeOptions } from '@/lib/ra/runtime';
import type { EmulatorPhase } from '@/lib/ra/types';
import {
    isStateDuplicate, getNextSlotKey, getSlotKeys, stampSlot,
    getStateBytes, putStateBytes, scheduleStateThumbnail, persistStateThumbnailNow, snapshotCover,
} from '@/lib/savestates';
import {
    loadStoredBindings, saveStoredBindings, resetStoredBindings,
} from '@/lib/ra/bindings-storage';
import type { CoreOption } from '@/lib/ra/core-options';
import { setCorePref } from '@/lib/ra/cores';
import type { InputBindings } from '@/lib/ra/input';
import type { ControllerPort } from '@/lib/ra/controllers';

const MIN_AUTOSAVE_MS = 15_000;
const DEFAULT_AUTOSAVE_MS = 60_000;

// Stable empty arrays so memo'd consumers don't see a new reference each render
// when the runtime is null.
const EMPTY_CONTROLLER_PORTS: ControllerPort[] = [];
const EMPTY_CORE_OPTIONS: CoreOption[] = [];

const notify = (type: 'save' | 'load', source: 'manual' | 'auto'): void => {
    window.dispatchEvent(new CustomEvent('emulator_notification', { detail: { type, source } }));
};

interface UseEmulatorOpts {
    autoSave?: boolean;
    autoLoad?: boolean;
    autoSaveInterval?: number;     // ms
    saveOnExit?: boolean;
}

type StartArgs = Omit<RuntimeOptions, 'canvas' | 'handlers' | 'onPhase'> & {
    opts?: UseEmulatorOpts;
};

interface SessionStatus {
    phase: EmulatorPhase;
    message: string;
    paused: boolean;
    error: string | null;
    game: string | null;
    system: string | null;
    libretroCore: string | null;
}

const IDLE_STATUS: SessionStatus = {
    phase: 'idle', message: '', paused: false, error: null,
    game: null, system: null, libretroCore: null,
};

interface EmulatorActions {
    pause: () => void;
    resume: () => void;
    saveState: (source?: 'manual' | 'auto' | 'exit') => Promise<void>;
    loadState: (key?: string, source?: 'manual' | 'auto') => Promise<void>;
    stop: () => Promise<void>;
    /** Flush save-on-exit (if enabled) without tearing down the runtime — used
     * by the in-game exit button, which reloads the page rather than going
     * through the full stop/idle transition. */
    flushExitSave: () => Promise<void>;
    setBindings: (b: InputBindings) => void;
    resetBindings: () => void;
    getCoreOptions: () => CoreOption[];
    setCoreOption: (key: string, value: string) => void;
    resetCoreOptions: () => void;
    getControllerPorts: () => readonly ControllerPort[];
    setControllerDevice: (port: number, deviceId: number) => void;
    switchCore: (libretroName: string) => Promise<void>;
    setShader: (name: string) => void;
}

export interface EmulatorSession {
    /** Start a new game. Stops any running session first. */
    start: (args: StartArgs) => Promise<void>;
    /** Read-only ref to the currently mounted <canvas> (or null between sessions). */
    canvasRef: RefObject<HTMLCanvasElement | null>;
    /** Ref callback for the <canvas>. Pass to React `ref={...}`. */
    setCanvas: (el: HTMLCanvasElement | null) => void;
    /** Bumps each session. Pass as the canvas `key` so React remounts it and we get a fresh GL context. */
    canvasEpoch: number;
    actions: EmulatorActions;
    phase: EmulatorPhase;
    message: string;
    paused: boolean;
    error: string | null;
    currentGame: string | null;
    currentCore: string | null;
    currentLibretroCore: string | null;
    bindings: InputBindings;
}

export function useEmulator(): EmulatorSession {
    const runtimeRef = useRef<Runtime | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasReadyResolvers = useRef<Array<(c: HTMLCanvasElement) => void>>([]);
    const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const saveOnExitRef = useRef(false);
    const startArgsRef = useRef<StartArgs | null>(null);
    const bindingsRef = useRef<InputBindings>(loadStoredBindings());
    const pausedRef = useRef(false);
    const startingRef = useRef(false);

    const [status, setStatus] = useState<SessionStatus>(IDLE_STATUS);
    const [canvasEpoch, setCanvasEpoch] = useState(0);
    const [bindings, setBindingsState] = useState<InputBindings>(loadStoredBindings);
    const patchStatus = useCallback(
        (p: Partial<SessionStatus>) => setStatus(s => ({ ...s, ...p })),
        [],
    );

    // Cores leak GL state into the shared WebGL context; each session needs a fresh one.
    const setCanvas = useCallback((el: HTMLCanvasElement | null) => {
        canvasRef.current = el;
        if (el) {
            const pending = canvasReadyResolvers.current;
            canvasReadyResolvers.current = [];
            pending.forEach(resolve => resolve(el));
        }
    }, []);

    const saveState = useCallback(async (source: 'manual' | 'auto' | 'exit' = 'manual') => {
        const rt = runtimeRef.current;
        const gc = rt?.controller;
        const game = startArgsRef.current?.gameBaseName;
        if (!gc || !game) return;
        // Skip timed/manual saves while paused — the core hasn't advanced. Exit saves
        // still run so "save on exit" works when leaving a paused game.
        if (source !== 'exit' && pausedRef.current) return;
        try {
            const bytes = await gc.saveState();
            if (!bytes) return;
            if (source === 'auto' && await isStateDuplicate(game, bytes)) return;
            // Capture now — save-on-exit tears the canvas down before any async work.
            const snapshot = snapshotCover(gc.videoCanvas, gc.getDisplayAspect());

            const slotKey = getNextSlotKey(game);
            stampSlot(slotKey);
            await putStateBytes(slotKey, bytes);
            if (source !== 'exit') notify('save', source);
            if (snapshot) {
                // Exit-saves await the thumbnail inline — the caller is about
                // to reload the page, so the deferred RAF/idle encode would
                // never run.
                if (source === 'exit') await persistStateThumbnailNow(slotKey, game, snapshot);
                else scheduleStateThumbnail(slotKey, game, snapshot);
            }
        } catch (e) {
            console.error('save state failed:', e);
        }
    }, []);

    const loadState = useCallback(async (specificKey?: string, source: 'manual' | 'auto' = 'manual') => {
        const rt = runtimeRef.current;
        const game = startArgsRef.current?.gameBaseName;
        if (!rt?.controller || !game) return;
        try {
            const key = specificKey ?? getSlotKeys(game).at(-1);
            if (!key) return;
            const data = await getStateBytes(key);
            if (!data) return;
            await rt.controller.loadState(data);
            notify('load', source);
        } catch (e) {
            console.error('load state failed:', e);
        }
    }, []);

    const stop = useCallback(async () => {
        // Save-on-exit must complete BEFORE destroy() — destroy aborts the wasm
        // runtime, which would orphan any in-flight async serialize (ASYNCIFY cores
        // like ppsspp).
        if (saveOnExitRef.current && runtimeRef.current && startArgsRef.current) {
            await saveState('exit');
        }
        canvasReadyResolvers.current = [];
        if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
        runtimeRef.current?.destroy();
        runtimeRef.current = null;
        saveOnExitRef.current = false;
        startArgsRef.current = null;
        pausedRef.current = false;
        setStatus(IDLE_STATUS);
    }, [saveState]);

    const start: EmulatorSession['start'] = useCallback(async (args) => {
        if (!canvasRef.current) {
            throw new Error('useEmulator: canvasRef has no current canvas. Render <EmulatorView session={...}/> before calling start().');
        }
        // Re-entry guard: rapid double clicks call start() twice before runtimeRef
        // is set, which would otherwise spawn two Runtimes on the same canvas.
        if (startingRef.current) return;
        startingRef.current = true;
        try {
            if (runtimeRef.current) await stop();

            const canvas = await new Promise<HTMLCanvasElement>(resolve => {
                canvasReadyResolvers.current.push(resolve);
                setCanvasEpoch(e => e + 1);
            });

            startArgsRef.current = args;
            const { opts: userOpts = {}, ...runtimeOpts } = args;

            setStatus({
                ...IDLE_STATUS,
                phase: 'loading-core',
                game: runtimeOpts.gameBaseName,
                system: runtimeOpts.system,
            });

            const rt = new Runtime();
            runtimeRef.current = rt;

            try {
                await rt.start({
                    ...runtimeOpts,
                    canvas,
                    bindings: bindingsRef.current,
                    handlers: {
                        onSaveState: () => saveState('manual'),
                        onLoadState: () => loadState(undefined, 'manual'),
                    },
                    onPhase: (p, m) => patchStatus(m ? { phase: p, message: m } : { phase: p }),
                });

                patchStatus({ phase: 'running', paused: false, libretroCore: rt.libretroName });

                saveOnExitRef.current = userOpts.saveOnExit ?? false;
                if (userOpts.autoLoad) loadState(undefined, 'auto');
                if (userOpts.autoSave) {
                    const ms = Math.max(MIN_AUTOSAVE_MS, userOpts.autoSaveInterval ?? DEFAULT_AUTOSAVE_MS);
                    autoSaveTimerRef.current = setInterval(() => {
                        if (runtimeRef.current && !document.hidden) saveState('auto');
                    }, ms);
                }
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                console.error('emulator start failed:', e);
                patchStatus({ error: msg, phase: 'error' });
                await stop();
            }
        } finally {
            startingRef.current = false;
        }
    }, [stop, saveState, loadState, patchStatus]);

    const switchCore = useCallback(async (libretroName: string) => {
        const prev = startArgsRef.current;
        if (!prev) return;
        setCorePref(prev.system, libretroName);
        // saveOnExit is desired across normal exits; suppress it for in-place
        // core swap so the user doesn't get a phantom auto-save.
        saveOnExitRef.current = false;
        await start({ ...prev, coreOverride: libretroName });
    }, [start]);

    useEffect(() => () => { void stop(); }, [stop]);

    const flushExitSave = useCallback(async () => {
        if (saveOnExitRef.current && runtimeRef.current && startArgsRef.current) {
            await saveState('exit');
        }
    }, [saveState]);

    const actions = useMemo<EmulatorActions>(() => ({
        saveState, loadState, stop, switchCore, flushExitSave,
        pause:  () => { runtimeRef.current?.pause();  pausedRef.current = true;  patchStatus({ paused: true  }); },
        resume: () => { runtimeRef.current?.resume(); pausedRef.current = false; patchStatus({ paused: false }); },
        setBindings: (b) => {
            bindingsRef.current = b;
            setBindingsState(b);
            saveStoredBindings(b);
            runtimeRef.current?.setInputBindings(b);
        },
        resetBindings: () => {
            const defaults = resetStoredBindings();
            bindingsRef.current = defaults;
            setBindingsState(defaults);
            runtimeRef.current?.setInputBindings(defaults);
        },
        getCoreOptions:   () => runtimeRef.current?.getCoreOptions() ?? EMPTY_CORE_OPTIONS,
        setCoreOption:    (key, value) => runtimeRef.current?.setCoreOption(key, value),
        resetCoreOptions: () => runtimeRef.current?.resetCoreOptions(),
        getControllerPorts:  () => runtimeRef.current?.getControllerPorts() ?? EMPTY_CONTROLLER_PORTS,
        setControllerDevice: (port, deviceId) => runtimeRef.current?.setControllerDevice(port, deviceId),
        setShader:        (name) => runtimeRef.current?.setShader(name),
    }), [saveState, loadState, stop, switchCore, flushExitSave, patchStatus]);

    return useMemo<EmulatorSession>(() => ({
        start, canvasRef, setCanvas, canvasEpoch, actions,
        phase: status.phase,
        message: status.message,
        paused: status.paused,
        error: status.error,
        currentGame: status.game,
        currentCore: status.system,
        currentLibretroCore: status.libretroCore,
        bindings,
    }), [start, setCanvas, canvasEpoch, actions, status, bindings]);
}
