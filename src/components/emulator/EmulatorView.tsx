'use client';

import { memo, useEffect, useRef, useState } from 'react';
import type { ThemeColors, GradientStyle } from '@/types';
import type { EmulatorSession } from '@/hooks/useEmulator';
import { EmulatorMenu } from '@/components/emulator/EmulatorMenu';
import { EmulatorControlsBar, type EmulatorPanel } from '@/components/emulator/EmulatorControlsBar';

interface EmulatorViewProps {
    session: EmulatorSession;
    colors: ThemeColors;
    gradient: GradientStyle;
    onDuplicateError?: (msg: string) => void;
    /** When true, keep the game paused regardless of menu state (e.g. an external modal is open). */
    keepPaused?: boolean;
}

const BAR_VISIBLE_MS = 2000;
const noop = () => {};

export const EmulatorView = memo(({
    session, colors, gradient, onDuplicateError = noop, keepPaused,
}: EmulatorViewProps) => {
    const isVisible = session.phase !== 'idle';
    const isLoading = session.phase === 'loading-core' || session.phase === 'booting';

    const [panel, setPanel] = useState<EmulatorPanel | null>(null);
    const [userPaused, setUserPaused] = useState(false);
    const [showBar, setShowBar] = useState(false);
    const [pointerLocked, setPointerLocked] = useState(false);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    // Show the bottom bar on mouse movement, hide after idle. Suppressed while a
    // panel modal covers the screen or the cursor is pointer-locked.
    useEffect(() => {
        if (!isVisible || panel || pointerLocked) {
            setShowBar(false);
            if (hideTimerRef.current) { clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
            return;
        }

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
    }, [isVisible, panel, pointerLocked]);

    // Pause when a panel is open, the user pressed pause on the bar, or an
    // external modal demands it. Excludes session.paused from deps so the user's
    // manual in-game pause doesn't loop.
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

    const handleExit = () => {
        setPanel(null);
        setUserPaused(false);
        session.actions.stop();
    };

    // Clicking the canvas locks the cursor for mouse-driven cores. Esc releases.
    const handleCanvasClick = () => {
        const canvas = session.canvasRef.current;
        if (!canvas || isLoading || panel) return;
        if (document.pointerLockElement === canvas) return;
        try {
            const result = canvas.requestPointerLock();
            if (result instanceof Promise) result.catch(() => {});
        } catch { /* browser refused or already locked elsewhere */ }
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
                className="flex-1 flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: '#000000' }}
            >
                <canvas
                    ref={session.canvasRef}
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
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ backgroundColor: '#000000' }}
                >
                    <div
                        className="px-5 py-3 rounded-xl text-sm border-[0.125rem]"
                        style={{
                            backgroundColor: colors.midDark,
                            borderColor: colors.midDark,
                            color: colors.softLight,
                        }}
                    >
                        {session.message || (session.phase === 'booting' ? 'Booting…' : 'Loading…')}
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
