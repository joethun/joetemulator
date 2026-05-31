'use client';

import { useSyncExternalStore } from 'react';

export const TOUCH_QUERY = '(hover: none) and (pointer: coarse)';

const subscribe = (cb: () => void) => {
    const mq = window.matchMedia(TOUCH_QUERY);
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
};

/**
 * True on touch-primary devices (no hover, coarse pointer) — phones and tablets.
 * Mirrors the detection GameCard uses for tap-to-reveal interactions. Returns
 * false during SSR / first paint, then reconciles on the client.
 */
export function useIsTouch(): boolean {
    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(TOUCH_QUERY).matches,
        () => false,
    );
}
