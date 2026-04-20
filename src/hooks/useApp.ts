import { useState, useCallback } from 'react';
import { ViewType, Game } from '@/types';

const CLOSE_ANIMATION_MS = 200;

function useModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const open = useCallback(() => { setIsClosing(false); setIsOpen(true); }, []);
    const close = useCallback((onReset?: () => void) => {
        setIsClosing(true);
        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
            onReset?.();
        }, CLOSE_ANIMATION_MS);
    }, []);

    return { isOpen, isClosing, open, close };
}

export function useApp() {
    const [activeView, setActiveViewRaw] = useState<ViewType>('library');
    const [isMounted, setIsMounted] = useState(false);
    const [gameSearchQuery, setGameSearchQuery] = useState('');
    const [libraryAnimationKey, setLibraryAnimationKey] = useState(0);

    const [duplicateMessage, setDuplicateMessage] = useState<string | null>(null);
    const [showDuplicateMessage, setShowDuplicateMessage] = useState(false);
    const [editingGame, setEditingGame] = useState<Game | null>(null);
    const [pendingGame, setPendingGame] = useState<Partial<Game> | null>(null);
    const [pendingFiles, setPendingFiles] = useState<Array<{ file: File; index: number }>>([]);
    const [systemSearchQuery, setSystemSearchQuery] = useState('');
    const [pendingBatchCore, setPendingBatchCore] = useState<string | null>(null);
    const [saveStateGame, setSaveStateGame] = useState<{ title: string; name: string } | null>(null);

    const picker = useModal();
    const saveState = useModal();

    const setActiveView = useCallback((view: ViewType) => {
        setActiveViewRaw(prev => {
            if (view === 'library' && prev !== 'library') setLibraryAnimationKey(k => k + 1);
            return view;
        });
    }, []);

    const showDuplicateError = useCallback((msg: string) => {
        setDuplicateMessage(msg);
        setShowDuplicateMessage(true);
        setTimeout(() => setShowDuplicateMessage(false), 2500);
        setTimeout(() => setDuplicateMessage(null), 3000);
    }, []);

    const openSaveStateManager = useCallback((title: string, name: string) => {
        setSaveStateGame({ title, name });
        saveState.open();
    }, [saveState]);

    const closeSaveStateManager = useCallback(() => {
        saveState.close(() => setSaveStateGame(null));
    }, [saveState]);

    const closeSystemPicker = useCallback(() => {
        picker.close(() => {
            setPendingFiles([]);
            setPendingGame(null);
            setEditingGame(null);
            setSystemSearchQuery('');
            setPendingBatchCore(null);
        });
    }, [picker]);

    return {
        activeView, setActiveView,
        isMounted, setIsMounted,
        gameSearchQuery, setGameSearchQuery,
        libraryAnimationKey,
        duplicateMessage, showDuplicateMessage,
        editingGame, setEditingGame,
        pendingGame, setPendingGame,
        pendingFiles, setPendingFiles,
        systemPickerOpen: picker.isOpen,
        systemPickerClosing: picker.isClosing,
        openSystemPicker: picker.open,
        systemSearchQuery, setSystemSearchQuery,
        pendingBatchCore, setPendingBatchCore,
        saveStateGame,
        saveStateOpen: saveState.isOpen,
        saveStateClosing: saveState.isClosing,
        openSaveStateManager, closeSaveStateManager,
        showDuplicateError, closeSystemPicker,
    };
}
