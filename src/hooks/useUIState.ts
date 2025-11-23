import { useState, useCallback, useRef } from 'react';

export function useUIState() {
  const [activeView, setActiveView] = useState<'library' | 'themes' | 'settings'>('library');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  const [gameSearchQuery, setGameSearchQuery] = useState('');
  const [gameSearchFocused, setGameSearchFocused] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [themeAnimationKey, setThemeAnimationKey] = useState(0);
  const [gameListAnimationKey, setGameListAnimationKey] = useState(0);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedGameIds, setSelectedGameIds] = useState<Set<number>>(new Set());
  const [deletingGameIds, setDeletingGameIds] = useState<Set<number>>(new Set());

  const gameSearchInputRef = useRef<HTMLInputElement | null>(null);
  const dragCounterRef = useRef(0);

  // toggles selection of a game id
  const toggleGameSelection = useCallback((gameId: number) => {
    setSelectedGameIds(prev => {
      const next = new Set(prev);
      next.has(gameId) ? next.delete(gameId) : next.add(gameId);
      return next;
    });
  }, []);

  // cleans up delete mode state
  const exitDeleteMode = useCallback(() => {
    setIsDeleteMode(false);
    setSelectedGameIds(new Set());
  }, []);

  return {
    activeView, setActiveView,
    isSidebarOpen, setIsSidebarOpen,
    currentTime, setCurrentTime,
    isMounted, setIsMounted,
    gameSearchQuery, setGameSearchQuery,
    gameSearchFocused, setGameSearchFocused,
    isDragActive, setIsDragActive,
    themeAnimationKey, setThemeAnimationKey,
    gameListAnimationKey, setGameListAnimationKey,
    isDeleteMode, setIsDeleteMode,
    selectedGameIds, setSelectedGameIds,
    deletingGameIds, setDeletingGameIds,
    gameSearchInputRef, dragCounterRef,
    toggleGameSelection, exitDeleteMode,
  };
}