'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Runtime, type RuntimeOptions, type DiscInfo } from '@/lib/ra/runtime';
import type { EmulatorPhase } from '@/lib/ra/types';
import {
    isStateDuplicate, getNextSlotKey, getSlotKeys, stampSlot,
    getStateBytes, putStateBytes, scheduleStateThumbnail, persistStateThumbnailNow, snapshotCover,
    notifyEmulator, getStateCheevosProgress, putStateCheevosProgress,
    isBlankSave, type SlotRef,
} from '@/lib/savestates';
import { CheevosSession } from '@/lib/cheevos/session';
import { loadCredentials, pushCheevosToast, pushHardcoreToast, type RACredentials } from '@/lib/cheevos/store';
import {
    loadStoredBindings, saveStoredBindings, resetStoredBindings,
} from '@/lib/ra/bindings-storage';
import type { CoreOption } from '@/lib/ra/core-options';
import { setCorePref } from '@/lib/ra/cores';
import type { InputBindings } from '@/lib/ra/input';
import type { ControllerPort } from '@/lib/ra/controllers';

const MIN_AUTOSAVE_MS = 15_000;
const DEFAULT_AUTOSAVE_MS = 60_000;
/** How often save RAM is checked for an in-game save. */
const SAVE_WATCH_MS = 1000;
/** Polls save RAM must hold still before it's captured, so a save the game is
 *  still writing (flash saves take a moment) isn't caught half-written. */
const SAVE_SETTLE_TICKS = 2;

/** Save RAM change tracking: `captured` is the content last stored (or
 *  loaded), `seen` the last poll, `stable` how many polls it held still. */
interface SaveWatch {
    timer: ReturnType<typeof setInterval>;
    captured: number | null;
    seen: number | null;
    stable: number;
}

/** Treat save RAM's current content as already stored, so it isn't captured. */
function markSaveCaptured(watch: SaveWatch | null, hash: number | null): void {
    if (watch) { watch.captured = watch.seen = hash; watch.stable = 0; }
}

// Stable empty arrays so memo'd consumers don't see a new reference each render
// when the runtime is null.
const EMPTY_CONTROLLER_PORTS: ControllerPort[] = [];
const EMPTY_CORE_OPTIONS: CoreOption[] = [];
const EMPTY_DISC_INFO: DiscInfo = { count: 0, current: 0 };

interface UseEmulatorOpts {
    /** Save/load states (button, hotkeys, autosave, autoload, save on exit). Default on. */
    saveStates?: boolean;
    /** Keep a copy of the game's save file each time it saves in-game. */
    saveFiles?: boolean;
    autoSave?: boolean;
    autoLoad?: boolean;
    autoSaveInterval?: number;     // ms
    saveOnExit?: boolean;
    /** Run RetroAchievements for this game (requires a stored login). */
    cheevos?: { hardcore: boolean };
}

type StartArgs = Omit<RuntimeOptions, 'canvas' | 'handlers' | 'onPhase'> & {
    opts?: UseEmulatorOpts;
    /** Clean game title for display. Falls back to gameBaseName (the
     * filename-derived save key) when omitted. Kept separate so multi-disc
     * games show "Game", not the disc-1 filename. */
    gameTitle?: string;
};

interface SessionStatus {
    phase: EmulatorPhase;
    message: string;
    paused: boolean;
    error: string | null;
    game: string | null;
    title: string | null;
    system: string | null;
    libretroCore: string | null;
    statesEnabled: boolean;
}

const IDLE_STATUS: SessionStatus = {
    phase: 'idle', message: '', paused: false, error: null,
    game: null, title: null, system: null, libretroCore: null, statesEnabled: true,
};

interface EmulatorActions {
    pause: () => void;
    resume: () => void;
    /** Save a new state. No-op when save states are turned off. */
    saveState: (source?: 'manual' | 'auto' | 'exit') => Promise<void>;
    /** Load a slot (a save file resets the game into it), or with none the
     *  latest state. */
    loadState: (slot?: SlotRef, source?: 'manual' | 'auto') => Promise<void>;
    /** Flush save-on-exit (if enabled) and any in-game save not yet captured,
     * without tearing down the runtime — used
     * by the in-game exit button, which reloads the page rather than going
     * through the full stop/idle transition. */
    flushExitSave: () => Promise<void>;
    setBindings: (b: InputBindings) => void;
    resetBindings: () => void;
    getCoreOptions: () => CoreOption[];
    /** Refused (with a toast) when the value is banned in hardcore. */
    setCoreOption: (key: string, value: string) => void;
    resetCoreOptions: () => void;
    getControllerPorts: () => readonly ControllerPort[];
    setControllerDevice: (port: number, deviceId: number) => void;
    getDiscInfo: () => DiscInfo;
    setDisc: (index: number) => void;
    switchCore: (libretroName: string) => Promise<void>;
    setShader: (name: string) => void;
    /** Whether the player may pause now. Hardcore throttles pausing
     *  (rc_client_can_pause) so pause-buffering can't be used to react
     *  frame-perfectly; a refusal is explained in a toast. */
    requestPause: () => boolean;
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
    /** Filename-derived save-state key for the running game (stable across discs). */
    currentGame: string | null;
    /** Clean title for display; differs from currentGame for multi-disc games. */
    currentTitle: string | null;
    currentCore: string | null;
    currentLibretroCore: string | null;
    /** Save states are on for this session (else Save/Load State are hidden). */
    statesEnabled: boolean;
    bindings: InputBindings;
}

/** Wire a RetroAchievements session to a freshly started runtime. */
function startCheevos(rt: Runtime, system: string, hardcore: boolean, credentials: RACredentials): CheevosSession | null {
    const boot = rt.bootInfo;
    const libretroName = rt.libretroName;
    if (!boot || !libretroName) return null;
    return new CheevosSession({
        host: {
            heap: () => rt.controller?.heap ?? new Uint8Array(0),
            memoryInfo: id => rt.controller?.getMemoryInfo(id) ?? [0, 0],
            memoryMap: () => rt.controller?.getMemoryMapRaw() ?? null,
            frameCount: () => rt.controller?.frameCount() ?? 0,
            restart: () => rt.controller?.restart(),
            setFrameHook: fn => rt.setFrameHook(fn),
            coreOptions: () => rt.getCoreOptions(),
        },
        system,
        libretroName,
        files: boot.files,
        bootPath: boot.path,
        discs: boot.discs,
        hardcore,
        credentials,
    });
}

export function useEmulator(): EmulatorSession {
    const runtimeRef = useRef<Runtime | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasReadyResolvers = useRef<Array<(c: HTMLCanvasElement) => void>>([]);
    const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const saveOnExitRef = useRef(false);
    const startArgsRef = useRef<StartArgs | null>(null);
    const bindingsRef = useRef<InputBindings | null>(null);
    const pausedRef = useRef(false);
    const startingRef = useRef(false);
    const cheevosRef = useRef<CheevosSession | null>(null);
    const statesEnabledRef = useRef(true);
    const saveWatchRef = useRef<SaveWatch | null>(null);

    const [status, setStatus] = useState<SessionStatus>(IDLE_STATUS);
    const [canvasEpoch, setCanvasEpoch] = useState(0);
    // useState's lazy initializer parses stored bindings exactly once. Seed the
    // mutable ref (the runtime's render-independent view) from that same value so
    // storage is read once, not twice, on mount.
    const [bindings, setBindingsState] = useState<InputBindings>(loadStoredBindings);
    if (bindingsRef.current === null) bindingsRef.current = bindings;
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
        if (!statesEnabledRef.current) return;
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
            // Captured with the state so loading it restores achievement progress.
            const progress = cheevosRef.current?.serializeProgress() ?? null;
            if (source === 'auto' && await isStateDuplicate(game, bytes)) return;
            // Capture now — save-on-exit tears the canvas down before any async work.
            const snapshot = snapshotCover(gc.videoCanvas, gc.getDisplayAspect());

            const slotKey = getNextSlotKey(game);
            stampSlot(slotKey);
            await Promise.all([putStateBytes(slotKey, bytes), putStateCheevosProgress(slotKey, progress)]);
            if (source !== 'exit') notifyEmulator({ type: 'save', source });
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

    /**
     * Store the game's save file (its battery save RAM) as a new slot — run when
     * the game has just saved in-game. A save identical to a stored one, or one
     * the game never wrote, isn't stored.
     */
    const captureSaveFile = useCallback(async (onExit = false) => {
        const gc = runtimeRef.current?.controller;
        const game = startArgsRef.current?.gameBaseName;
        const watch = saveWatchRef.current;
        if (!gc || !game || !watch) return;
        const bytes = gc.readSaveRAM();
        if (!bytes) return;
        markSaveCaptured(watch, gc.saveRamHash());
        if (isBlankSave(bytes)) return;
        try {
            // Capture now — an exit tears the canvas down before any async work.
            const snapshot = snapshotCover(gc.videoCanvas, gc.getDisplayAspect());
            gc.flushSRAM();
            if (await isStateDuplicate(game, bytes, 'save')) return;
            const slotKey = getNextSlotKey(game, 'save');
            stampSlot(slotKey);
            if (!await putStateBytes(slotKey, bytes, 'save')) return;
            if (!onExit) notifyEmulator({ type: 'save', source: 'manual' });
            if (snapshot) {
                if (onExit) await persistStateThumbnailNow(slotKey, game, snapshot);
                else scheduleStateThumbnail(slotKey, game, snapshot);
            }
        } catch (e) {
            console.error('save file capture failed:', e);
        }
    }, []);

    /** Poll save RAM; once a change has settled, the game has saved — store it. */
    const startSaveWatch = useCallback(() => {
        const gc = runtimeRef.current?.controller;
        if (!gc?.hasSaveRAM()) return;
        const baseline = gc.saveRamHash();
        const watch: SaveWatch = {
            captured: baseline, seen: baseline, stable: 0,
            timer: setInterval(() => {
                const hash = runtimeRef.current?.controller?.saveRamHash() ?? null;
                if (hash === null || hash === watch.captured) { watch.seen = hash; return; }
                if (hash !== watch.seen) { watch.seen = hash; watch.stable = 0; return; }
                if (++watch.stable >= SAVE_SETTLE_TICKS) void captureSaveFile();
            }, SAVE_WATCH_MS),
        };
        saveWatchRef.current = watch;
    }, [captureSaveFile]);

    const stopSaveWatch = useCallback(() => {
        if (saveWatchRef.current) clearInterval(saveWatchRef.current.timer);
        saveWatchRef.current = null;
    }, []);

    /** Put a stored save file into the game's save RAM and hard-reset into it,
     *  so the game reads it like at boot. */
    const applySaveFile = useCallback(async (key: string, source: 'manual' | 'auto') => {
        const rt = runtimeRef.current;
        if (!rt?.controller) return;
        const bytes = await getStateBytes(key, 'save');
        const gc = rt.controller;
        if (!bytes || runtimeRef.current !== rt || !gc) return;
        if (!gc.writeSaveRAM(bytes)) {
            pushCheevosToast({ kind: 'info', title: 'In-Game Saves', description: "This game doesn't save in-game." });
            return;
        }
        gc.flushSRAM();
        // The loaded save is already stored — don't capture it as a new one.
        markSaveCaptured(saveWatchRef.current, gc.saveRamHash());
        gc.restart();
        cheevosRef.current?.onReset();
        notifyEmulator({ type: 'load', source });
    }, []);

    const loadState = useCallback(async (slot?: SlotRef, source: 'manual' | 'auto' = 'manual') => {
        const rt = runtimeRef.current;
        const game = startArgsRef.current?.gameBaseName;
        if (!rt?.controller || !game) return;
        // Save files are in-game saves, which hardcore allows.
        if (slot?.kind === 'save') { await applySaveFile(slot.key, source); return; }
        if (!slot && !statesEnabledRef.current) return;
        const ra = cheevosRef.current;
        if (ra?.hardcoreLocked) {
            // Identification may still lift the lock (a game without achievements).
            await ra.ready;
            if (runtimeRef.current !== rt) return;
            if (ra.hardcoreLocked) {
                if (source === 'manual') pushHardcoreToast('Loading save states is disabled while hardcore is on.');
                return;
            }
        }
        try {
            const key = slot?.key ?? getSlotKeys(game).at(-1);
            if (!key) return;
            const [data, progress] = await Promise.all([
                getStateBytes(key),
                ra ? getStateCheevosProgress(key) : null,
            ]);
            if (!data) return;
            await rt.controller.loadState(data);
            ra?.onStateLoaded(progress);
            notifyEmulator({ type: 'load', source });
        } catch (e) {
            console.error('load state failed:', e);
        }
    }, [applySaveFile]);

    // See EmulatorActions.flushExitSave. stop() reuses it before destroy().
    const flushExitSave = useCallback(async () => {
        if (!runtimeRef.current || !startArgsRef.current) return;
        // An in-game save made just before exiting may not have settled yet.
        const watch = saveWatchRef.current;
        if (watch && runtimeRef.current.controller?.saveRamHash() !== watch.captured) {
            await captureSaveFile(true);
        }
        if (saveOnExitRef.current) await saveState('exit');
    }, [saveState, captureSaveFile]);

    const stop = useCallback(async () => {
        // Save-on-exit must complete BEFORE destroy() — destroy aborts the wasm
        // runtime, which would orphan any in-flight async serialize (ASYNCIFY cores
        // like ppsspp).
        await flushExitSave();
        stopSaveWatch();
        canvasReadyResolvers.current = [];
        if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
        cheevosRef.current?.dispose();
        cheevosRef.current = null;
        runtimeRef.current?.destroy();
        runtimeRef.current = null;
        saveOnExitRef.current = false;
        startArgsRef.current = null;
        pausedRef.current = false;
        setStatus(IDLE_STATUS);
    }, [flushExitSave, stopSaveWatch]);

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
            const { opts: userOpts = {}, gameTitle, ...runtimeOpts } = args;

            const statesEnabled = userOpts.saveStates ?? true;
            setStatus({
                ...IDLE_STATUS,
                phase: 'loading-core',
                game: runtimeOpts.gameBaseName,
                title: gameTitle ?? runtimeOpts.gameBaseName,
                system: runtimeOpts.system,
                statesEnabled,
            });
            // saveState/loadState check this, which also covers autoload,
            // autosave and save on exit.
            statesEnabledRef.current = statesEnabled;

            const rt = new Runtime();
            runtimeRef.current = rt;

            try {
                await rt.start({
                    ...runtimeOpts,
                    canvas,
                    bindings: bindingsRef.current!,
                    handlers: {
                        onSaveState: () => saveState('manual'),
                        onLoadState: () => loadState(undefined, 'manual'),
                    },
                    onPhase: (p, m) => patchStatus(m ? { phase: p, message: m } : { phase: p }),
                });

                patchStatus({ phase: 'running', paused: false, libretroCore: rt.libretroName });

                saveOnExitRef.current = userOpts.saveOnExit ?? false;

                const { cheevos } = userOpts;
                const credentials = cheevos ? loadCredentials() : null;
                cheevosRef.current = cheevos && credentials
                    ? startCheevos(rt, runtimeOpts.system, cheevos.hardcore, credentials)
                    : null;

                if (userOpts.saveFiles) startSaveWatch();
                if (userOpts.autoLoad) loadState(undefined, 'auto');
                if (userOpts.autoSave && statesEnabled) {
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
    }, [stop, saveState, loadState, startSaveWatch, patchStatus]);

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

    const applyBindings = useCallback((b: InputBindings) => {
        bindingsRef.current = b;
        setBindingsState(b);
        runtimeRef.current?.setInputBindings(b);
    }, []);

    const actions = useMemo<EmulatorActions>(() => ({
        saveState, loadState, switchCore, flushExitSave,
        pause:  () => { runtimeRef.current?.pause();  pausedRef.current = true;  patchStatus({ paused: true  }); },
        resume: () => { runtimeRef.current?.resume(); pausedRef.current = false; patchStatus({ paused: false }); },
        setBindings: (b) => { saveStoredBindings(b); applyBindings(b); },
        resetBindings: () => applyBindings(resetStoredBindings()),
        getCoreOptions:   () => runtimeRef.current?.getCoreOptions() ?? EMPTY_CORE_OPTIONS,
        setCoreOption:    (key, value) => {
            const reason = cheevosRef.current?.checkCoreOption(key, value);
            if (reason) pushHardcoreToast(reason);
            else runtimeRef.current?.setCoreOption(key, value);
        },
        resetCoreOptions: () => runtimeRef.current?.resetCoreOptions(),
        getControllerPorts:  () => runtimeRef.current?.getControllerPorts() ?? EMPTY_CONTROLLER_PORTS,
        setControllerDevice: (port, deviceId) => runtimeRef.current?.setControllerDevice(port, deviceId),
        getDiscInfo:      () => runtimeRef.current?.getDiscInfo() ?? EMPTY_DISC_INFO,
        setDisc:          (index) => {
            runtimeRef.current?.setDisc(index);
            void cheevosRef.current?.changeDisc(index);
        },
        setShader:        (name) => {
            runtimeRef.current?.setShader(name).catch(e => console.error('shader load failed:', e));
        },
        requestPause: () => {
            const frames = cheevosRef.current?.pauseFramesRemaining() ?? 0;
            if (frames) pushHardcoreToast(`You can pause again in ${Math.max(1, Math.ceil(frames / 60))}s.`);
            return !frames;
        },
    }), [saveState, loadState, switchCore, flushExitSave, patchStatus, applyBindings]);

    return useMemo<EmulatorSession>(() => ({
        start, canvasRef, setCanvas, canvasEpoch, actions,
        phase: status.phase,
        message: status.message,
        paused: status.paused,
        error: status.error,
        currentGame: status.game,
        currentTitle: status.title,
        currentCore: status.system,
        currentLibretroCore: status.libretroCore,
        statesEnabled: status.statesEnabled,
        bindings,
    }), [start, setCanvas, canvasEpoch, actions, status, bindings]);
}
