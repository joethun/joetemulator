import { useLocalStorage, useHydrated } from '@/hooks/useLocalStorage';
import { THEMES, getGradientStyle } from '@/types';

export type AppSettings = ReturnType<typeof useAppSettings>;

export function useAppSettings() {
    const [selectedTheme, setSelectedTheme] = useLocalStorage('theme', 'blue');
    const [autoLoadState, setAutoLoadState] = useLocalStorage('autoLoadState', true);
    const [autoLoadIcon, setAutoLoadIcon] = useLocalStorage('autoLoadIcon', true);
    const [autoSaveState, setAutoSaveState] = useLocalStorage('autoSaveState', true);
    const [autoSaveInterval, setAutoSaveInterval] = useLocalStorage('autoSaveInterval', 300);
    const [autoSaveIcon, setAutoSaveIcon] = useLocalStorage('autoSaveIcon', true);
    const [saveOnExit, setSaveOnExit] = useLocalStorage('saveOnExit', true);
    const [raEnabled, setRaEnabled] = useLocalStorage('raEnabled', false);
    const [raHardcore, setRaHardcore] = useLocalStorage('raHardcore', false);

    const currentColors = THEMES[selectedTheme] || THEMES.blue;
    const gradientStyle = getGradientStyle(currentColors);

    return {
        selectedTheme, setSelectedTheme,
        autoLoadState, setAutoLoadState,
        autoLoadIcon, setAutoLoadIcon,
        autoSaveState, setAutoSaveState,
        autoSaveInterval, setAutoSaveInterval,
        autoSaveIcon, setAutoSaveIcon,
        saveOnExit, setSaveOnExit,
        raEnabled, setRaEnabled,
        raHardcore, setRaHardcore,
        currentColors, gradientStyle,
        isHydrated: useHydrated(),
    };
}
