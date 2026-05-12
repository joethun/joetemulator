import { useState } from 'react';
import { ViewType, Game } from '@/types';
import { useDelayedUnmount } from '@/hooks/useDelayedUnmount';

export function useApp() {
    const [activeView, setActiveViewRaw] = useState<ViewType>('library');
    const [gameSearchQuery, setGameSearchQuery] = useState('');
    const [libraryAnimationKey, setLibraryAnimationKey] = useState(0);

    const [duplicateMessage, setDuplicateMessage] = useState<string | null>(null);
    const [showDuplicateMessage, setShowDuplicateMessage] = useState(false);

    const [editingGame, setEditingGame] = useState<Game | null>(null);
    const [pendingGame, setPendingGame] = useState<Partial<Game> | null>(null);
    const [pendingFiles, setPendingFiles] = useState<Array<{ file: File; index: number }>>([]);
    const [systemSearchQuery, setSystemSearchQuery] = useState('');
    const [pendingBatchCore, setPendingBatchCore] = useState<string | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const picker = useDelayedUnmount(pickerOpen);

    const [saveStateGame, setSaveStateGame] = useState<{ title: string; name: string } | null>(null);
    const [saveStateOpen, setSaveStateOpen] = useState(false);
    const [saveStateOnBack, setSaveStateOnBack] = useState<(() => void) | null>(null);
    const saveState = useDelayedUnmount(saveStateOpen);

    const setActiveView = (view: ViewType) => {
        setActiveViewRaw(prev => {
            if (view === 'library' && prev !== 'library') {
                setLibraryAnimationKey(k => k + 1);
            }
            return view;
        });
    };

    const showDuplicateError = (msg: string) => {
        setDuplicateMessage(msg);
        setShowDuplicateMessage(true);
        setTimeout(() => {
            setShowDuplicateMessage(false);
            setTimeout(() => setDuplicateMessage(null), 500);
        }, 2500);
    };

    const openSystemPicker = () => setPickerOpen(true);
    const closeSystemPicker = () => {
        setPickerOpen(false);
        setTimeout(() => {
            setPendingFiles([]);
            setPendingGame(null);
            setEditingGame(null);
            setSystemSearchQuery('');
            setPendingBatchCore(null);
        }, 200);
    };

    const openSaveStateManager = (title: string, name: string, onBack?: () => void) => {
        setSaveStateGame({ title, name });
        setSaveStateOnBack(() => onBack ?? null);
        setSaveStateOpen(true);
    };

    const closeSaveStateManager = (skipAfter?: boolean) => {
        const after = skipAfter ? null : saveStateOnBack;
        setSaveStateOnBack(null);
        setSaveStateOpen(false);
        setTimeout(() => setSaveStateGame(null), 200);
        after?.();
    };

    return {
        activeView, setActiveView,
        gameSearchQuery, setGameSearchQuery,
        libraryAnimationKey,
        duplicateMessage, showDuplicateMessage, showDuplicateError,

        editingGame, setEditingGame,
        pendingGame, setPendingGame,
        pendingFiles, setPendingFiles,
        systemSearchQuery, setSystemSearchQuery,
        pendingBatchCore, setPendingBatchCore,
        systemPickerOpen: picker.shouldRender,
        systemPickerClosing: picker.isClosing,
        openSystemPicker, closeSystemPicker,

        saveStateGame,
        saveStateOpen: saveState.shouldRender,
        saveStateClosing: saveState.isClosing,
        saveStateHasBack: !!saveStateOnBack,
        openSaveStateManager, closeSaveStateManager,
    };
}
