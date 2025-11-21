import { useState, useCallback } from 'react';
import { Game } from '@/types';
import { FILE_EXTENSIONS } from '@/lib/constants';

const DUPLICATE_MESSAGE_DURATION = 2500;
const DUPLICATE_MESSAGE_CLEAR_DELAY = 3000;

export function useGameOperations() {
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

  const showDuplicateError = useCallback((message: string) => {
    setDuplicateMessage(message);
    setShowDuplicateMessage(true);
    setTimeout(() => setShowDuplicateMessage(false), DUPLICATE_MESSAGE_DURATION);
    setTimeout(() => setDuplicateMessage(null), DUPLICATE_MESSAGE_CLEAR_DELAY);
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

  const getSystemFromExtension = useCallback((extension: string): string | null => {
    return FILE_EXTENSIONS[extension.toLowerCase()] || null;
  }, []);

  const extractFilesFromDataTransfer = useCallback((dataTransfer: DataTransfer): File[] => {
    const files: File[] = [];
    const items = dataTransfer.items || [];
    
    if (items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }
    } else {
      for (let i = 0; i < dataTransfer.files.length; i++) {
        files.push(dataTransfer.files[i]);
      }
    }
    return files;
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