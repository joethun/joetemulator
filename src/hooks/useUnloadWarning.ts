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
            // Calling preventDefault() triggers the prompt in all current
            // browsers; the legacy event.returnValue is deprecated.
            e.preventDefault();
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [active, shouldWarn]);
}
