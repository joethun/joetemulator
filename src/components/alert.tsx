import { memo } from 'react';
import { XCircle } from 'lucide-react';

interface AlertProps {
    message: string;
    isVisible: boolean;
}

// displays error/warning messages at bottom of screen
export const Alert = memo(({ message, isVisible }: AlertProps) => (
    <div
        className={`fixed bottom-12 left-1/2 -translate-x-1/2 px-6 py-4 rounded-xl shadow-2xl z-60 bg-red-500 text-white flex items-center gap-2 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
        role="alert"
    >
        <XCircle className="w-5 h-5" />
        <span className="font-semibold">{message}</span>
    </div>
));

Alert.displayName = 'Alert';
