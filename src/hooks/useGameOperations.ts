import { useState, useCallback } from 'react';
import { Game } from '@/types';
import { FILE_EXTENSIONS } from '@/lib/constants';

const DUPLICATE_MESSAGE_DURATION = 2500;
const DUPLICATE_MESSAGE_CLEAR_DELAY = 3000;

export function useGameOperations() {
  // game edit state
  const [duplicateMessage, setDuplicateMessage] = useState<string | null>(null);
  const [showDuplicateMessage, setShowDuplicateMessage] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [pendingGame, setPendingGame] = useState<Partial<Game> | null>(null);
  const [pendingFiles, setPendingFiles] = useState<Array<{ file: File; index: number }>>([]);

  // system picker state
  const [systemPickerOpen, setSystemPickerOpen] = useState(false);
  const [systemPickerClosing, setSystemPickerClosing] = useState(false);
  const [systemSearchQuery, setSystemSearchQuery] = useState('');
  const [pendingBatchCore, setPendingBatchCore] = useState<string | null>(null);
  const [coverArtFit, setCoverArtFit] = useState<'cover' | 'contain'>('cover');

  // show duplicate error notification
  const showDuplicateError = useCallback((message: string) => {
    setDuplicateMessage(message);
    setShowDuplicateMessage(true);
    setTimeout(() => setShowDuplicateMessage(false), DUPLICATE_MESSAGE_DURATION);
    setTimeout(() => setDuplicateMessage(null), DUPLICATE_MESSAGE_CLEAR_DELAY);
  }, []);

  // close picker with animation
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

  // detect system from file extension
  const getSystemFromExtension = useCallback((extension: string): string | null => {
    return FILE_EXTENSIONS[extension.toLowerCase()] || null;
  }, []);

  // extract files from drag drop event
  const extractFilesFromDataTransfer = useCallback((dataTransfer: DataTransfer): File[] => {
    if (dataTransfer.items?.length) {
      return Array.from(dataTransfer.items)
        .filter(item => item.kind === 'file')
        .map(item => item.getAsFile())
        .filter((file): file is File => file !== null);
    }
    return Array.from(dataTransfer.files);
  }, []);

  return {
    duplicateMessage,
    showDuplicateMessage,
    editingGame,
    setEditingGame,
    pendingGame,
    setPendingGame,
    pendingFiles,
    setPendingFiles,
    systemPickerOpen,
    setSystemPickerOpen,
    systemPickerClosing,
    systemSearchQuery,
    setSystemSearchQuery,
    pendingBatchCore,
    setPendingBatchCore,
    coverArtFit,
    setCoverArtFit,
    showDuplicateError,
    closeSystemPicker,
    getSystemFromExtension,
    extractFilesFromDataTransfer,
  };
}