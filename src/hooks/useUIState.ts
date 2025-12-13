import { useState, useCallback, useRef } from 'react';

export function useUIState() {
  const [activeView, setActiveView] = useState<'library' | 'themes' | 'settings'>('library');
  const [isMounted, setIsMounted] = useState(false);
  const [gameSearchQuery, setGameSearchQuery] = useState('');
  const [gameSearchFocused, setGameSearchFocused] = useState(false);
  const [themeAnimationKey, setThemeAnimationKey] = useState(0);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedGameIds, setSelectedGameIds] = useState<Set<number>>(new Set());
  const [deletingGameIds, setDeletingGameIds] = useState<Set<number>>(new Set());

  const gameSearchInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

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
    activeView, setActiveView, isMounted, setIsMounted,
    gameSearchQuery, setGameSearchQuery, gameSearchFocused, setGameSearchFocused,
    themeAnimationKey, setThemeAnimationKey,
    isDeleteMode, setIsDeleteMode, selectedGameIds, setSelectedGameIds,
    deletingGameIds, setDeletingGameIds, gameSearchInputRef, dragCounterRef,
    toggleGameSelection, exitDeleteMode,
  };
}