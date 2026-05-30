'use client';

import { memo, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { ThemeColors, GradientStyle } from '@/types';
import type { EmulatorSession } from '@/hooks/useEmulator';
import { EmulatorMenu } from '@/components/emulator/EmulatorMenu';
import { EmulatorControlsBar, type EmulatorPanel } from '@/components/emulator/EmulatorControlsBar';
import { useIsTouch } from '@/hooks/useIsTouch';

interface EmulatorViewProps {
    session: EmulatorSession;
    colors: ThemeColors;
    gradient: GradientStyle;
    onDuplicateError: (msg: string) => void;
    /** When true, keep the game paused regardless of menu state (e.g. an external modal is open). */
    keepPaused?: boolean;
    /** Game-friendly title for the loading splash (falls back to baseName). */
    loadingTitle?: string;
    /** Friendly system name for the loading splash (e.g. "Game Boy Advance"). */
    loadingSystemName?: string;
    /** Optional cover art to show while loading. */
    loadingCoverArt?: string;
}

const BAR_VISIBLE_MS = 2000;
// Touch has no continuous pointer movement to keep the bar alive, so give the
// tapped-open bar a slightly longer idle window before it auto-hides.
const TOUCH_BAR_VISIBLE_MS = 4000;

export const EmulatorView = memo(({
    session, colors, gradient, onDuplicateError, keepPaused,
    loadingTitle, loadingSystemName, loadingCoverArt,
}: EmulatorViewProps) => {
    const isVisible = session.phase !== 'idle';
    const isLoading = session.phase === 'loading-core' || session.phase === 'booting';

    const [panel, setPanel] = useState<EmulatorPanel | null>(null);
    const [userPaused, setUserPaused] = useState(false);
    const [showBar, setShowBar] = useState(false);
    const [pointerLocked, setPointerLocked] = useState(false);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isTouch = useIsTouch();
    // Bumped on each tap within the controls bar to restart the touch auto-hide timer.
    const [barActivity, setBarActivity] = useState(0);
    const canvasWrapRef = useRef<HTMLDivElement>(null);

    // Track pointer-lock state so the bar can be suppressed while the cursor is
    // captured by the game (otherwise mousemove deltas keep retriggering it).
    useEffect(() => {
        const onChange = () => setPointerLocked(document.pointerLockElement === session.canvasRef.current);
        document.addEventListener('pointerlockchange', onChange);
        return () => document.removeEventListener('pointerlockchange', onChange);
    }, [session.canvasRef]);

    // Reset transient UI state when the session leaves the active screen.
    useEffect(() => {
        if (isVisible) return;
        setPanel(null);
        setUserPaused(false);
        setShowBar(false);
        if (hideTimerRef.current) { clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
    }, [isVisible]);

    // Any successful load (bar, menu, hotkey, external dialog) resumes gameplay.
    useEffect(() => {
        const onNotify = (e: Event) => {
            if ((e as CustomEvent<{ type: string }>).detail?.type === 'load') setUserPaused(false);
        };
        window.addEventListener('emulator_notification', onNotify);
        return () => window.removeEventListener('emulator_notification', onNotify);
    }, []);

    // Show the bottom bar on mouse movement, hide after idle. Suppressed while the
    // cursor is pointer-locked or the core is still loading (otherwise the bar flashes
    // in during the boot sequence).
    useEffect(() => {
        const hide = () => {
            setShowBar(false);
            if (hideTimerRef.current) { clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
        };
        // Force-hidden states, regardless of input type. `panel` is deliberately NOT
        // here: the render gate (visible={showBar && !panel}) already hides the bar
        // while a panel is open, so clearing showBar would drop the touch tap-toggle
        // state across a panel round-trip (open Settings → Back would lose the bar).
        if (!isVisible || pointerLocked || isLoading) { hide(); return; }
        // Touch devices emit no mousemove, so they reveal the bar with an explicit tap
        // (handleCanvasClick); auto-hide is handled by the touch effect below. No
        // panel-driven clearing here, so closing a panel reveals the still-open bar.
        if (isTouch) return;
        // Non-touch: hide under a panel modal; the next mousemove re-reveals it.
        if (panel) { hide(); return; }

        const onMove = () => {
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
            setShowBar(true);
            hideTimerRef.current = setTimeout(() => setShowBar(false), BAR_VISIBLE_MS);
        };
        window.addEventListener('mousemove', onMove);
        return () => {
            window.removeEventListener('mousemove', onMove);
            if (hideTimerRef.current) { clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
        };
    }, [isVisible, panel, pointerLocked, isLoading, isTouch]);

    // Touch auto-hide: the tapped-open bar fades out after an idle window (there's no
    // mousemove to drive the desktop timer). Each tap on the bar bumps barActivity,
    // restarting the countdown; a tap on the game (the touch listener below) toggles
    // it off, so tapping outside the bar dismisses it the same way.
    useEffect(() => {
        if (!isTouch || !isVisible || !showBar || panel) return;
        const t = setTimeout(() => setShowBar(false), TOUCH_BAR_VISIBLE_MS);
        return () => clearTimeout(t);
    }, [isTouch, isVisible, showBar, panel, barActivity]);

    // Touch tap → toggle the controls bar. We listen in the CAPTURE phase on the canvas
    // wrapper instead of using the canvas's onClick: the core registers its own canvas
    // pointer/touch listeners that call preventDefault, which swallows the synthetic
    // click on touch devices (so onClick never fires). Capture phase runs before the
    // core's handlers, and the bar is a sibling of this wrapper — taps on the bar never
    // reach here, so tapping the game toggles the bar and tapping it again dismisses.
    useEffect(() => {
        if (!isTouch || !isVisible) return;
        const el = canvasWrapRef.current;
        if (!el) return;
        let sx = 0, sy = 0, st = 0, tracking = false;
        const onStart = (e: TouchEvent) => {
            tracking = e.touches.length === 1;
            if (!tracking) return;
            sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = e.timeStamp;
        };
        const onEnd = (e: TouchEvent) => {
            if (!tracking) return;
            tracking = false;
            if (isLoading || panel) return;
            const t = e.changedTouches[0];
            if (!t) return;
            // Only a quick, near-stationary tap toggles — ignore swipes and long presses.
            if (Math.hypot(t.clientX - sx, t.clientY - sy) > 12) return;
            if (e.timeStamp - st > 600) return;
            setShowBar(v => !v);
        };
        el.addEventListener('touchstart', onStart, { capture: true, passive: true });
        el.addEventListener('touchend', onEnd, { capture: true, passive: true });
        return () => {
            el.removeEventListener('touchstart', onStart, true);
            el.removeEventListener('touchend', onEnd, true);
        };
    }, [isTouch, isVisible, isLoading, panel]);

    // why: session.paused is intentionally excluded from deps — including it would loop the
    // pause/resume cycle when the user manually toggles pause from the in-game bar.
    useEffect(() => {
        if (!isVisible) return;
        const needsPause = panel !== null || userPaused || !!keepPaused;
        if (needsPause) {
            if (!session.paused) session.actions.pause();
        } else if (session.phase === 'running') {
            session.actions.resume();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [panel, userPaused, keepPaused, isVisible, session.phase]);

    const handleLoadState = (key?: string) => {
        session.actions.loadState(key);
        setPanel(null);
    };

    const handleExit = async () => {
        // Flush save-on-exit (if enabled) BEFORE reload — destroy() inside
        // stop() would otherwise abort the wasm runtime mid-serialize. We
        // skip stop() itself so the library/idle screen doesn't flash; the
        // reload tears down listeners, RAF queues, the wasm code cache and
        // GPU contexts that hardware-rendered cores leak (in-place Emscripten
        // disposal is unsolved — RomM does the same, EmulatorJS punts).
        try { await session.actions.flushExitSave(); }
        finally { window.location.reload(); }
    };

    // Mouse click locks the cursor for mouse-driven cores (Esc releases). Touch taps are
    // handled by the capture-phase touch listener above; we bail on touch here so a
    // synthetic click (if the browser fires one) can't double-toggle the bar.
    const handleCanvasClick = () => {
        const canvas = session.canvasRef.current;
        if (!canvas || isLoading || panel || isTouch) return;
        if (document.pointerLockElement === canvas) return;
        // why: rejection (browser refusal, sandbox restriction) is non-fatal — keep gameplay going.
        const result = canvas.requestPointerLock();
        if (result instanceof Promise) result.catch(() => {});
    };

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col"
            style={{
                backgroundColor: '#000000',
                opacity: isVisible ? 1 : 0,
                pointerEvents: isVisible ? 'auto' : 'none',
                transition: 'opacity 120ms linear',
                fontFamily: 'var(--font-lexend, system-ui)',
            }}
            data-emulator-root="1"
        >
            <div
                ref={canvasWrapRef}
                className="flex-1 flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: '#000000' }}
            >
                <canvas
                    ref={session.setCanvas}
                    key={session.canvasEpoch}
                    id="ra-canvas"
                    tabIndex={-1}
                    onClick={handleCanvasClick}
                    className="outline-none"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        imageRendering: 'pixelated',
                    }}
                />
            </div>

            {isLoading && (
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-6"
                    style={{ backgroundColor: '#000000' }}
                >
                    {loadingCoverArt && (
                        <div
                            className="relative rounded-xl overflow-hidden shadow-2xl"
                            style={{ width: 'min(280px, 40vw)', aspectRatio: '0.8' }}
                        >
                            <Image
                                src={loadingCoverArt}
                                alt=""
                                fill
                                sizes="280px"
                                draggable={false}
                                style={{ objectFit: 'contain', userSelect: 'none' }}
                            />
                        </div>
                    )}
                    <div
                        className="px-5 py-3 rounded-xl text-sm border-[0.125rem] text-center max-w-[80vw]"
                        style={{
                            backgroundColor: colors.midDark,
                            borderColor: colors.midDark,
                            color: colors.softLight,
                        }}
                    >
                        {loadingTitle && loadingSystemName
                            ? `Loading ${loadingTitle} for ${loadingSystemName}…`
                            : (session.message || (session.phase === 'booting' ? 'Booting…' : 'Loading…'))}
                    </div>
                </div>
            )}

            {session.error && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                        className="px-4 py-3 rounded-xl text-sm pointer-events-auto border-[0.125rem]"
                        style={{
                            backgroundColor: colors.midDark,
                            borderColor: 'rgba(239,68,68,0.5)',
                            color: colors.softLight,
                        }}
                    >
                        Error: {session.error}
                    </div>
                </div>
            )}

            <EmulatorControlsBar
                visible={showBar && !panel}
                colors={colors}
                paused={userPaused}
                gameLoaded={session.phase === 'running'}
                onTogglePause={() => setUserPaused(p => !p)}
                onSaveState={() => session.actions.saveState('manual')}
                onLoadState={() => handleLoadState()}
                onOpenPanel={setPanel}
                onExit={handleExit}
                onActivity={() => setBarActivity(n => n + 1)}
            />

            <EmulatorMenu
                section={panel}
                onClose={() => setPanel(null)}
                colors={colors}
                gradient={gradient}
                session={session}
                onDuplicateError={onDuplicateError}
                onLoadState={handleLoadState}
            />
        </div>
    );
});

EmulatorView.displayName = 'EmulatorView';
