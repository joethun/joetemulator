import { useState, useCallback, useRef } from 'react';
import { ViewType, Game } from '@/types';

const HIDE_DELAY = 2500;
const CLEAR_DELAY = 3000;
const PICKER_CLOSE_DELAY = 200;

export function useApp() {
    const [activeView, setActiveViewRaw] = useState<ViewType>('library');
    const [isMounted, setIsMounted] = useState(false);
    const [gameSearchQuery, setGameSearchQuery] = useState('');
    const [gameSearchFocused, setGameSearchFocused] = useState(false);
    const [themeAnimationKey, setThemeAnimationKey] = useState(0);
    const [libraryAnimationKey, setLibraryAnimationKey] = useState(0);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [selectedGameIds, setSelectedGameIds] = useState<Set<number>>(new Set());
    const [deletingGameIds, setDeletingGameIds] = useState<Set<number>>(new Set());
    const gameSearchInputRef = useRef<HTMLInputElement>(null);

    const [duplicateMessage, setDuplicateMessage] = useState<string | null>(null);
    const [showDuplicateMessage, setShowDuplicateMessage] = useState(false);
    const [editingGame, setEditingGame] = useState<Game | null>(null);
    const [pendingGame, setPendingGame] = useState<Partial<Game> | null>(null);
    const [pendingFiles, setPendingFiles] = useState<Array<{ file: File; index: number }>>([]);
    const [systemPickerOpen, setSystemPickerOpen] = useState(false);
    const [systemPickerClosing, setSystemPickerClosing] = useState(false);
    const [systemSearchQuery, setSystemSearchQuery] = useState('');
    const [pendingBatchCore, setPendingBatchCore] = useState<string | null>(null);
    const [coverArtFit, setCoverArtFit] = useState<'cover' | 'contain'>('cover');
    const [saveStateGame, setSaveStateGame] = useState<{ title: string; name: string } | null>(null);
    const [saveStateOpen, setSaveStateOpen] = useState(false);
    const [saveStateClosing, setSaveStateClosing] = useState(false);

    const setActiveView = useCallback((view: ViewType) => {
        setActiveViewRaw(prev => {
            if (view === 'themes') setThemeAnimationKey(k => k + 1);
            else if (view === 'library' && prev !== 'library') setLibraryAnimationKey(k => k + 1);
            return view;
        });
    }, []);

    const toggleGameSelection = useCallback((id: number) => {
        setSelectedGameIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const exitDeleteMode = useCallback(() => {
        setIsDeleteMode(false);
        setSelectedGameIds(new Set());
    }, []);

    const showDuplicateError = useCallback((msg: string) => {
        setDuplicateMessage(msg);
        setShowDuplicateMessage(true);
        setTimeout(() => setShowDuplicateMessage(false), HIDE_DELAY);
        setTimeout(() => setDuplicateMessage(null), CLEAR_DELAY);
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
        }, PICKER_CLOSE_DELAY);
    }, []);

    return {
        activeView, setActiveView,
        isMounted, setIsMounted,
        gameSearchQuery, setGameSearchQuery,
        gameSearchFocused, setGameSearchFocused,
        themeAnimationKey, libraryAnimationKey,
        isDeleteMode, setIsDeleteMode,
        selectedGameIds,
        deletingGameIds, setDeletingGameIds,
        gameSearchInputRef,
        toggleGameSelection, exitDeleteMode,
        duplicateMessage, showDuplicateMessage,
        editingGame, setEditingGame,
        pendingGame, setPendingGame,
        pendingFiles, setPendingFiles,
        systemPickerOpen, setSystemPickerOpen,
        systemPickerClosing,
        systemSearchQuery, setSystemSearchQuery,
        pendingBatchCore, setPendingBatchCore,
        coverArtFit, setCoverArtFit,
        saveStateGame, saveStateOpen, saveStateClosing,
        openSaveStateManager, closeSaveStateManager,
        showDuplicateError, closeSystemPicker,
    };
}
