import { useEffect, useState } from 'react';

/**
 * Returns `{ shouldRender, isClosing }` for animating mount/unmount.
 * When `open` flips false, `shouldRender` stays true for `delayMs` while `isClosing` is true.
 */
export function useDelayedUnmount(open: boolean, delayMs = 200) {
    const [shouldRender, setShouldRender] = useState(open);
    const [isClosing, setIsClosing] = useState(false);

    // State transitions happen during render; only the unmount delay needs the effect.
    if (open) {
        if (!shouldRender || isClosing) {
            setShouldRender(true);
            setIsClosing(false);
        }
    } else if (shouldRender && !isClosing) {
        setIsClosing(true);
    }

    useEffect(() => {
        if (open || !isClosing) return;
        const t = setTimeout(() => {
            setShouldRender(false);
            setIsClosing(false);
        }, delayMs);
        return () => clearTimeout(t);
    }, [open, isClosing, delayMs]);

    return { shouldRender, isClosing };
}
