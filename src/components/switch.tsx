import { memo } from 'react';

interface SwitchProps {
    checked: boolean;
    onChange: () => void;
    colors: any;
    gradient: any;
}

export const Switch = memo(({ checked, onChange, colors, gradient }: SwitchProps) => (
    <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-8 w-14 flex-shrink-0 rounded-full border-2 transition-colors duration-200 items-center ${checked ? 'border-transparent' : ''}`}
        style={{
            backgroundColor: checked ? 'transparent' : colors.darkBg,
            borderColor: checked ? 'transparent' : colors.midDark,
            backgroundImage: checked ? gradient.backgroundImage : 'none',
            boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.3)'
        }}
    >
        <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full shadow transition duration-200 ml-0.5 ${checked ? 'translate-x-6' : 'translate-x-0'}`}
            style={{ backgroundColor: checked ? colors.darkBg : colors.softLight }}
        />
    </button>
));

Switch.displayName = 'Switch';
