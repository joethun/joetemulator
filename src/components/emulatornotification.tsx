'use client';

import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Save, Upload } from 'lucide-react';
import { ThemeColors } from '@/types';

interface EmulatorNotificationProps {
    colors: Pick<ThemeColors, 'highlight' | 'midDark'>;
    autoSaveIcon: boolean;
    autoLoadIcon: boolean;
}

type NotificationType = 'save' | 'load';

const VISIBLE_DURATION = 1500;
const FADE_OUT_DURATION = 300;

export const EmulatorNotification = memo(({ colors, autoSaveIcon, autoLoadIcon }: EmulatorNotificationProps) => {
    const [state, setState] = useState<{ type: NotificationType; visible: boolean } | null>(null);
    const [mount, setMount] = useState<HTMLElement | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showNotification = useCallback((type: NotificationType) => {
        if (timerRef.current) clearTimeout(timerRef.current);

        const gameEl = document.getElementById('game');
        const isGameVisible = gameEl && getComputedStyle(gameEl).display !== 'none';
        setMount(isGameVisible ? gameEl : document.body);

        setState({ type, visible: true });
        
        timerRef.current = setTimeout(() => {
            setState(s => s ? { ...s, visible: false } : null);
            setTimeout(() => setState(null), FADE_OUT_DURATION);
        }, VISIBLE_DURATION);
    }, []);

    useEffect(() => {
        const handler = (e: CustomEvent<{ type: NotificationType; source: string }>) => {
            const { type, source } = e.detail;
            if (source === 'auto' && ((type === 'save' && !autoSaveIcon) || (type === 'load' && !autoLoadIcon))) return;
            showNotification(type);
        };

        window.addEventListener('emulator_notification', handler as EventListener);
        return () => {
            window.removeEventListener('emulator_notification', handler as EventListener);
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [autoSaveIcon, autoLoadIcon, showNotification]);

    if (!state || !mount) return null;

    const Icon = state.type === 'save' ? Save : Upload;

    return createPortal(
        <div 
            className={`fixed top-4 left-4 z-[100] pointer-events-none transition-opacity duration-300 ${state.visible ? 'opacity-100' : 'opacity-0'}`}
        >
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg"
                style={{ backgroundColor: colors.midDark, color: colors.highlight }}
            >
                <Icon className="w-5 h-5" />
            </div>
        </div>,
        mount
    );
});

EmulatorNotification.displayName = 'EmulatorNotification';