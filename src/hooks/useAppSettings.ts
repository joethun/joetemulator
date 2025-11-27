import { useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { THEMES, getGradientStyle } from '@/types';

export function useAppSettings() {
    // persistence
    const [selectedTheme, setSelectedTheme, isThemeHydrated] = useLocalStorage('theme', 'default');
    const [sortBy, setSortBy, isSortByHydrated] = useLocalStorage<'title' | 'system'>('sortBy', 'title');
    const [sortOrder, setSortOrder, isSortOrderHydrated] = useLocalStorage<'asc' | 'desc'>('sortOrder', 'asc');
    const [autoLoadState, setAutoLoadState, isAutoLoadHydrated] = useLocalStorage('autoLoadState', true);
    const [autoLoadIcon, setAutoLoadIcon] = useLocalStorage('autoLoadIcon', true);
    const [autoSaveState, setAutoSaveState, isAutoSaveHydrated] = useLocalStorage('autoSaveState', true);
    const [autoSaveInterval, setAutoSaveInterval] = useLocalStorage('autoSaveInterval', 60);
    const [autoSaveIcon, setAutoSaveIcon] = useLocalStorage('autoSaveIcon', true);

    // derived theme styles
    const currentColors = useMemo(() =>
        THEMES[selectedTheme as keyof typeof THEMES] || THEMES.default,
        [selectedTheme]);

    const gradientStyle = useMemo(() =>
        getGradientStyle(currentColors.gradientFrom, currentColors.gradientTo),
        [currentColors]);

    // hydration check
    const isHydrated = isThemeHydrated && isSortByHydrated && isSortOrderHydrated && isAutoLoadHydrated && isAutoSaveHydrated;

    return {
        // state
        selectedTheme, setSelectedTheme,
        sortBy, setSortBy,
        sortOrder, setSortOrder,
        autoLoadState, setAutoLoadState,
        autoLoadIcon, setAutoLoadIcon,
        autoSaveState, setAutoSaveState,
        autoSaveInterval, setAutoSaveInterval,
        autoSaveIcon, setAutoSaveIcon,

        // derived
        currentColors,
        gradientStyle,
        isHydrated,
    };
}