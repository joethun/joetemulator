'use client';

import { memo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Save, Upload } from 'lucide-react';

interface Props {
    colors: { highlight: string };
    autoSaveIcon: boolean;
    autoLoadIcon: boolean;
}

export const EmulatorNotification = memo(({ colors, autoSaveIcon, autoLoadIcon }: Props) => {
    const [state, setState] = useState<{ type: 'save' | 'load'; visible: boolean } | null>(null);
    const [mount, setMount] = useState<HTMLElement | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => { setMount(document.body); }, []);

    useEffect(() => {
        const handler = (e: CustomEvent<{ type: 'save' | 'load'; source: string }>) => {
            const { type, source } = e.detail;
            if (source === 'auto' && ((type === 'save' && !autoSaveIcon) || (type === 'load' && !autoLoadIcon))) return;

            if (timer.current) clearTimeout(timer.current);

            const gameEl = document.getElementById('game');
            setMount(gameEl && getComputedStyle(gameEl).display !== 'none' ? gameEl : document.body);

            setState({ type, visible: false });
            requestAnimationFrame(() => {
                setState({ type, visible: true });
                timer.current = setTimeout(() => {
                    setState(s => s ? { ...s, visible: false } : null);
                    setTimeout(() => setState(null), 300);
                }, 1500);
            });
        };

        window.addEventListener('emulator_notification', handler as EventListener);
        return () => {
            window.removeEventListener('emulator_notification', handler as EventListener);
            if (timer.current) clearTimeout(timer.current);
        };
    }, [autoSaveIcon, autoLoadIcon]);

    if (!state || !mount) return null;

    return createPortal(
        <div className={`fixed top-4 left-4 z-[1000000] pointer-events-none transition-opacity duration-300 ${state.visible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg" style={{ backgroundColor: colors.highlight + '15', color: colors.highlight }}>
                {state.type === 'save' ? <Save className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
            </div>
        </div>,
        mount
    );
});

EmulatorNotification.displayName = 'EmulatorNotification';