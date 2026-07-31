import { useState } from 'react';
import { ViewType, Game, PendingFile } from '@/types';
import { useDelayedUnmount } from '@/hooks/useDelayedUnmount';
import { useTimer } from '@/hooks/useTimer';

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
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
    const [systemSearchQuery, setSystemSearchQuery] = useState('');
    const [pendingBatchCore, setPendingBatchCore] = useState<string | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const picker = useDelayedUnmount(pickerOpen);

    const [saveStateGame, setSaveStateGame] = useState<{ title: string; name: string } | null>(null);
    const [saveStateOpen, setSaveStateOpen] = useState(false);
    const saveState = useDelayedUnmount(saveStateOpen);

    const dupHide = useTimer();
    const dupClear = useTimer();
    // Modal contents are reset only after the exit animation, so the closing
    // panel doesn't visibly empty out; re-opening cancels the pending reset.
    const pickerReset = useTimer();
    const saveStateReset = useTimer();

    const setActiveView = (view: ViewType) => {
        setActiveViewRaw(prev => {
            if (view === 'library' && prev !== 'library') {
                setLibraryAnimationKey(k => k + 1);
            }
            return view;
        });
    };

    const showDuplicateError = (msg: string) => {
        dupClear.clear();
        setDuplicateMessage(msg);
        setShowDuplicateMessage(true);
        dupHide.set(() => {
            setShowDuplicateMessage(false);
            dupClear.set(() => setDuplicateMessage(null), DUPLICATE_FADE_MS);
        }, DUPLICATE_VISIBLE_MS);
    };

    const openSystemPicker = () => {
        pickerReset.clear();
        setPickerOpen(true);
    };
    const closeSystemPicker = () => {
        setPickerOpen(false);
        pickerReset.set(() => {
            setPendingFiles([]);
            setPendingGame(null);
            setEditingGame(null);
            setSystemSearchQuery('');
            setPendingBatchCore(null);
        }, MODAL_EXIT_MS);
    };

    const openSaveStateManager = (title: string, name: string) => {
        saveStateReset.clear();
        setSaveStateGame({ title, name });
        setSaveStateOpen(true);
    };

    const closeSaveStateManager = () => {
        setSaveStateOpen(false);
        saveStateReset.set(() => setSaveStateGame(null), MODAL_EXIT_MS);
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
        openSaveStateManager, closeSaveStateManager,
    };
}
