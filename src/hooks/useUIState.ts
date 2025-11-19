import { useState, useCallback, useRef } from 'react';

export function useUIState() {
  const [activeView, setActiveView] = useState<'library' | 'themes'>('library');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  const [gameSearchQuery, setGameSearchQuery] = useState('');
  const [gameSearchFocused, setGameSearchFocused] = useState(false);
  const [gameSearchExpanded, setGameSearchExpanded] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [themeAnimationKey, setThemeAnimationKey] = useState(0);
  const [gameListAnimationKey, setGameListAnimationKey] = useState(0);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedGameIds, setSelectedGameIds] = useState<Set<number>>(new Set());
  const [deletingGameIds, setDeletingGameIds] = useState<Set<number>>(new Set());

  const gameSearchInputRef = useRef<HTMLInputElement | null>(null);
  const dragCounterRef = useRef(0);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const deleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPressingRef = useRef(false);

  const toggleGameSearch = useCallback(() => {
    setGameSearchExpanded(prev => {
      const next = !prev;
      if (next) {
        requestAnimationFrame(() => gameSearchInputRef.current?.focus());
      } else {
        setGameSearchQuery('');
      }
      return next;
    });
  }, []);

  const toggleGameSelection = useCallback((gameId: number) => {
    setSelectedGameIds(prev => {
      const next = new Set(prev);
      if (next.has(gameId)) {
        next.delete(gameId);
      } else {
        next.add(gameId);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((gameIds: number[]) => {
    setSelectedGameIds(prev =>
      prev.size === gameIds.length ? new Set() : new Set(gameIds)
    );
  }, []);

  const exitDeleteMode = useCallback(() => {
    setIsDeleteMode(false);
    setSelectedGameIds(new Set());
  }, []);

  const handleDeleteButtonMouseDown = useCallback(() => {
    isPressingRef.current = true;
    deleteTimeoutRef.current = setTimeout(() => {
      if (isPressingRef.current) {
        setIsDeleteMode(true);
      }
    }, 500);
  }, []);

  const handleDeleteButtonMouseUp = useCallback(() => {
    isPressingRef.current = false;
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
      deleteTimeoutRef.current = null;
    }
  }, []);

  return {
    activeView,
    setActiveView,
    isSidebarOpen,
    setIsSidebarOpen,
    currentTime,
    setCurrentTime,
    isMounted,
    setIsMounted,
    gameSearchQuery,
    setGameSearchQuery,
    gameSearchFocused,
    setGameSearchFocused,
    gameSearchExpanded,
    setGameSearchExpanded,
    isDragActive,
    setIsDragActive,
    themeAnimationKey,
    setThemeAnimationKey,
    gameListAnimationKey,
    setGameListAnimationKey,
    isDeleteMode,
    setIsDeleteMode,
    selectedGameIds,
    setSelectedGameIds,
    deletingGameIds,
    setDeletingGameIds,
    gameSearchInputRef,
    dragCounterRef,
    deleteButtonRef,
    deleteTimeoutRef,
    isPressingRef,
    toggleGameSearch,
    toggleGameSelection,
    toggleSelectAll,
    exitDeleteMode,
    handleDeleteButtonMouseDown,
    handleDeleteButtonMouseUp,
  };
}
