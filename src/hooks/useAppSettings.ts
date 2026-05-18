import { useLocalStorage, useHydrated } from '@/hooks/useLocalStorage';
import { THEMES, getGradientStyle } from '@/types';

export function useAppSettings() {
    const [selectedTheme, setSelectedTheme] = useLocalStorage('theme', 'blue');
    const [sortOrder, setSortOrder] = useLocalStorage<'asc' | 'desc'>('sortOrder', 'asc');
    const [autoLoadState, setAutoLoadState] = useLocalStorage('autoLoadState', true);
    const [autoLoadIcon, setAutoLoadIcon] = useLocalStorage('autoLoadIcon', true);
    const [autoSaveState, setAutoSaveState] = useLocalStorage('autoSaveState', true);
    const [autoSaveInterval, setAutoSaveInterval] = useLocalStorage('autoSaveInterval', 300);
    const [autoSaveIcon, setAutoSaveIcon] = useLocalStorage('autoSaveIcon', true);
    const [saveOnExit, setSaveOnExit] = useLocalStorage('saveOnExit', true);

    const currentColors = THEMES[selectedTheme] || THEMES.blue;
    const gradientStyle = getGradientStyle(currentColors.gradientFrom, currentColors.gradientTo);

    return {
        selectedTheme, setSelectedTheme,
        sortOrder, setSortOrder,
        autoLoadState, setAutoLoadState,
        autoLoadIcon, setAutoLoadIcon,
        autoSaveState, setAutoSaveState,
        autoSaveInterval, setAutoSaveInterval,
        autoSaveIcon, setAutoSaveIcon,
        saveOnExit, setSaveOnExit,
        currentColors, gradientStyle,
        isHydrated: useHydrated(),
    };
}
