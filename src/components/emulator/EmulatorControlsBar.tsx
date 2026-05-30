'use client';

import { memo, useState, useSyncExternalStore } from 'react';
import {
    Folder, LogOut, Maximize, Minimize, Pause, Play,
    Save, Settings, Upload,
    Volume2, VolumeX,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ThemeColors } from '@/types';
import {
    getVolume, isMuted, setVolume, setMuted, subscribe as subscribeVolume,
} from '@/lib/ra/audio';
import { DANGER_BG, DANGER_FG, SHADOW_CARD } from '@/lib/constants';

export type EmulatorPanel = 'settings' | 'saves';

interface EmulatorControlsBarProps {
    visible: boolean;
    colors: ThemeColors;
    paused: boolean;
    gameLoaded: boolean;
    onTogglePause: () => void;
    onSaveState: () => void;
    onLoadState: () => void;
    onOpenPanel: (panel: EmulatorPanel) => void;
    onExit: () => void;
    /** Fired on each tap within the bar so the touch auto-hide timer can restart. */
    onActivity?: () => void;
}

export const EmulatorControlsBar = memo(({
    visible, colors, paused, gameLoaded, onTogglePause, onSaveState, onLoadState, onOpenPanel, onExit, onActivity,
}: EmulatorControlsBarProps) => {
    const [exiting, setExiting] = useState(false);
    const handleExit = () => {
        if (exiting) return;
        setExiting(true);
        onExit();
    };
    return (
        <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[55] transition-opacity duration-300 w-[min(20rem,calc(100vw-1.5rem))] sm:w-auto"
            style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
            onPointerDown={onActivity}
        >
            {/* Below `sm` the row is too wide for a phone, so it collapses into a vertical,
                wider menu with text labels (touch has no hover, so tooltips never show). */}
            <div
                className="flex flex-col items-stretch gap-2 p-3 rounded-2xl border-[0.125rem] max-h-[90vh] overflow-y-auto sm:flex-row sm:items-center sm:gap-3 sm:px-4 sm:py-3 sm:max-h-none sm:overflow-visible"
                style={{
                    backgroundColor: colors.darkBg,
                    borderColor: colors.midDark,
                    boxShadow: SHADOW_CARD,
                }}
            >
                <BarBtn
                    icon={paused ? Play : Pause}
                    label={paused ? 'Resume' : 'Pause'}
                    onClick={onTogglePause}
                    colors={colors}
                />
                <Divider colors={colors} />
                <BarBtn icon={Save}     label="Save State"    onClick={onSaveState} colors={colors} />
                {gameLoaded && <BarBtn icon={Upload}   label="Load State"    onClick={onLoadState} colors={colors} />}
                <BarBtn icon={Folder}   label="Manage States" onClick={() => onOpenPanel('saves')}    colors={colors} />
                <BarBtn icon={Settings} label="Game Settings" onClick={() => onOpenPanel('settings')} colors={colors} />
                <VolumeButton colors={colors} />
                <FullscreenButton colors={colors} />
                <Divider colors={colors} />
                <BarBtn icon={LogOut} label="Exit Game" onClick={handleExit} colors={colors} variant="danger" disabled={exiting} />
            </div>
        </div>
    );
});
EmulatorControlsBar.displayName = 'EmulatorControlsBar';

// Separator: a thin horizontal rule between menu sections when vertical, a tall
// vertical rule between button groups when the bar is horizontal (sm and up).
function Divider({ colors }: { colors: ThemeColors }) {
    return (
        <div
            className="w-full h-px sm:w-px sm:h-10 sm:mx-1 shrink-0"
            style={{ backgroundColor: `${colors.highlight}30` }}
        />
    );
}

// Hover tooltip for the horizontal bar only — touch devices can't hover, and the
// vertical menu shows the label inline instead, so it's hidden below `sm`.
function Tooltip({ text, colors }: { text: string; colors: ThemeColors }) {
    return (
        <div
            className="hidden sm:block absolute bottom-full left-1/2 -translate-x-1/2 mb-6 px-3 py-2 rounded-xl whitespace-nowrap z-[60] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200"
            style={{ backgroundColor: colors.midDark, color: colors.softLight, boxShadow: SHADOW_CARD }}
        >
            {text}
        </div>
    );
}

interface BarBtnProps {
    icon: LucideIcon;
    label: string;
    onClick: () => void;
    colors: ThemeColors;
    variant?: 'default' | 'danger';
    pressed?: boolean;
    disabled?: boolean;
}

function BarBtn({ icon: Icon, label, onClick, colors, variant = 'default', pressed, disabled }: BarBtnProps) {
    const style = variant === 'danger'
        ? { backgroundColor: DANGER_BG, color: DANGER_FG, opacity: disabled ? 0.5 : 1 }
        : { backgroundColor: colors.midDark, color: colors.highlight, opacity: disabled ? 0.5 : 1 };
    return (
        <div className="relative group w-full sm:w-auto">
            <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                aria-label={label}
                aria-pressed={pressed}
                className="w-full sm:w-12 h-12 px-4 sm:px-0 rounded-xl flex items-center justify-start sm:justify-center gap-3 transition-all enabled:active:scale-95 enabled:cursor-pointer disabled:cursor-not-allowed"
                style={style}
            >
                <Icon className="w-6 h-6 shrink-0" />
                <span
                    className="sm:hidden font-medium"
                    style={{ color: variant === 'danger' ? DANGER_FG : colors.softLight }}
                >
                    {label}
                </span>
            </button>
            <Tooltip text={label} colors={colors} />
        </div>
    );
}

const subscribeFullscreen = (cb: () => void) => {
    document.addEventListener('fullscreenchange', cb);
    return () => document.removeEventListener('fullscreenchange', cb);
};

function FullscreenButton({ colors }: { colors: ThemeColors }) {
    const isFs = useSyncExternalStore(
        subscribeFullscreen,
        () => document.fullscreenElement !== null,
        () => false,
    );
    const toggle = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
            return;
        }
        // Always fullscreen the entire document (like F11) instead of just the emulator container
        // to avoid issues with popups and UI interactions in fullscreen mode
        document.documentElement.requestFullscreen().catch(() => {});
    };
    return (
        <BarBtn
            icon={isFs ? Minimize : Maximize}
            label={isFs ? 'Exit Fullscreen' : 'Fullscreen'}
            onClick={toggle}
            colors={colors}
            pressed={isFs}
        />
    );
}

function VolumeButton({ colors }: { colors: ThemeColors }) {
    const effective = useSyncExternalStore(
        subscribeVolume,
        () => (isMuted() ? 0 : getVolume()),
        () => 0.5,
    );
    const on = effective > 0;
    const toggle = () => {
        if (on) setMuted(true);
        else { setMuted(false); if (getVolume() === 0) setVolume(0.5); }
    };
    return (
        <BarBtn
            icon={on ? Volume2 : VolumeX}
            label={on ? 'Mute' : 'Unmute'}
            onClick={toggle}
            colors={colors}
            pressed={on}
        />
    );
}
