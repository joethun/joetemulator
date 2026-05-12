import { useEffect, useState } from 'react';

/**
 * Returns `{ shouldRender, isClosing }` for animating mount/unmount.
 * When `open` flips false, `shouldRender` stays true for `delayMs` while `isClosing` is true.
 */
export function useDelayedUnmount(open: boolean, delayMs = 200) {
    const [shouldRender, setShouldRender] = useState(open);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (open) {
            setShouldRender(true);
            setIsClosing(false);
            return;
        }
        if (!shouldRender) return;
        setIsClosing(true);
        const t = setTimeout(() => {
            setShouldRender(false);
            setIsClosing(false);
        }, delayMs);
        return () => clearTimeout(t);
    }, [open, shouldRender, delayMs]);

    return { shouldRender, isClosing };
}
