import { useEffect } from 'react';

/**
 * Shows the browser's "are you sure you want to leave?" prompt on tab
 * close/refresh/navigation while `active` is true.
 *
 * @param shouldWarn Optional last-moment check (must be referentially stable,
 * e.g. wrap in useCallback) — return false to let an intentional reload
 * through without the prompt.
 */
export function useUnloadWarning(active: boolean, shouldWarn?: () => boolean): void {
    useEffect(() => {
        if (!active) return;
        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            if (shouldWarn && !shouldWarn()) return;
            e.preventDefault();
            // Chrome requires returnValue to be set for the prompt to appear.
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [active, shouldWarn]);
}
