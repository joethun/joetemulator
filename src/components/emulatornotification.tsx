'use client';

import { memo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Save, Upload } from 'lucide-react';

type NotificationType = 'save' | 'load';

interface EmulatorNotificationProps {
    colors: { highlight: string };
    autoSaveIcon: boolean;
    autoLoadIcon: boolean;
}

export const EmulatorNotification = memo(({ colors, autoSaveIcon, autoLoadIcon }: EmulatorNotificationProps) => {
    const [notification, setNotification] = useState<{ type: NotificationType; id: number } | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => { setMountNode(document.body); }, []);

    useEffect(() => {
        const handler = (e: CustomEvent<{ type: NotificationType; source: string }>) => {
            const { type, source } = e.detail;
            // respect user preference for auto notifications
            if (source === 'auto' && ((type === 'save' && !autoSaveIcon) || (type === 'load' && !autoLoadIcon))) return;

            if (timerRef.current) clearTimeout(timerRef.current);

            // ensure notification shows on top of game if active
            const gameEl = document.getElementById('game');
            setMountNode((gameEl && window.getComputedStyle(gameEl).display !== 'none') ? gameEl : document.body);

            // trigger animation sequence
            setIsVisible(false);
            setTimeout(() => {
                setNotification({ type, id: Date.now() });
                requestAnimationFrame(() => setIsVisible(true));

                timerRef.current = setTimeout(() => {
                    setIsVisible(false);
                    setTimeout(() => setNotification(null), 300);
                }, 1500);
            }, 10);
        };

        window.addEventListener('emulator_notification', handler as EventListener);
        return () => {
            window.removeEventListener('emulator_notification', handler as EventListener);
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [autoSaveIcon, autoLoadIcon]);

    if (!notification || !mountNode) return null;

    return createPortal(
        <div className={`fixed top-4 left-4 z-[1000000] pointer-events-none transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center backdrop-blur-sm shadow-lg" style={{ backgroundColor: colors.highlight + '15', color: colors.highlight }}>
                {notification.type === 'save' ? <Save className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
            </div>
        </div>, mountNode
    );
});

EmulatorNotification.displayName = 'EmulatorNotification';