import { useEffect, useMemo, useRef } from 'react';

export interface Timer {
    /** Schedule `fn`, replacing any pending run. */
    set: (fn: () => void, ms: number) => void;
    /** Cancel a pending run. Safe to call when nothing is scheduled. */
    clear: () => void;
}

/**
 * One setTimeout slot scoped to the component: re-arming cancels the previous
 * run and unmounting cancels whatever is pending, so callbacks can never fire
 * against a dead component. `set`/`clear` are stable, so they're safe to use
 * inside effects without widening their dependency lists.
 */
export function useTimer(): Timer {
    const ref = useRef<ReturnType<typeof setTimeout> | null>(null);

    const timer = useMemo<Timer>(() => {
        const clear = () => {
            if (ref.current) clearTimeout(ref.current);
            ref.current = null;
        };
        return {
            clear,
            set: (fn, ms) => {
                clear();
                ref.current = setTimeout(fn, ms);
            },
        };
    }, []);

    useEffect(() => timer.clear, [timer]);

    return timer;
}
