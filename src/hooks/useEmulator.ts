'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Runtime, type RuntimeOptions } from '@/lib/ra/runtime';
import type { EmulatorPhase } from '@/lib/ra/types';
import {
    isStateDuplicate, getNextSlotKey, getSlotKeys, stampSlot,
    getStateBytes, putStateBytes, scheduleStateThumbnail, snapshotCover,
} from '@/lib/savestates';
import {
    loadStoredBindings, saveStoredBindings, resetStoredBindings,
} from '@/lib/ra/bindings-storage';
import type { CoreOption } from '@/lib/ra/core-options';
import { setCorePref } from '@/lib/ra/cores';
import type { InputBindings } from '@/lib/ra/input';

const MIN_AUTOSAVE_MS = 15_000;
const DEFAULT_AUTOSAVE_MS = 60_000;

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
    gameBaseName: string;
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
    stop: () => void;
    setBindings: (b: InputBindings) => void;
    resetBindings: () => void;
    getCoreOptions: () => CoreOption[];
    setCoreOption: (key: string, value: string) => void;
    resetCoreOptions: () => void;
    switchCore: (libretroName: string) => Promise<void>;
    setShader: (name: string) => void;
}

export interface EmulatorSession {
    /** Start a new game. Stops any running session first. */
    start: (args: StartArgs) => Promise<void>;
    /** Attach this ref to the <canvas> element that will host the emulator. */
    canvasRef: RefObject<HTMLCanvasElement | null>;
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
    const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const saveOnExitRef = useRef(false);
    const startArgsRef = useRef<StartArgs | null>(null);
    const bindingsRef = useRef<InputBindings>(loadStoredBindings());
    const pausedRef = useRef(false);

    const [status, setStatus] = useState<SessionStatus>(IDLE_STATUS);
    const [bindings, setBindingsState] = useState<InputBindings>(bindingsRef.current);
    const patchStatus = useCallback(
        (p: Partial<SessionStatus>) => setStatus(s => ({ ...s, ...p })),
        [],
    );

    const saveState = useCallback(async (source: 'manual' | 'auto' | 'exit' = 'manual') => {
        const rt = runtimeRef.current;
        const gc = rt?.controller;
        const game = startArgsRef.current?.gameBaseName;
        if (!gc || !game) return;
        // Skip timed/manual saves while paused — the core hasn't advanced. Exit saves
        // still run so "save on exit" works when leaving a paused game.
        if (source !== 'exit' && pausedRef.current) return;
        try {
            const bytes = gc.saveState();
            // Capture now — save-on-exit tears the canvas down before any async work.
            const snapshot = snapshotCover(gc.videoCanvas, gc.getDisplayAspect());

            if (source === 'auto' && await isStateDuplicate(game, bytes)) return;
            const slotKey = getNextSlotKey(game);
            stampSlot(slotKey);
            await putStateBytes(slotKey, bytes);
            if (source !== 'exit') notify('save', source);
            if (snapshot) scheduleStateThumbnail(slotKey, game, snapshot);
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
            rt.controller.loadState(data);
            notify('load', source);
        } catch (e) {
            console.error('load state failed:', e);
        }
    }, []);

    const stop = useCallback(() => {
        if (saveOnExitRef.current && runtimeRef.current && startArgsRef.current) {
            saveState('exit').catch(e => console.error('save on exit failed:', e));
        }
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
        const canvas = canvasRef.current;
        if (!canvas) {
            throw new Error('useEmulator: canvasRef has no current canvas. Render <EmulatorView session={...}/> before calling start().');
        }
        if (runtimeRef.current) stop();

        startArgsRef.current = args;
        const { gameBaseName, opts: userOpts = {}, ...runtimeOpts } = args;

        setStatus({
            ...IDLE_STATUS,
            phase: 'loading-core',
            game: gameBaseName,
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
            stop();
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

    useEffect(() => () => stop(), [stop]);

    const actions = useMemo<EmulatorActions>(() => ({
        saveState, loadState, stop, switchCore,
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
        getCoreOptions:   () => runtimeRef.current?.getCoreOptions() ?? [],
        setCoreOption:    (key, value) => runtimeRef.current?.setCoreOption(key, value),
        resetCoreOptions: () => runtimeRef.current?.resetCoreOptions(),
        setShader:        (name) => runtimeRef.current?.setShader(name),
    }), [saveState, loadState, stop, switchCore, patchStatus]);

    return useMemo<EmulatorSession>(() => ({
        start, canvasRef, actions,
        phase: status.phase,
        message: status.message,
        paused: status.paused,
        error: status.error,
        currentGame: status.game,
        currentCore: status.system,
        currentLibretroCore: status.libretroCore,
        bindings,
    }), [start, actions, status, bindings]);
}
