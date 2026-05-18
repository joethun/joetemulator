import { useState, useEffect, useRef } from 'react';
import { ViewType, Game } from '@/types';
import { useDelayedUnmount } from '@/hooks/useDelayedUnmount';

const DUPLICATE_VISIBLE_MS = 2500;
const DUPLICATE_FADE_MS = 500;
const MODAL_EXIT_MS = 200;

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

    const dupHideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dupClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pickerResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const saveStateResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => {
        if (dupHideRef.current) clearTimeout(dupHideRef.current);
        if (dupClearRef.current) clearTimeout(dupClearRef.current);
        if (pickerResetRef.current) clearTimeout(pickerResetRef.current);
        if (saveStateResetRef.current) clearTimeout(saveStateResetRef.current);
    }, []);

    const setActiveView = (view: ViewType) => {
        setActiveViewRaw(prev => {
            if (view === 'library' && prev !== 'library') {
                setLibraryAnimationKey(k => k + 1);
            }
            return view;
        });
    };

    const showDuplicateError = (msg: string) => {
        if (dupHideRef.current) clearTimeout(dupHideRef.current);
        if (dupClearRef.current) clearTimeout(dupClearRef.current);
        setDuplicateMessage(msg);
        setShowDuplicateMessage(true);
        dupHideRef.current = setTimeout(() => {
            setShowDuplicateMessage(false);
            dupClearRef.current = setTimeout(() => setDuplicateMessage(null), DUPLICATE_FADE_MS);
        }, DUPLICATE_VISIBLE_MS);
    };

    const openSystemPicker = () => {
        if (pickerResetRef.current) { clearTimeout(pickerResetRef.current); pickerResetRef.current = null; }
        setPickerOpen(true);
    };
    const closeSystemPicker = () => {
        setPickerOpen(false);
        if (pickerResetRef.current) clearTimeout(pickerResetRef.current);
        pickerResetRef.current = setTimeout(() => {
            setPendingFiles([]);
            setPendingGame(null);
            setEditingGame(null);
            setSystemSearchQuery('');
            setPendingBatchCore(null);
        }, MODAL_EXIT_MS);
    };

    const openSaveStateManager = (title: string, name: string, onBack?: () => void) => {
        if (saveStateResetRef.current) { clearTimeout(saveStateResetRef.current); saveStateResetRef.current = null; }
        setSaveStateGame({ title, name });
        setSaveStateOnBack(() => onBack ?? null);
        setSaveStateOpen(true);
    };

    const closeSaveStateManager = (skipAfter?: boolean) => {
        const after = skipAfter ? null : saveStateOnBack;
        setSaveStateOnBack(null);
        setSaveStateOpen(false);
        if (saveStateResetRef.current) clearTimeout(saveStateResetRef.current);
        saveStateResetRef.current = setTimeout(() => setSaveStateGame(null), MODAL_EXIT_MS);
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
