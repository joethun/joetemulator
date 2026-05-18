'use client';

import { useEffect } from 'react';

/** Prevent mouse clicks from focusing `<button>` so Space won't re-activate the last clicked control. */
export function ButtonMouseFocusGuard() {
    useEffect(() => {
        const onMouseDown = (e: MouseEvent) => {
            if (e.button !== 0) return;
            const el = e.target;
            if (!(el instanceof Element)) return;
            if (el.closest('button')) e.preventDefault();
        };
        document.addEventListener('mousedown', onMouseDown, true);
        return () => document.removeEventListener('mousedown', onMouseDown, true);
    }, []);
    return null;
}
