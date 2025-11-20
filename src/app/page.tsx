"use client";
/*
Revision Log
- Date: 2025-11-19
- Summary: Performance and maintainability optimization while preserving functionality.
- Changes:
- 1) Removed unused imports and variables; resolved naming conflict with getSystemCategory.
- 2) Consolidated repeated game card rendering into helper to reduce duplication.
- 3) Simplified system picker finalization logic and unified duplicate pathways.
- 4) Optimized event handlers with stable callbacks; added delay helper and centralized error logging.
- 5) Centralized font family constant; replaced repeated inline strings.
- 6) Replaced duplicated "Add Game" button with reusable helper.
*/

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { DragEvent } from 'react';
import { loadGame } from '@/lib/emulator';
import { saveGameFile, getGameFile } from '@/lib/storage';
import { SYSTEM_PICKER, getSystemNameByCore } from '@/lib/constants';
import { Game, THEMES, getGradientStyle } from '@/types';
import { GameCard } from '@/components/GameCardComponent';
import { Gamepad2, Palette, Menu, X, Trash2, ArrowUp, ArrowDown, Search, Plus, CircleCheck, Image, XCircle } from 'lucide-react';
import { useGameLibrary } from '@/hooks/useGameLibrary';
import { useUIState } from '@/hooks/useUIState';
import { useGameOperations } from '@/hooks/useGameOperations';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Constants
const TIME_UPDATE_INTERVAL = 60000;
const FONT_FAMILY = 'Inter, sans-serif';

// Utilities
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const logError = (scope: string, error: unknown) => {
  console.error(`[${scope}]`, error);
};
const NAV_ITEMS = [
  { view: 'library' as const, icon: Gamepad2, label: 'Library' },
  { view: 'themes' as const, icon: Palette, label: 'Themes' }
];


export default function Home() {
  const { games, previousGameCountRef, loadGamesFromStorage, addGame, updateGame, deleteGame } = useGameLibrary();
  
  const {
    activeView, setActiveView, isSidebarOpen, setIsSidebarOpen, currentTime, setCurrentTime,
    isMounted, setIsMounted, gameSearchQuery, setGameSearchQuery, gameSearchFocused, setGameSearchFocused,
    gameSearchExpanded, setGameSearchExpanded, isDragActive, setIsDragActive, themeAnimationKey, setThemeAnimationKey,
    gameListAnimationKey, setGameListAnimationKey, isDeleteMode, setIsDeleteMode, selectedGameIds, setSelectedGameIds,
    deletingGameIds, setDeletingGameIds, gameSearchInputRef, dragCounterRef,
    toggleGameSearch, toggleGameSelection, exitDeleteMode,
  } = useUIState();

  const {
    duplicateMessage, showDuplicateMessage, editingGame, setEditingGame, pendingGame, setPendingGame,
    pendingFiles, setPendingFiles, systemPickerOpen, setSystemPickerOpen, systemPickerClosing, setSystemPickerClosing,
    systemSearchQuery, setSystemSearchQuery, pendingBatchCore, setPendingBatchCore, coverArtFit, setCoverArtFit,
    showDuplicateError, closeSystemPicker, getSystemFromExtension, extractFilesFromDataTransfer, handleCoverArtFileUpload,
  } = useGameOperations();

  const [selectedTheme, setSelectedTheme, isThemeHydrated] = useLocalStorage('theme', 'default');
  const [sortBy, setSortBy, isSortByHydrated] = useLocalStorage<'title' | 'system'>('sortBy', 'title');
  const [sortOrder, setSortOrder, isSortOrderHydrated] = useLocalStorage<'asc' | 'desc'>('sortOrder', 'asc');
  const [systemSearchFocused, setSystemSearchFocused] = useState(false);
  
  const isHydrated = isThemeHydrated && isSortByHydrated && isSortOrderHydrated;

  const currentColors = THEMES[selectedTheme as keyof typeof THEMES] || THEMES.default;
  const gradientStyle = useMemo(() => getGradientStyle(currentColors.gradientFrom, currentColors.gradientTo), [currentColors.gradientFrom, currentColors.gradientTo]);

  // Reusable UI pieces
  const AddGameButton = useCallback(() => (
    <button
      onClick={handleFileSelect}
      className="px-8 rounded-lg font-semibold transition-all hover:shadow-md active:scale-95 flex items-center gap-2 justify-center"
      style={{ ...gradientStyle, color: currentColors.darkBg, height: '48px' }}
    >
      <Plus className="w-5 h-5" />
      <span>Add Game</span>
    </button>
  ), [gradientStyle, currentColors]);

  useEffect(() => {
    setIsMounted(true);
    loadGamesFromStorage();
    
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    };

    updateTime();
    const interval = setInterval(updateTime, TIME_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [loadGamesFromStorage, setCurrentTime, setIsMounted]);

  // Finalize system selection and game additions (single or batch)
  const handleSystemPickerDone = async () => {
    // If editing, picker closes without adding new games
    if (editingGame) {
      closeSystemPicker();
      return;
    }

    // Batch add
    if (pendingFiles.length > 1) {
      if (!pendingBatchCore) return;
      try {
        let currentGames = games;
        for (const { file, index } of pendingFiles) {
          currentGames = await processGameFile(file, index, pendingBatchCore, currentGames);
        }
        setPendingFiles([]);
        setPendingBatchCore(null);
      } catch (error) {
        logError('Finalize batch game addition', error);
      }
      closeSystemPicker();
      return;
    }

    // Single add
    if (pendingFiles.length === 1 && pendingGame?.core) {
      try {
        const { file } = pendingFiles[0];
        const gameId = pendingGame.id ?? Date.now();
        const fileName = pendingGame.fileName || file.name;
        const derivedTitle = pendingGame.title || file.name.replace(/\.[^/.]+$/, '');
        const genre = pendingGame.genre || getSystemNameByCore(pendingGame.core) || 'Unknown System';

        if (games.some(g => g.fileName === file.name)) {
          showDuplicateError(`"${file.name}" is already in your library`);
          closeSystemPicker();
          return;
        }

        await saveGameFile(gameId, file);

        const newGame: Game = {
          id: gameId,
          title: derivedTitle,
          genre,
          filePath: pendingGame.filePath || file.name,
          fileName,
          core: pendingGame.core,
          coverArt: pendingGame.coverArt,
          coverArtFit: pendingGame.coverArt ? (pendingGame.coverArtFit || coverArtFit) : undefined,
        };

        addGame(newGame);
      } catch (error) {
        logError('Finalize single game addition', error);
      }
    }

    closeSystemPicker();
  };

  // Migrate old games with fileData to IndexedDB
  const migrateGameToIndexedDB = async (game: Game, allGames: Game[]): Promise<Game[]> => {
    if (!game.fileData || !game.fileData.startsWith('data:')) {
      // Already migrated or invalid
      return allGames;
    }

    try {
      // Convert base64 back to File
      const response = await fetch(game.fileData);
      const blob = await response.blob();
      const file = new File([blob], game.fileName || game.title, { type: 'application/octet-stream' });
      await saveGameFile(game.id, file);

      // Remove fileData from game object
      const { fileData, ...gameWithoutData } = game;
      return allGames.map(g => g.id === game.id ? gameWithoutData : g);
    } catch (error) {
      console.error('Error migrating game to IndexedDB:', error);
      return allGames;
    }
  };

  // Drag & drop handlers
  const handleDragEnter = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!event.dataTransfer?.types.includes('Files')) return;
    dragCounterRef.current += 1;
    setIsDragActive(true);
  }, [setIsDragActive, dragCounterRef]);

  const handleDragLeave = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (dragCounterRef.current > 0) {
      dragCounterRef.current -= 1;
    }
    if (dragCounterRef.current === 0) {
      setIsDragActive(false);
    }
  }, [setIsDragActive, dragCounterRef]);

  const handleDragOver = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  const handleDrop = useCallback(async (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragActive(false);
    if (event.dataTransfer) {
      const files = extractFilesFromDataTransfer(event.dataTransfer);
      await handleIncomingFiles(files);
    }
  }, [setIsDragActive, dragCounterRef, extractFilesFromDataTransfer]);

  const processGameFile = async (file: File, index: number, selectedCore?: string, currentGamesList?: Game[]): Promise<Game[]> => {
    const fileName = file.name;
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";

    // Check for duplicates
    const gamesListToCheck = currentGamesList || games;
    const isDuplicate = gamesListToCheck.some(g => g.fileName === fileName || g.filePath === file.name);
    if (isDuplicate) {
      showDuplicateError(`"${fileName}" is already in your library`);
      return gamesListToCheck;
    }

    const detectedCore = selectedCore || getSystemFromExtension(fileExtension);
    const gameId = Date.now() + index;

    await saveGameFile(gameId, file);

    // Get system name for genre display
    const systemName = detectedCore
      ? getSystemNameByCore(detectedCore)
      : 'Unknown System';

    if (detectedCore) {
      const newGame: Game = {
        id: gameId,
        title: nameWithoutExt,
        genre: systemName,
        filePath: file.name,
        fileName: fileName,
        core: detectedCore,
      };
      addGame(newGame);
      return [...gamesListToCheck, newGame];
    }

    return gamesListToCheck;
  };

  const selectSystem = async (core: string) => {
    const systemName = getSystemNameByCore(core);

    // If adding multiple files from file picker
    if (pendingFiles.length > 1) {
      setPendingBatchCore(core);
      return;
    }

    // If adding a single file from file picker without detected system
    if (editingGame) {
      // When editing, update the selection and keep modal open
      updateGame(editingGame.id, { core, genre: systemName });
      setEditingGame({ ...editingGame, core, genre: systemName });
      if (pendingGame) {
        setPendingGame({ ...pendingGame, core, genre: systemName });
      }
      // Don't close the modal - let user close it manually
    } else if (pendingGame) {
      setPendingGame({
        ...pendingGame,
        core: core,
        genre: systemName
      });
    }
  };

  const applyCoverArt = async (coverArt: string | null) => {
    if (!coverArt) return;

    if (editingGame) {
      updateGame(editingGame.id, { coverArt, coverArtFit });
      setEditingGame({ ...editingGame, coverArt, coverArtFit });
      if (pendingGame && pendingGame.id === editingGame.id) {
        setPendingGame({ ...pendingGame, coverArt, coverArtFit });
      }
    } else if (pendingGame) {
      setPendingGame({ ...pendingGame, coverArt, coverArtFit });
    }
  };

  const updateCoverArtFit = (newFit: 'cover' | 'contain') => {
    if (editingGame && (editingGame.coverArt || pendingGame?.coverArt)) {
      updateGame(editingGame.id, { coverArtFit: newFit });
      setEditingGame({ ...editingGame, coverArtFit: newFit });
      if (pendingGame && pendingGame.id === editingGame.id) {
        setPendingGame({ ...pendingGame, coverArtFit: newFit });
      }
    } else if (pendingGame && pendingGame.coverArt) {
      setPendingGame({ ...pendingGame, coverArtFit: newFit });
    }
  };

  const removeCoverArt = () => {
    if (editingGame) {
      updateGame(editingGame.id, { coverArt: undefined });
      const updatedEditingGame = { ...editingGame, coverArt: undefined };
      setEditingGame(updatedEditingGame);
      if (pendingGame && pendingGame.id === editingGame.id) {
        setPendingGame(updatedEditingGame);
      }
    } else if (pendingGame) {
      setPendingGame({ ...pendingGame, coverArt: undefined });
    }
  };

  const handleIncomingFiles = async (files: File[]) => {
    if (!files.length) return;

    // First, process files with detected systems
    const filesNeedingSystem: Array<{ file: File; index: number }> = [];
    let currentGames = games;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
      const detectedCore = getSystemFromExtension(fileExtension);

      if (detectedCore) {
        // Auto-add files with detected systems
        currentGames = await processGameFile(file, i, detectedCore, currentGames);
      } else {
        // Collect files that need system selection
        filesNeedingSystem.push({ file, index: i });
      }
    }

    // Filter out duplicates
    const filteredFilesNeedingSystem = filesNeedingSystem.filter(({ file }) => {
      const fileName = file.name;
      return !currentGames.some(g => g.fileName === fileName || g.filePath === file.name);
    });

    // If there are files without detected systems, show system picker
    if (filteredFilesNeedingSystem.length > 0) {
      setPendingFiles(filteredFilesNeedingSystem);
      // Only set pendingGame if it's a single file (for the UI to show cover art section)
      if (filteredFilesNeedingSystem.length === 1) {
        const fileName = filteredFilesNeedingSystem[0].file.name;
        const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
        setPendingGame({
          id: Date.now(),
          title: nameWithoutExt,
          genre: 'Unknown',
          filePath: fileName,
          fileName: fileName,
        });
        setPendingBatchCore(null);
      } else {
        setPendingGame(null);
        setPendingBatchCore(null);
      }
      setCoverArtFit('cover');
      setSystemPickerOpen(true);
    } else if (filesNeedingSystem.length > 0) {
      if (filesNeedingSystem.length === 1) {
        showDuplicateError(`The file "${filesNeedingSystem[0].file.name}" is already in your library`);
      } else {
        showDuplicateError(`All ${filesNeedingSystem.length} selected files are already in your library`);
      }
    }
  };

  const handleFileSelect = async () => {
    try {
      let files: File[] = [];

      if ('showOpenFilePicker' in window) {
        const fileHandles = await (window as any).showOpenFilePicker({
          multiple: true
        });
        files = await Promise.all(fileHandles.map((fh: any) => fh.getFile()));
      } else {
        // Fallback for browsers without File System Access API
        files = await new Promise<File[]>((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.multiple = true;
          input.onchange = (e: any) => resolve(Array.from(e.target.files || []) as File[]);
          input.click();
        });
      }

      await handleIncomingFiles(files);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        logError('Select files', err);
      }
    }
  };

  const handleEditGame = (game: Game) => {
    setEditingGame(game);
    setPendingGame({ ...game });
    setCoverArtFit(game.coverArtFit || 'cover');
    setSystemPickerOpen(true);
  };

  const handleDeleteGame = async (game: Game) => {
    if (confirm(`Are you sure you want to delete "${game.title}"?`)) {
      try {
        setDeletingGameIds(prev => {
          const next = new Set(prev);
          next.add(game.id);
          return next;
        });

        await delay(400);

        await deleteGame(game.id);
        setGameListAnimationKey(prev => prev + 1);

        setDeletingGameIds(prev => {
          const next = new Set(prev);
          next.delete(game.id);
          return next;
        });
      } catch (error) {
        logError('Delete game', error);
      }
    }
  };

  const handleMassDelete = async () => {
    if (selectedGameIds.size === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedGameIds.size} game(s)? This action cannot be undone.`)) {
      try {
        setDeletingGameIds(new Set(selectedGameIds));
        await delay(400);

        for (const gameId of selectedGameIds) {
          await deleteGame(gameId);
        }

        setGameListAnimationKey(prev => prev + 1);
        setSelectedGameIds(new Set());
        setDeletingGameIds(new Set());
        setIsDeleteMode(false);
      } catch (error) {
        logError('Delete games (batch)', error);
      }
    }
  };

  const handlePlayClick = async (game: Game) => {
    try {
      let file: File | null = null;

      // Try to get file from IndexedDB first
      file = await getGameFile(game.id);

      // Fallback to legacy fileData if IndexedDB doesn't have it
      if (!file && game.fileData) {
        const response = await fetch(game.fileData);
        const blob = await response.blob();
        file = new File([blob], game.fileName || game.title, { type: 'application/octet-stream' });
        // Save to IndexedDB for next time
        await saveGameFile(game.id, file);
      }

      if (file) {
        await loadGame(file, game.core, currentColors.playGreen);
      } else {
        logError('Load game: file not found', game);
      }
    } catch (error) {
      logError('Load game', error);
    }
  };

  const handleNavClick = useCallback((viewName: 'library' | 'themes') => {
    setActiveView(viewName);
    setIsSidebarOpen(false);
  }, [setActiveView, setIsSidebarOpen]);

  const handleThemeChange = (themeName: string) => {
    setSelectedTheme(themeName);
  };

  useEffect(() => {
    if (games.length < previousGameCountRef.current) {
      setGameListAnimationKey((key) => key + 1);
    }
    previousGameCountRef.current = games.length;
  }, [games.length, previousGameCountRef, setGameListAnimationKey]);

  // Get system category for a game based on the core
  const inferSystemCategory = (core?: string): string => {
    if (!core) return 'Other';

    // Check which category the core belongs to
    for (const [category, systems] of Object.entries(SYSTEM_PICKER)) {
      if (Object.values(systems).includes(core)) {
        return category;
      }
    }
    return 'Other';
  };

  // Sort and filter games
  const sortedGames = useMemo(() => {
    let filtered = [...games];
    
    // Filter by search query
    if (gameSearchQuery.trim()) {
      const query = gameSearchQuery.toLowerCase();
      filtered = filtered.filter(game => 
        game.title.toLowerCase().includes(query) || 
        game.genre.toLowerCase().includes(query)
      );
    }
    
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'system') {
        comparison = a.genre.localeCompare(b.genre);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return filtered;
  }, [games, sortBy, sortOrder, gameSearchQuery]);

  useEffect(() => {
    if (activeView === 'themes') {
      setThemeAnimationKey((key) => key + 1);
    }
  }, [activeView, setThemeAnimationKey]);

  // Group games by system category with ordered categories
  const groupedGames = useMemo(() => {
    if (sortBy !== 'system') return null;
    const order = sortOrder === 'desc' ? ['Other', 'Atari', 'Sony', 'Sega', 'Nintendo'] : ['Nintendo', 'Sega', 'Sony', 'Atari', 'Other'];
    const groups = sortedGames.reduce((acc, game) => {
      const cat = inferSystemCategory(game.core);
      (acc[cat] ||= []).push(game);
      return acc;
    }, {} as Record<string, Game[]>);
    return order.reduce((res, cat) => {
      if (groups[cat]?.length) res[cat] = groups[cat];
      return res;
    }, {} as Record<string, Game[]>);
  }, [sortedGames, sortBy, sortOrder]);

  // Render a single game item with consistent animation and handlers
  const renderGameItem = (game: Game, index: number, list: Game[], includeCoverArtClick: boolean) => {
    const isGameDeleting = deletingGameIds.has(game.id);
    const visibleIndex = list.slice(0, index).filter(g => !deletingGameIds.has(g.id)).length;
    const reverseStaggerDelay = (list.length - 1 - index) * 0.03;
    const commonProps = {
      game,
      onPlay: handlePlayClick,
      onEdit: handleEditGame,
      onDelete: handleDeleteGame,
      onSelect: toggleGameSelection,
      isSelected: selectedGameIds.has(game.id),
      isDeleteMode,
      onEnterDeleteMode: () => setIsDeleteMode(true),
      colors: currentColors,
    };
    return (
      <div
        key={`${gameListAnimationKey}-${game.id}`}
        className={isGameDeleting ? undefined : 'animate-fade-in'}
        style={isGameDeleting
          ? { animation: `fadeOut 0.3s ease-in-out ${reverseStaggerDelay}s forwards` }
          : { animationDelay: `${visibleIndex * 0.05}s` }}
      >
        <GameCard
          {...commonProps}
          {...(includeCoverArtClick ? {
            onCoverArtClick: (game: Game) => {
              setEditingGame(game);
              setPendingGame(game);
              setCoverArtFit(game.coverArtFit || 'cover');
              setSystemPickerOpen(true);
            }
          } : {})}
        />
      </div>
    );
  };

  const sidebarClass = isSidebarOpen ? "translate-x-0" : "-translate-x-full";
  const sidebarFullClass = `w-64 p-6 flex flex-col justify-start shadow-xl fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 ease-in-out ${sidebarClass}`;

  const renderContent = () => {
    if (activeView === 'themes') {
      return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: currentColors.softLight }}>
              Select Theme
            </h2>
          </div>
          <div key={themeAnimationKey} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(THEMES).map(([themeName, themeColors], index) => (
              <button
                key={themeName}
                onClick={() => handleThemeChange(themeName)}
                aria-label={themeName}
                className="p-6 rounded-xl transition-all border-2 relative overflow-hidden animate-fade-in"
                style={{
                  backgroundColor: themeColors.midDark,
                  borderColor: selectedTheme === themeName ? themeColors.playGreen : themeColors.highlight + '40',
                  boxShadow: selectedTheme === themeName ? `0 2px 8px ${themeColors.playGreen}30` : '0 2px 4px rgba(0, 0, 0, 0.2)',
                  color: themeColors.softLight,
                  animationDelay: `${index * 0.05}s`
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold capitalize" style={{ color: themeColors.softLight }}>
                    {themeName}
                  </h3>
                  {selectedTheme === themeName && (
                    <CircleCheck className="w-6 h-6" style={{ color: themeColors.playGreen }} />
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-12 rounded-lg" style={{ backgroundColor: themeColors.darkBg }}></div>
                  <div className="flex-1 h-12 rounded-lg" style={{ backgroundColor: themeColors.midDark }}></div>
                  <div className="flex-1 h-12 rounded-lg" style={{ backgroundColor: themeColors.playGreen }}></div>
                  <div className="flex-1 h-12 rounded-lg" style={{ backgroundColor: themeColors.highlight }}></div>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4" style={{ color: currentColors.softLight }}>
          Games ({sortedGames.length})
        </h2>
        {games.length > 0 && (
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="flex flex-wrap gap-3 items-center flex-1 min-w-0">
                <div
                  className="flex items-center rounded-xl border-2 transition-all"
                  style={{
                    backgroundColor: currentColors.darkBg,
                    borderColor: gameSearchFocused ? currentColors.highlight : currentColors.midDark,
                    boxShadow: gameSearchFocused ? `0 0 0 2px ${currentColors.highlight}30` : 'none',
                    width: '340px',
                    height: '48px',
                  }}
                >
                  <div className="w-12 h-full flex items-center justify-center flex-shrink-0" style={{ color: currentColors.softLight }}>
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    ref={gameSearchInputRef}
                    type="text"
                    placeholder="Search games..."
                    value={gameSearchQuery}
                    onChange={(e) => setGameSearchQuery(e.target.value)}
                    onFocus={() => setGameSearchFocused(true)}
                    onBlur={() => setGameSearchFocused(false)}
                    className="bg-transparent h-full flex-1 focus:outline-none text-sm pr-4"
                    style={{
                      color: currentColors.softLight,
                    }}
                  />
                </div>
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border-2"
                  style={{ backgroundColor: currentColors.darkBg, borderColor: currentColors.midDark, height: '48px' }}
                >
                  <label className="text-sm font-medium" style={{ color: currentColors.softLight }}>Sort by:</label>
                  <div className="flex gap-1">
                    {(['title', 'system'] as const).map((option) => (
                      <button
                        key={option}
                        onClick={() => setSortBy(option)}
                        className="px-3 py-1 rounded-lg text-sm font-medium transition-all active:scale-95 h-9"
                        style={{
                          backgroundColor: sortBy === option ? currentColors.highlight : currentColors.midDark,
                          color: sortBy === option ? currentColors.darkBg : currentColors.softLight,
                        }}
                      >
                        {option === 'title' ? 'Title' : 'System'}
                      </button>
                    ))}
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-1 rounded-lg text-sm font-medium transition-all active:scale-95 flex items-center justify-center h-9"
                      style={{
                        backgroundColor: currentColors.midDark,
                        color: currentColors.softLight,
                      }}
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 justify-end items-center">
                {isDeleteMode ? (
                  <>
                    <button
                      onClick={handleMassDelete}
                      disabled={selectedGameIds.size === 0}
                      className="px-5 py-2.5 rounded-lg transition-all active:scale-95 flex items-center justify-center"
                      style={{
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        opacity: selectedGameIds.size === 0 ? 0.6 : 1,
                        height: '48px'
                      }}
                      title={selectedGameIds.size === 0 ? 'Select games to delete' : `Delete ${selectedGameIds.size} selected game${selectedGameIds.size === 1 ? '' : 's'}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={exitDeleteMode}
                      className="px-5 py-2.5 rounded-lg font-semibold transition-all active:scale-95 flex items-center justify-center"
                      style={{ backgroundColor: currentColors.highlight, color: currentColors.darkBg, height: '48px' }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <AddGameButton />
                )}
              </div>
            </div>
          </div>
        )}
        {games.length === 0 ? (
          <div className="py-12 text-center space-y-4">
            <div key={`empty-state-${isDragActive ? 'drag' : 'idle'}`} className="animate-fade-in space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: currentColors.softLight }}>
                  {isDragActive ? 'Drop to add game' : 'No games yet'}
                </h3>
                <p className="text-sm" style={{ color: currentColors.highlight }}>
                  {isDragActive ? 'Release anywhere in this area to import ROMs.' : 'Drag ROMs into this area or use the button below.'}
                </p>
              </div>
            </div>
            <div className="mx-auto">
              <AddGameButton />
            </div>
          </div>
        ) : (
          <>
            {sortBy === 'system' && groupedGames && (
              <div key={`system-groups-${gameListAnimationKey}`}>
                {Object.entries(groupedGames).map(([category, categoryGames]) => (
                  <div key={category} className="mb-8 last:mb-0">
                    <div className="flex items-center mb-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider pr-3" style={{ color: currentColors.highlight }}>
                        {category}
                      </h4>
                      <div className="flex-1 h-px" style={{ backgroundColor: currentColors.highlight + '30' }}></div>
                    </div>
                    <div className="flex flex-wrap" style={{ gap: '1rem' }}>
                      {categoryGames.map((game, index) => renderGameItem(game, index, categoryGames, false))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {(!sortBy || sortBy !== 'system') && (
              <div key={`flat-list-${gameListAnimationKey}`} className="flex flex-wrap" style={{ gap: '1rem' }}>
                {sortedGames.map((game, index) => renderGameItem(game, index, sortedGames, true))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <>
      {!isMounted || !isHydrated ? (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a0a0f', fontFamily: FONT_FAMILY }} />
      ) : (
        <div
          className="min-h-screen flex flex-col"
          style={{ backgroundColor: currentColors.darkBg, fontFamily: FONT_FAMILY }}
        >
          {isHydrated && (
            <div
              className={`fixed inset-0 z-40 transition-all duration-300 ${isSidebarOpen ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none pointer-events-none'
                }`}
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          <aside className={sidebarFullClass} style={{ backgroundColor: currentColors.midDark, boxShadow: '4px 0 12px rgba(0, 0, 0, 0.3)' }}>
            <div className="flex items-center gap-3 mb-12 animate-fade-in pb-6 border-b" style={{ borderColor: currentColors.highlight + '30' }}>
              <img src="/favicon.ico" alt="Joe T Emulator" className="w-12 h-12 flex-shrink-0" />
              <h2 className="text-2xl font-extrabold leading-tight" style={{
                backgroundImage: `linear-gradient(135deg, ${currentColors.softLight} 0%, ${currentColors.highlight} 100%)`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '100% 100%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                fontFamily: FONT_FAMILY,
                letterSpacing: '-0.02em'
              }}>
                Joe T Emulator
              </h2>
            </div>
            <nav>
              {NAV_ITEMS.map(({ view, icon: Icon, label }, index) => (
                <button
                  key={view}
                  className={"sidebar-item block p-3 mb-2 rounded-lg transition-all flex items-center hover:translate-x-1 hover:bg-opacity-50"}
                  style={{
                    backgroundColor: activeView === view ? currentColors.sidebarHover : 'transparent',
                    borderLeftColor: activeView === view ? currentColors.highlight : 'transparent',
                    borderLeftWidth: activeView === view ? '4px' : '0px',
                    color: currentColors.softLight,
                    transition: 'all 0.2s ease',
                    animation: `fadeInSlide 0.3s ease-out ${index * 0.1}s both`
                  }}
                  onClick={() => handleNavClick(view)}
                >
                  <Icon className="w-6 h-6 mr-3 transition-transform" />
                  <span className="font-semibold">{label}</span>
                </button>
              ))}
            </nav>
          </aside>
          <div className="flex-1 overflow-hidden">
            <main
              className="p-8 overflow-y-auto pb-20 scrollbar-hide"
              style={{ minHeight: 'calc(100vh - 4rem)' }}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <header className="mb-10">
                <div className="flex justify-between items-center">
                  <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: currentColors.softLight, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
                  </h1>
                  <div className="flex items-center space-x-4">
                    {isMounted && (
                      <div className="hidden sm:block text-sm font-medium px-3 py-1.5 rounded-lg transition-all" style={{ color: currentColors.softLight, backgroundColor: currentColors.midDark }}>
                        {currentTime}
                      </div>
                    )}
                  </div>
                </div>
              </header>
              {renderContent()}
            </main>
          </div>
          {duplicateMessage && (
            <div
              className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-2xl z-60 p-4 transition-opacity duration-300 ${showDuplicateMessage ? 'animate-fade-in' : 'animate-fade-out'}`}
              onClick={() => {}}
              style={{
                backgroundColor: '#ef4444',
                color: currentColors.softLight,
                opacity: showDuplicateMessage ? 1 : 0,
                transition: 'opacity 0.3s ease-out',
                pointerEvents: showDuplicateMessage ? 'auto' : 'none'
              }}
            >
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                <span className="font-semibold">{duplicateMessage}</span>
              </div>
            </div>
          )}
          <footer className="fixed bottom-0 left-0 right-0 h-16 border-t flex items-center justify-between px-6 z-50" style={{ backgroundColor: currentColors.midDark, borderColor: currentColors.sidebarHover, boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.3)' }}>
            <button
              className="p-2.5 rounded-lg transition-all hover:bg-opacity-50 active:scale-95"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{ color: currentColors.softLight, backgroundColor: isSidebarOpen ? currentColors.sidebarHover : 'transparent' }}
            >
              {isSidebarOpen ? <X className="w-7 h-7 transition-transform rotate-0" /> : <Menu className="w-7 h-7 transition-transform" />}
            </button>
            <div className="flex-1 mx-4" />
          </footer>
          {(systemPickerOpen || systemPickerClosing) && (() => {
            // SYSTEM_PICKER is already organized by category
            const filteredCategories: Record<string, Array<[string, string]>> = {};

            Object.entries(SYSTEM_PICKER).forEach(([category, systems]) => {
              const filtered = Object.entries(systems).filter(([name]) =>
                name.toLowerCase().includes(systemSearchQuery.toLowerCase())
              );
              if (filtered.length > 0) {
                filteredCategories[category] = filtered;
              }
            });

            const currentCore = editingGame?.core || pendingGame?.core || pendingBatchCore || null;

            return (
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4"
                onClick={() => closeSystemPicker()}
                style={{ animation: systemPickerClosing ? 'fadeOut 0.2s ease-out' : 'fadeIn 0.2s ease-out' }}
              >
                <div
                  className="p-6 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border"
                  style={{
                    backgroundColor: currentColors.darkBg,
                    borderColor: currentColors.midDark,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
                    animation: systemPickerClosing ? 'slideDown 0.2s ease-out' : 'slideUp 0.3s ease-out'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="mb-6">
                    <h3 className="text-3xl font-bold mb-2" style={{ color: currentColors.softLight }}>
                      {editingGame ? editingGame.title : pendingFiles.length > 1 ? `Add ${pendingFiles.length} Games` : 'Select System'}
                    </h3>
                    {editingGame && (
                      <p className="text-sm opacity-70" style={{ color: currentColors.highlight }}>
                        Choose a system and cover art
                      </p>
                    )}
                    {pendingFiles.length > 1 && (
                      <p className="text-sm opacity-70" style={{ color: currentColors.highlight }}>
                        Choose a system for {pendingFiles.length} files
                      </p>
                    )}
                  </div>

                  {/* Main Content: Cover Art + Systems */}
                  <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
                    {/* Cover Art Section - only show when editing or adding single game (not multi-file batch) */}
                    {pendingFiles.length <= 1 && (
                      <div className="flex-shrink-0 w-full xl:w-80 space-y-4 max-h-[60vh] xl:max-h-full overflow-y-auto">
                        <div className="rounded-xl border overflow-hidden" style={{ borderColor: currentColors.midDark, backgroundColor: currentColors.darkBg }}>
                          {(editingGame?.coverArt || pendingGame?.coverArt) ? (
                            <div className="relative group">
                              <div className="aspect-[4/5] w-full overflow-hidden bg-black/20 relative">
                                <img
                                  src={editingGame?.coverArt || pendingGame?.coverArt}
                                  alt="Cover art"
                                  className="w-full h-full"
                                  style={{
                                    objectFit: coverArtFit,
                                    objectPosition: 'center'
                                  }}
                                />
                              </div>
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={removeCoverArt}
                                  className="px-3 py-2.5 rounded-lg transition-all hover:shadow-md active:scale-95 flex items-center justify-center"
                                  style={{ backgroundColor: '#ef4444', color: currentColors.softLight }}
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-[3/4] w-full flex items-center justify-center bg-gradient-to-br" style={{ background: `linear-gradient(135deg, ${currentColors.darkBg} 0%, ${currentColors.midDark} 100%)` }}>
                              <div className="text-center p-6">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center" style={{ backgroundColor: currentColors.highlight + '20' }}>
                                  <Image className="w-8 h-8" style={{ color: currentColors.highlight }} />
                                </div>
                                <p className="text-sm font-medium" style={{ color: currentColors.softLight }}>
                                  No Cover Art
                                </p>
                              </div>
                            </div>
                          )}
                          {(editingGame?.coverArt || pendingGame?.coverArt) && (
                            <div className="p-4 border-t" style={{ borderColor: currentColors.highlight + '30' }}>
                              <button
                                onClick={() => {
                                  const newFit = coverArtFit === 'contain' ? 'cover' : 'contain';
                                  setCoverArtFit(newFit);
                                  updateCoverArtFit(newFit);
                                }}
                                className="w-full px-4 py-2.5 rounded-lg transition-all text-sm font-semibold text-center active:scale-95"
                                style={{
                                  backgroundColor: currentColors.highlight,
                                  color: currentColors.darkBg,
                                }}
                              >
                                {coverArtFit === 'contain' ? 'Zoom to Fill' : 'Shrink to Fit'}
                              </button>
                            </div>
                          )}
                          <div className="p-4 border-t" style={{ borderColor: currentColors.highlight + '30' }}>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleCoverArtFileUpload(file);
                                }
                              }}
                              className="hidden"
                              id="cover-art-file-input"
                            />
                            <label
                              htmlFor="cover-art-file-input"
                              className="block w-full px-4 py-2.5 rounded-lg transition-all text-sm font-semibold text-center active:scale-95"
                              style={{
                                ...((editingGame?.coverArt || pendingGame?.coverArt) ? { backgroundColor: currentColors.highlight } : getGradientStyle(currentColors.gradientFrom, currentColors.gradientTo)),
                                color: currentColors.darkBg,
                              }}
                            >
                              {(editingGame?.coverArt || pendingGame?.coverArt) ? 'Change Image' : 'Upload Cover Art'}
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Systems Section */}
                    <div className={`${pendingFiles.length > 1 ? 'w-full' : 'flex-1'} flex flex-col min-w-0`}>
                      <div
                        className="w-full flex items-center rounded-xl border-2 transition-all mb-4"
                        style={{
                          backgroundColor: currentColors.darkBg,
                          borderColor: systemSearchFocused ? currentColors.highlight : currentColors.midDark,
                          boxShadow: systemSearchFocused ? `0 0 0 2px ${currentColors.highlight}30` : 'none',
                        }}
                      >
                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ color: currentColors.softLight }}>
                          <Search className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search systems..."
                          value={systemSearchQuery}
                          onChange={(e) => setSystemSearchQuery(e.target.value)}
                          onFocus={() => setSystemSearchFocused(true)}
                          onBlur={() => setSystemSearchFocused(false)}
                          className="bg-transparent h-10 flex-1 focus:outline-none text-sm pr-4"
                          style={{
                            color: currentColors.softLight,
                          }}
                          autoFocus
                        />
                      </div>

                      <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                        {Object.entries(filteredCategories).map(([category, systems]) => (
                          <div key={category} className="mb-6 last:mb-0">
                            <div className="flex items-center mb-3">
                              <h4 className="text-xs font-bold uppercase tracking-wider pr-3" style={{ color: currentColors.highlight }}>
                                {category}
                              </h4>
                              <div className="flex-1 h-px" style={{ backgroundColor: currentColors.highlight + '30' }}></div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                              {systems.map(([name, core], index) => {
                                const isSelected = currentCore === core;
                                return (
                                  <button
                                    key={core}
                                    className="p-3.5 rounded-xl text-left transition-all active:scale-95 border-2 relative flex items-center justify-between group"
                                    style={{
                                      backgroundColor: isSelected ? currentColors.highlight : currentColors.midDark,
                                      borderColor: isSelected ? currentColors.highlight : currentColors.midDark,
                                      color: isSelected ? currentColors.darkBg : currentColors.softLight,
                                      animation: `fadeIn 0.4s ease-out ${index * 0.03}s both`
                                    }}
                                    onClick={() => selectSystem(core)}
                                  >
                                    <span className="font-medium text-sm leading-tight truncate pr-2 flex-1">
                                      {name}
                                    </span>
                                    {isSelected && (
                                      <CircleCheck className="w-5 h-5 flex-shrink-0" style={{ color: currentColors.darkBg }} />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                        {Object.keys(filteredCategories).length === 0 && (
                          <div className="text-center py-16" style={{ color: currentColors.highlight }}>
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: currentColors.highlight + '15' }}>
                              <Search className="w-8 h-8" />
                            </div>
                            <p className="text-lg font-semibold mb-1" style={{ color: currentColors.softLight }}>No systems found</p>
                            <p className="text-sm opacity-70">Try a different search term</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: currentColors.midDark }}>
                    {(editingGame || pendingFiles.length > 0) && (
                      <button
                        className="py-2.5 px-6 rounded-lg font-semibold transition-all active:scale-95"
                        style={{ ...gradientStyle, color: currentColors.darkBg }}
                        onClick={handleSystemPickerDone}
                      >
                        Done
                      </button>
                    )}
                    <button
                      className="py-2.5 px-6 rounded-lg font-semibold transition-all active:scale-95"
                      style={{ backgroundColor: currentColors.highlight, color: currentColors.darkBg }}
                      onClick={() => closeSystemPicker()}
                    >
                      {editingGame ? 'Cancel' : 'Close'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </>
  );
}