import { useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { THEMES, getGradientStyle } from '@/types';

export function useAppSettings() {
    const [selectedTheme, setSelectedTheme, h1] = useLocalStorage('theme', 'default');
    const [sortBy, setSortBy, h2] = useLocalStorage<'title' | 'system'>('sortBy', 'title');
    const [sortOrder, setSortOrder, h3] = useLocalStorage<'asc' | 'desc'>('sortOrder', 'asc');
    const [autoLoadState, setAutoLoadState, h4] = useLocalStorage('autoLoadState', true);
    const [autoLoadIcon, setAutoLoadIcon] = useLocalStorage('autoLoadIcon', true);
    const [autoSaveState, setAutoSaveState, h5] = useLocalStorage('autoSaveState', true);
    const [autoSaveInterval, setAutoSaveInterval] = useLocalStorage('autoSaveInterval', 60);
    const [autoSaveIcon, setAutoSaveIcon] = useLocalStorage('autoSaveIcon', true);
    const [snappyAnimations, setSnappyAnimations, h6] = useLocalStorage('snappyAnimations', false);

    const currentColors = useMemo(() => THEMES[selectedTheme as keyof typeof THEMES] || THEMES.default, [selectedTheme]);
    const gradientStyle = useMemo(() => getGradientStyle(currentColors.gradientFrom, currentColors.gradientTo), [currentColors]);

    return {
        selectedTheme, setSelectedTheme, sortBy, setSortBy, sortOrder, setSortOrder,
        autoLoadState, setAutoLoadState, autoLoadIcon, setAutoLoadIcon,
        autoSaveState, setAutoSaveState, autoSaveInterval, setAutoSaveInterval,
        autoSaveIcon, setAutoSaveIcon, snappyAnimations, setSnappyAnimations,
        currentColors, gradientStyle, isHydrated: h1 && h2 && h3 && h4 && h5 && h6,
    };
}