'use client';

import { memo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Save, Upload } from 'lucide-react';
import { ThemeColors } from '@/types';

interface Props {
    colors: Pick<ThemeColors, 'highlight' | 'midDark'>;
    autoSaveIcon: boolean;
    autoLoadIcon: boolean;
}

type NotificationType = 'save' | 'load';

interface NotificationState {
    type: NotificationType;
    visible: boolean;
}

// notification delay constants
const VISIBLE_DURATION = 1500;
const FADE_OUT_DURATION = 300;

// shows save/load notifications in the game overlay
export const EmulatorNotification = memo(({ colors, autoSaveIcon, autoLoadIcon }: Props) => {
    const [state, setState] = useState<NotificationState | null>(null);
    const [mount, setMount] = useState<HTMLElement | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // set initial mount point
    useEffect(() => {
        setMount(document.body);
    }, []);

    // listen for notification events
    useEffect(() => {
        const handler = (e: CustomEvent<{ type: NotificationType; source: string }>) => {
            const { type, source } = e.detail;

            // skip auto notifications if icons are disabled
            if (source === 'auto') {
                if (type === 'save' && !autoSaveIcon) return;
                if (type === 'load' && !autoLoadIcon) return;
            }

            // clear any existing timer
            if (timer.current) {
                clearTimeout(timer.current);
            }

            // update mount point to game element if visible
            const gameEl = document.getElementById('game');
            const isGameVisible = gameEl && getComputedStyle(gameEl).display !== 'none';
            setMount(isGameVisible ? gameEl : document.body);

            // show notification with animation
            setState({ type, visible: false });
            requestAnimationFrame(() => {
                setState({ type, visible: true });

                timer.current = setTimeout(() => {
                    setState(s => s ? { ...s, visible: false } : null);
                    setTimeout(() => setState(null), FADE_OUT_DURATION);
                }, VISIBLE_DURATION);
            });
        };

        window.addEventListener('emulator_notification', handler as EventListener);

        return () => {
            window.removeEventListener('emulator_notification', handler as EventListener);
            if (timer.current) {
                clearTimeout(timer.current);
            }
        };
    }, [autoSaveIcon, autoLoadIcon]);

    if (!state || !mount) return null;

    const Icon = state.type === 'save' ? Save : Upload;

    return createPortal(
        <div
            className={`fixed top-4 left-4 z-[1000000] pointer-events-none transition-opacity duration-300 ${state.visible ? 'opacity-100' : 'opacity-0'}`}
        >
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg"
                style={{
                    backgroundColor: colors.midDark,
                    color: colors.highlight
                }}
            >
                <Icon className="w-5 h-5" />
            </div>
        </div>,
        mount
    );
});

EmulatorNotification.displayName = 'EmulatorNotification';