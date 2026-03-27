import { useState, useCallback, useRef } from 'react';
import { ViewType } from '@/types';

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

  return {
    activeView, setActiveView,
    isMounted, setIsMounted,
    gameSearchQuery, setGameSearchQuery,
    gameSearchFocused, setGameSearchFocused,
    themeAnimationKey, setThemeAnimationKey,
    libraryAnimationKey, setLibraryAnimationKey,
    isDeleteMode, setIsDeleteMode,
    selectedGameIds, setSelectedGameIds,
    deletingGameIds, setDeletingGameIds,
    gameSearchInputRef,
    toggleGameSelection, exitDeleteMode,
  };
}