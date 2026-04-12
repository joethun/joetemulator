import { useState, useCallback } from 'react';
import { ViewType, Game } from '@/types';

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
    const [systemPickerOpen, setSystemPickerOpen] = useState(false);
    const [systemPickerClosing, setSystemPickerClosing] = useState(false);
    const [systemSearchQuery, setSystemSearchQuery] = useState('');
    const [pendingBatchCore, setPendingBatchCore] = useState<string | null>(null);
    const [saveStateGame, setSaveStateGame] = useState<{ title: string; name: string } | null>(null);
    const [saveStateOpen, setSaveStateOpen] = useState(false);
    const [saveStateClosing, setSaveStateClosing] = useState(false);

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
        setSaveStateClosing(false);
        setSaveStateOpen(true);
    }, []);

    const closeSaveStateManager = useCallback(() => {
        setSaveStateClosing(true);
        setTimeout(() => {
            setSaveStateOpen(false);
            setSaveStateClosing(false);
            setSaveStateGame(null);
        }, 200);
    }, []);

    const closeSystemPicker = useCallback(() => {
        setSystemPickerClosing(true);
        setTimeout(() => {
            setSystemPickerOpen(false);
            setSystemPickerClosing(false);
            setPendingFiles([]);
            setPendingGame(null);
            setEditingGame(null);
            setSystemSearchQuery('');
            setPendingBatchCore(null);
        }, 200);
    }, []);

    return {
        activeView, setActiveView,
        isMounted, setIsMounted,
        gameSearchQuery, setGameSearchQuery,
        libraryAnimationKey,
        duplicateMessage, showDuplicateMessage,
        editingGame, setEditingGame,
        pendingGame, setPendingGame,
        pendingFiles, setPendingFiles,
        systemPickerOpen, setSystemPickerOpen,
        systemPickerClosing,
        systemSearchQuery, setSystemSearchQuery,
        pendingBatchCore, setPendingBatchCore,
        saveStateGame, saveStateOpen, saveStateClosing,
        openSaveStateManager, closeSaveStateManager,
        showDuplicateError, closeSystemPicker,
    };
}
