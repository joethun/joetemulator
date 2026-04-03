'use client';

import { memo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Save, Upload } from 'lucide-react';
import { ThemeColors } from '@/types';

interface EmulatorNotificationProps {
    colors: Pick<ThemeColors, 'highlight' | 'midDark'>;
    autoSaveIcon: boolean;
    autoLoadIcon: boolean;
}

type NotificationType = 'save' | 'load';

const VISIBLE_MS = 1500;
const FADE_MS = 300;

export const EmulatorNotification = memo(({ colors, autoSaveIcon, autoLoadIcon }: EmulatorNotificationProps) => {
    const [notif, setNotif] = useState<{ type: NotificationType; visible: boolean } | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handler = (e: CustomEvent<{ type: NotificationType; source: string }>) => {
            const { type, source } = e.detail;
            if (source === 'auto' && ((type === 'save' && !autoSaveIcon) || (type === 'load' && !autoLoadIcon))) return;

            if (timer.current) clearTimeout(timer.current);
            setNotif({ type, visible: true });
            timer.current = setTimeout(() => {
                setNotif(s => s ? { ...s, visible: false } : null);
                setTimeout(() => setNotif(null), FADE_MS);
            }, VISIBLE_MS);
        };

        window.addEventListener('emulator_notification', handler as EventListener);
        return () => {
            window.removeEventListener('emulator_notification', handler as EventListener);
            if (timer.current) clearTimeout(timer.current);
        };
    }, [autoSaveIcon, autoLoadIcon]);

    if (!notif) return null;

    const gameEl = document.getElementById('game');
    const mount = (gameEl && getComputedStyle(gameEl).display !== 'none') ? gameEl : document.body;
    const Icon = notif.type === 'save' ? Save : Upload;

    return createPortal(
        <div className={`fixed top-4 left-4 z-[100] pointer-events-none transition-opacity duration-300 ${notif.visible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg"
                style={{ backgroundColor: colors.midDark, color: colors.highlight }}>
                <Icon className="w-5 h-5" />
            </div>
        </div>,
        mount
    );
});

EmulatorNotification.displayName = 'EmulatorNotification';
