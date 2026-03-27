import { memo } from 'react';
import { ThemeColors, GradientStyle } from '@/types';

interface SwitchProps {
    checked: boolean;
    onChange: () => void;
    colors: ThemeColors;
    gradient: GradientStyle;
}

export const Switch = memo(({ checked, onChange, colors, gradient }: SwitchProps) => (
    <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-8 w-14 shrink-0 rounded-full border-2 items-center transition-colors duration-200 ${checked ? 'border-transparent' : ''}`}
        style={{
            backgroundColor: checked ? 'transparent' : colors.darkBg,
            borderColor: checked ? 'transparent' : colors.midDark,
            backgroundImage: checked ? gradient.backgroundImage : 'none'
        }}
    >
        <span
            className={`pointer-events-none inline-block h-6 w-6 rounded-full shadow ml-0.5 transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-0'}`}
            style={{ backgroundColor: checked ? colors.darkBg : colors.softLight }}
        />
    </button>
));

Switch.displayName = 'Switch';
