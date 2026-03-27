import { useState, useCallback } from 'react';
import { Game } from '@/types';

const HIDE_DELAY = 2500;
const CLEAR_DELAY = 3000;
const PICKER_CLOSE_DELAY = 200;

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

  const showDuplicateError = useCallback((msg: string) => {
    setDuplicateMessage(msg);
    setShowDuplicateMessage(true);
    setTimeout(() => setShowDuplicateMessage(false), HIDE_DELAY);
    setTimeout(() => setDuplicateMessage(null), CLEAR_DELAY);
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
    duplicateMessage, showDuplicateMessage,
    editingGame, setEditingGame,
    pendingGame, setPendingGame,
    pendingFiles, setPendingFiles,
    systemPickerOpen, setSystemPickerOpen,
    systemPickerClosing,
    systemSearchQuery, setSystemSearchQuery,
    pendingBatchCore, setPendingBatchCore,
    coverArtFit, setCoverArtFit,
    showDuplicateError, closeSystemPicker,
  };
}