'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(hover: none) and (pointer: coarse)';

const subscribe = (cb: () => void) => {
    const mq = window.matchMedia(QUERY);
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
        () => window.matchMedia(QUERY).matches,
        () => false,
    );
}
