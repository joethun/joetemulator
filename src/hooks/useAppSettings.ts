import { useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { THEMES, getGradientStyle } from '@/types';

export function useAppSettings() {
    const [selectedTheme, setSelectedTheme, themeHydrated] = useLocalStorage('theme', 'default');
    const [sortBy, setSortBy, sortByHydrated] = useLocalStorage<'system'>('sortBy', 'system');
    const [sortOrder, setSortOrder, sortOrderHydrated] = useLocalStorage<'asc' | 'desc'>('sortOrder', 'asc');
    const [autoLoadState, setAutoLoadState, autoLoadHydrated] = useLocalStorage('autoLoadState', true);
    const [autoLoadIcon, setAutoLoadIcon] = useLocalStorage('autoLoadIcon', true);
    const [autoSaveState, setAutoSaveState, autoSaveHydrated] = useLocalStorage('autoSaveState', true);
    const [autoSaveInterval, setAutoSaveInterval] = useLocalStorage('autoSaveInterval', 60);
    const [autoSaveIcon, setAutoSaveIcon] = useLocalStorage('autoSaveIcon', true);

    const currentColors = useMemo(() => THEMES[selectedTheme] || THEMES.default, [selectedTheme]);
    const gradientStyle = useMemo(() => getGradientStyle(currentColors.gradientFrom, currentColors.gradientTo), [currentColors]);
    const isHydrated = themeHydrated && sortByHydrated && sortOrderHydrated && autoLoadHydrated && autoSaveHydrated;

    return {
        selectedTheme, setSelectedTheme,
        sortBy, setSortBy,
        sortOrder, setSortOrder,
        autoLoadState, setAutoLoadState,
        autoLoadIcon, setAutoLoadIcon,
        autoSaveState, setAutoSaveState,
        autoSaveInterval, setAutoSaveInterval,
        autoSaveIcon, setAutoSaveIcon,
        currentColors, gradientStyle, isHydrated,
    };
}