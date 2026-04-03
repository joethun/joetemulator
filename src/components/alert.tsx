import { memo, useState, useEffect } from 'react';
import { XCircle } from 'lucide-react';

interface AlertProps {
    message: string;
    isVisible: boolean;
}

export const Alert = memo(({ message, isVisible }: AlertProps) => {
    const [opacity, setOpacity] = useState(false);

    useEffect(() => {
        if (isVisible) {
            // Mount at opacity-0, then next frame transition to opacity-100
            setOpacity(false);
            const t = requestAnimationFrame(() => setOpacity(true));
            return () => cancelAnimationFrame(t);
        } else {
            setOpacity(false);
        }
    }, [isVisible]);

    return (
        <div
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-60 px-6 py-4 rounded-xl shadow-2xl bg-red-500 text-white flex items-center gap-2 transition-opacity duration-300"
            style={{ opacity: opacity ? 1 : 0, pointerEvents: isVisible ? 'auto' : 'none' }}
            role="alert"
        >
            <XCircle className="w-5 h-5" />
            <span className="font-semibold">{message}</span>
        </div>
    );
});

Alert.displayName = 'Alert';
