import { useState, useCallback, useRef } from 'react';
import { ViewType } from '@/types';

/**
 * manages ui state for the main application
 */
export function useUIState() {
  const [activeView, setActiveView] = useState<ViewType>('library');
  const [isMounted, setIsMounted] = useState(false);
  const [gameSearchQuery, setGameSearchQuery] = useState('');
  const [gameSearchFocused, setGameSearchFocused] = useState(false);
  const [themeAnimationKey, setThemeAnimationKey] = useState(0);
  const [libraryAnimationKey, setLibraryAnimationKey] = useState(0);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedGameIds, setSelectedGameIds] = useState<Set<number>>(new Set());
  const [deletingGameIds, setDeletingGameIds] = useState<Set<number>>(new Set());

  const gameSearchInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // toggle game selection in delete mode
  const toggleGameSelection = useCallback((id: number) => {
    setSelectedGameIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // exit delete mode and clear selections
  const exitDeleteMode = useCallback(() => {
    setIsDeleteMode(false);
    setSelectedGameIds(new Set());
  }, []);

  return {
    activeView,
    setActiveView,
    isMounted,
    setIsMounted,
    gameSearchQuery,
    setGameSearchQuery,
    gameSearchFocused,
    setGameSearchFocused,
    themeAnimationKey,
    setThemeAnimationKey,
    libraryAnimationKey,
    setLibraryAnimationKey,
    isDeleteMode,
    setIsDeleteMode,
    selectedGameIds,
    setSelectedGameIds,
    deletingGameIds,
    setDeletingGameIds,
    gameSearchInputRef,
    dragCounterRef,
    toggleGameSelection,
    exitDeleteMode,
  };
}