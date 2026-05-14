import type { ThemeColors } from '@/types';

export const stripExt = (name: string) => name.replace(/\.[^/.]+$/, '');

export const focusRingStyle = (active: boolean, colors: ThemeColors) => ({
    borderColor: active ? colors.highlight : colors.midDark,
    boxShadow: active ? `0 0 0 2px ${colors.highlight}30` : 'none',
});
