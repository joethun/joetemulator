"use client";

import { useEffect, useMemo, useState, useCallback, memo, useRef } from 'react';
import type { DragEvent } from 'react';
import { loadGame } from '@/lib/emulator';
import { saveGameFile, getGameFile } from '@/lib/storage';
import { SYSTEM_PICKER, getSystemNameByCore, getSystemCategory } from '@/lib/constants';
import { Game, THEMES, getGradientStyle } from '@/types';
import { GameCard } from '@/components/GameCardComponent';
import { Gamepad2, Palette, Menu, X, Trash2, ArrowUp, ArrowDown, Search, Plus, CircleCheck, Image, XCircle, ListFilter, Loader2 } from 'lucide-react';
import { useGameLibrary } from '@/hooks/useGameLibrary';
import { useUIState } from '@/hooks/useUIState';
import { useGameOperations } from '@/hooks/useGameOperations';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// --- Constants & Pure Functions ---
const TIME_UPDATE_INTERVAL = 60000;
const FONT_FAMILY = 'Inter, sans-serif';
const GRID_CLASS = "grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-6 justify-items-center";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const logError = (scope: string, error: unknown) => console.error(`[${scope}]`, error);

const NAV_ITEMS = [
  { view: 'library' as const, icon: Gamepad2, label: 'Library' },
  { view: 'themes' as const, icon: Palette, label: 'Themes' }
];

export default function Home() {
  // --- State Hooks ---
  const { games, previousGameCountRef, loadGamesFromStorage, addGame, updateGame, deleteGame } = useGameLibrary();

  const uiState = useUIState();
  const {
    activeView, setActiveView, isSidebarOpen, setIsSidebarOpen, currentTime, setCurrentTime,
    isMounted, setIsMounted, gameSearchQuery, setGameSearchQuery, gameSearchFocused, setGameSearchFocused,
    isDragActive, setIsDragActive, themeAnimationKey, setThemeAnimationKey,
    gameListAnimationKey, setGameListAnimationKey, isDeleteMode, setIsDeleteMode, selectedGameIds, setSelectedGameIds,
    deletingGameIds, setDeletingGameIds, gameSearchInputRef, dragCounterRef,
    toggleGameSelection, exitDeleteMode
  } = uiState;

  const ops = useGameOperations();
  const {
    duplicateMessage, showDuplicateMessage, editingGame, setEditingGame, pendingGame, setPendingGame,
    pendingFiles, setPendingFiles, systemPickerOpen, setSystemPickerOpen, systemPickerClosing,
    systemSearchQuery, setSystemSearchQuery, pendingBatchCore, setPendingBatchCore, coverArtFit, setCoverArtFit,
    showDuplicateError, closeSystemPicker, getSystemFromExtension, extractFilesFromDataTransfer
  } = ops;

  const [selectedTheme, setSelectedTheme, isThemeHydrated] = useLocalStorage('theme', 'default');
  const [sortBy, setSortBy, isSortByHydrated] = useLocalStorage<'title' | 'system'>('sortBy', 'title');
  const [sortOrder, setSortOrder, isSortOrderHydrated] = useLocalStorage<'asc' | 'desc'>('sortOrder', 'asc');

  const [isProcessing, setIsProcessing] = useState(false);

  // --- Derived State ---
  const isHydrated = isThemeHydrated && isSortByHydrated && isSortOrderHydrated;
  const currentColors = THEMES[selectedTheme as keyof typeof THEMES] || THEMES.default;
  const gradientStyle = useMemo(() => getGradientStyle(currentColors.gradientFrom, currentColors.gradientTo), [currentColors]);

  // --- Effects ---
  useEffect(() => {
    setIsMounted(true);
    loadGamesFromStorage();
    const updateTime = () => setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    updateTime();
    const interval = setInterval(updateTime, TIME_UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [loadGamesFromStorage, setCurrentTime, setIsMounted]);

  useEffect(() => {
    if (games.length < previousGameCountRef.current) setGameListAnimationKey((key) => key + 1);
    previousGameCountRef.current = games.length;
  }, [games.length, previousGameCountRef, setGameListAnimationKey]);

  useEffect(() => {
    if (activeView === 'themes') setThemeAnimationKey((key) => key + 1);
  }, [activeView, setThemeAnimationKey]);

  // --- Core Logic Functions ---

  const processGameFile = async (file: File, index: number, selectedCore?: string, currentGamesList?: Game[]): Promise<Game[]> => {
    const fileName = file.name;
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";

    const gamesListToCheck = currentGamesList || games;
    if (gamesListToCheck.some(g => g.fileName === fileName || g.filePath === file.name)) {
      showDuplicateError(`"${fileName}" is already in your library`);
      return gamesListToCheck;
    }

    const detectedCore = selectedCore || getSystemFromExtension(fileExtension);
    const gameId = Date.now() + index;

    await saveGameFile(gameId, file);
    const systemName = detectedCore ? getSystemNameByCore(detectedCore) : 'Unknown System';

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

  const handleSystemPickerDone = async () => {
    if (editingGame) { closeSystemPicker(); return; }
    if (isProcessing) return;

    const effectiveCore = pendingFiles.length > 1 ? pendingBatchCore : pendingGame?.core;

    if (!effectiveCore) {
      showDuplicateError("Please select a system to continue");
      return;
    }

    setIsProcessing(true);
    try {
      if (pendingFiles.length > 1) {
        try {
          let currentGames = games;
          for (const { file, index } of pendingFiles) {
            currentGames = await processGameFile(file, index, effectiveCore!, currentGames);
          }
          setPendingFiles([]);
          setPendingBatchCore(null);
        } catch (error) { logError('Finalize batch', error); }
        closeSystemPicker();
        return;
      }

      if (pendingFiles.length === 1) {
        try {
          const { file } = pendingFiles[0];
          const gameId = pendingGame?.id ?? Date.now();
          const fileName = pendingGame?.fileName || file.name;

          if (games.some(g => g.fileName === file.name)) {
            showDuplicateError(`"${file.name}" is already in your library`);
            closeSystemPicker();
            return;
          }

          await saveGameFile(gameId, file);
          addGame({
            id: gameId,
            title: pendingGame?.title || file.name.replace(/\.[^/.]+$/, ''),
            genre: pendingGame?.genre || getSystemNameByCore(effectiveCore) || 'Unknown',
            filePath: pendingGame?.filePath || file.name,
            fileName,
            core: effectiveCore,
            coverArt: pendingGame?.coverArt,
            coverArtFit: pendingGame?.coverArt ? (pendingGame.coverArtFit || coverArtFit) : undefined,
          });
        } catch (error) { logError('Finalize single', error); }
      }
      closeSystemPicker();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIncomingFiles = async (files: File[]) => {
    if (!files.length) return;
    const filesNeedingSystem: Array<{ file: File; index: number }> = [];
    let currentGames = games;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const detectedCore = getSystemFromExtension(file.name.split(".").pop()?.toLowerCase() || "");

      if (detectedCore) {
        currentGames = await processGameFile(file, i, detectedCore, currentGames);
      } else {
        filesNeedingSystem.push({ file, index: i });
      }
    }

    const filteredNeeding = filesNeedingSystem.filter(({ file }) =>
      !currentGames.some(g => g.fileName === file.name || g.filePath === file.name)
    );

    if (filteredNeeding.length > 0) {
      setPendingFiles(filteredNeeding);
      if (filteredNeeding.length === 1) {
        const fname = filteredNeeding[0].file.name;
        setPendingGame({ id: Date.now(), title: fname.replace(/\.[^/.]+$/, ''), genre: 'Unknown', filePath: fname, fileName: fname });
      } else {
        setPendingGame(null);
      }
      setPendingBatchCore(null);
      setCoverArtFit('cover');
      setSystemPickerOpen(true);
    } else if (filesNeedingSystem.length > 0) {
      showDuplicateError(filesNeedingSystem.length === 1 ? `File already in library` : `All selected files are duplicates`);
    }
  };

  const handleDrag = useCallback((e: DragEvent<HTMLElement>, active: boolean) => {
    e.preventDefault(); e.stopPropagation();
    if (active) {
      if (e.dataTransfer?.types.includes('Files')) {
        dragCounterRef.current += 1;
        setIsDragActive(true);
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      }
    } else {
      if (dragCounterRef.current > 0) dragCounterRef.current -= 1;
      if (dragCounterRef.current === 0) setIsDragActive(false);
    }
  }, [setIsDragActive, dragCounterRef]);

  const handleDrop = useCallback(async (e: DragEvent<HTMLElement>) => {
    e.preventDefault(); e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragActive(false);
    if (e.dataTransfer) await handleIncomingFiles(extractFilesFromDataTransfer(e.dataTransfer));
  }, [setIsDragActive, dragCounterRef, extractFilesFromDataTransfer]);

  const handleFileSelect = async () => {
    try {
      let files: File[] = [];
      if ('showOpenFilePicker' in window) {
        const handles = await (window as any).showOpenFilePicker({ multiple: true });
        files = await Promise.all(handles.map((fh: any) => fh.getFile()));
      } else {
        files = await new Promise<File[]>((resolve) => {
          const input = document.createElement('input');
          input.type = 'file'; input.multiple = true;
          input.onchange = (e: any) => resolve(Array.from(e.target.files || []) as File[]);
          input.click();
        });
      }
      await handleIncomingFiles(files);
    } catch (err: any) {
      if (err?.name !== 'AbortError') logError('Select files', err);
    }
  };


  const handlePlayClick = async (game: Game) => {
    try {
      let file = await getGameFile(game.id);
      if (!file && game.fileData) {
        const res = await fetch(game.fileData);
        file = new File([await res.blob()], game.fileName || game.title, { type: 'application/octet-stream' });
        await saveGameFile(game.id, file);
      }
      // *** FIX: Pass 'selectedTheme' (the string name), NOT 'currentColors.highlight' ***
      if (file) await loadGame(file, game.core, selectedTheme);
      else logError('Load game: file not found', game);
    } catch (error) { logError('Load game', error); }
  };

  const handleDeleteGame = async (game: Game) => {
    if (confirm(`Delete "${game.title}"?`)) {
      // 1. Trigger fade-out animation class
      setDeletingGameIds(prev => new Set(prev).add(game.id));
      
      // 2. Wait 350ms for the opacity to hit 0
      await delay(350); 
      
      // 3. Remove the game from data
      await deleteGame(game.id);
      
      // 4. Cleanup state
      setDeletingGameIds(prev => { const n = new Set(prev); n.delete(game.id); return n; });
    }
  };

  const handleMassDelete = async () => {
    if (!selectedGameIds.size || !confirm(`Delete ${selectedGameIds.size} games?`)) return;

    setDeletingGameIds(new Set(selectedGameIds));
    await delay(350); // Wait for animation

    for (const id of selectedGameIds) await deleteGame(id);

    // setGameListAnimationKey(p => p + 1); // <--- REMOVE THIS
    setSelectedGameIds(new Set());
    setDeletingGameIds(new Set());
    setIsDeleteMode(false);
  };


  // --- Memoized Lists ---
  const sortedGames = useMemo(() => {
    let filtered = [...games];
    if (gameSearchQuery.trim()) {
      const q = gameSearchQuery.toLowerCase();
      filtered = filtered.filter(g => g.title.toLowerCase().includes(q) || g.genre.toLowerCase().includes(q));
    }
    filtered.sort((a, b) => {
      const cmp = sortBy === 'title' ? a.title.localeCompare(b.title) : a.genre.localeCompare(b.genre);
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return filtered;
  }, [games, sortBy, sortOrder, gameSearchQuery]);

  const groupedGames = useMemo(() => {
    if (sortBy !== 'system') return null;
    const order = sortOrder === 'desc' ? ['Other', 'Atari', 'Sony', 'Sega', 'Nintendo'] : ['Nintendo', 'Sega', 'Sony', 'Atari', 'Other'];
    const groups = sortedGames.reduce((acc, g) => {
      const cat = getSystemCategory(g.core);
      (acc[cat] ||= []).push(g);
      return acc;
    }, {} as Record<string, Game[]>);
    return order.reduce((res, cat) => { if (groups[cat]?.length) res[cat] = groups[cat]; return res; }, {} as Record<string, Game[]>);
  }, [sortedGames, sortBy, sortOrder]);

  // --- Sub-Component Renderers (Helpers) ---

  const renderGameList = () => {
    const commonProps = {
      onPlay: handlePlayClick,
      onDelete: handleDeleteGame,
      onSelect: toggleGameSelection,
      isDeleteMode,
      onEnterDeleteMode: () => setIsDeleteMode(true),
      colors: currentColors,
      deletingGameIds: deletingGameIds,
      onEdit: (g: Game) => {
        setEditingGame(g); setPendingGame({ ...g });
        setCoverArtFit(g.coverArtFit || 'cover'); setSystemPickerOpen(true);
      }
    };

    // ... (Keep your empty state check here) ...

    const mapGame = (game: Game, idx: number) => {
      const isDeleting = deletingGameIds.has(game.id);
      
      // Original stagger calculation: 0.05s per item
      // We cap it at 1s so very large lists don't take forever
      const delayTime = idx * 0.05;

      return (
        <div
          // CRITICAL: Use game.id. This prevents the "choppy" list rebuild.
          key={game.id} 
          
          // USE ORIGINAL CLASSES:
          className={isDeleting ? 'animate-fade-out' : 'animate-fade-in'}
          
          style={{ 
            // Stagger the entry, but make exit instant (the animation handles the timing)
            animationDelay: isDeleting ? '0s' : `${delayTime}s`
          }}
        >
          <GameCard
            game={game} 
            isSelected={selectedGameIds.has(game.id)}
            {...commonProps}
            onCoverArtClick={commonProps.onEdit}
          />
        </div>
      );
    };

    // Render logic
    if (sortBy === 'system' && groupedGames) {
      return Object.entries(groupedGames).map(([cat, catGames]) => (
        <div key={cat} className="mb-8 last:mb-0 animate-fade-in">
          <div className="flex items-center mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider pr-3" style={{ color: currentColors.highlight }}>{cat}</h4>
            <div className="flex-1 h-px" style={{ backgroundColor: currentColors.highlight + '30' }} />
          </div>
          <div className={GRID_CLASS}>{catGames.map((g, i) => mapGame(g, i))}</div>
        </div>
      ));
    }

    return <div className={GRID_CLASS}>{sortedGames.map((g, i) => mapGame(g, i))}</div>;
  };

  if (!isMounted || !isHydrated) return <div className="min-h-screen" style={{ backgroundColor: '#0a0a0f', fontFamily: FONT_FAMILY }} />;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: currentColors.darkBg, fontFamily: FONT_FAMILY }}>
      {isHydrated && (
        <div
          className={`fixed inset-0 z-40 transition-all duration-300 ${isSidebarOpen ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none pointer-events-none'}`}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen} activeView={activeView} colors={currentColors}
        onNavClick={(v: any) => { setActiveView(v); setIsSidebarOpen(false); }}
      />

      <div className="flex-1 overflow-hidden">
        <main
          className="p-8 overflow-y-auto pb-20 scrollbar-hide"
          style={{ minHeight: 'calc(100vh - 4rem)' }}
          onDragEnter={(e) => handleDrag(e, true)}
          onDragOver={(e) => e.dataTransfer && (e.dataTransfer.dropEffect = 'copy')}
          onDragLeave={(e) => handleDrag(e, false)}
          onDrop={handleDrop}
        >
          {/* Header */}
          <header className="mb-10 flex justify-between items-center">
            <h1 className="text-4xl font-extrabold tracking-tight capitalize" style={{ color: currentColors.softLight, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
              {activeView}
            </h1>
            <div className="hidden sm:block text-sm font-medium px-3 py-1.5 rounded-lg" style={{ color: currentColors.softLight, backgroundColor: currentColors.midDark }}>
              {currentTime}
            </div>
          </header>

          {/* Main Content Switch */}
          {activeView === 'themes' ? (
            <ThemeGrid colors={currentColors} selectedTheme={selectedTheme} onSelectTheme={setSelectedTheme} animKey={themeAnimationKey} />
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4" style={{ color: currentColors.softLight }}>Games ({sortedGames.length})</h2>
              {games.length > 0 && (
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                    <div className="flex flex-wrap gap-3 items-center flex-1 min-w-0">
                      <div className="flex items-center rounded-xl border-2 transition-all w-[340px] h-12"
                        style={{ backgroundColor: currentColors.darkBg, borderColor: gameSearchFocused ? currentColors.highlight : currentColors.midDark, boxShadow: gameSearchFocused ? `0 0 0 2px ${currentColors.highlight}30` : 'none' }}>
                        <div className="w-12 h-full flex items-center justify-center" style={{ color: currentColors.softLight }}><Search className="w-4 h-4" /></div>
                        <input ref={gameSearchInputRef} type="text" placeholder="Search games..." value={gameSearchQuery}
                          onChange={(e) => setGameSearchQuery(e.target.value)} onFocus={() => setGameSearchFocused(true)} onBlur={() => setGameSearchFocused(false)}
                          className="bg-transparent h-full flex-1 focus:outline-none text-sm pr-4" style={{ color: currentColors.softLight }} />
                      </div>
                      <SortControls colors={currentColors} sortBy={sortBy} setSortBy={setSortBy} sortOrder={sortOrder} setSortOrder={setSortOrder} />
                    </div>
                    <div className="flex flex-wrap gap-3 justify-end items-center">
                      {isDeleteMode ? (
                        <>
                          <button onClick={handleMassDelete} disabled={!selectedGameIds.size} className="px-5 py-2.5 rounded-lg h-12 flex items-center justify-center text-white bg-red-500 transition-all active:scale-95 disabled:opacity-60">
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <button onClick={exitDeleteMode} className="px-5 py-2.5 rounded-lg font-semibold h-12 transition-all active:scale-95" style={{ backgroundColor: currentColors.highlight, color: currentColors.darkBg }}>Cancel</button>
                        </>
                      ) : (
                        <AddGameButton onClick={handleFileSelect} colors={currentColors} gradient={gradientStyle} />
                      )}
                    </div>
                  </div>
                </div>
              )}
              {renderGameList()}
            </>
          )}
        </main>
      </div>

      {/* Global UI Elements */}
      {duplicateMessage && (
        <div
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-4 rounded-lg shadow-2xl z-60 bg-red-500 text-white flex items-center gap-2 transition-opacity duration-300 ${showDuplicateMessage ? 'animate-fade-in' : 'animate-fade-out'}`}
          style={{ pointerEvents: showDuplicateMessage ? 'auto' : 'none' }}
        >
          <XCircle className="w-5 h-5" /> <span className="font-semibold">{duplicateMessage}</span>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 right-0 h-16 border-t flex items-center px-6 z-50" style={{ backgroundColor: currentColors.midDark, borderColor: currentColors.sidebarHover, boxShadow: '0 -4px 12px rgba(0,0,0,0.3)' }}>
        <button className="p-2.5 rounded-lg transition-all hover:bg-opacity-50" onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ color: currentColors.softLight, backgroundColor: isSidebarOpen ? currentColors.sidebarHover : 'transparent' }}>
          {isSidebarOpen ? <X className="w-7 h-7 transition-transform rotate-0" /> : <Menu className="w-7 h-7 transition-transform" />}
        </button>
      </footer>

      {(systemPickerOpen || systemPickerClosing) && (
        <SystemPickerModal
          isOpen={systemPickerOpen} isClosing={systemPickerClosing} colors={currentColors} gradient={gradientStyle}
          editingGame={editingGame} pendingGame={pendingGame} pendingFiles={pendingFiles}
          searchQuery={systemSearchQuery} onSearchChange={setSystemSearchQuery}
          onClose={closeSystemPicker} onDone={handleSystemPickerDone}
          isProcessing={isProcessing}
          pendingBatchCore={pendingBatchCore}
          onSelectSystem={async (core: string) => {
            const sysName = getSystemNameByCore(core);
            if (pendingFiles.length > 1) setPendingBatchCore(core);
            else {
              const update = { core, genre: sysName };
              if (editingGame) { updateGame(editingGame.id, update); setEditingGame({ ...editingGame, ...update }); }
              if (pendingGame) setPendingGame({ ...pendingGame, ...update });
            }
          }}
          coverArtState={{
            file: editingGame?.coverArt || pendingGame?.coverArt,
            fit: coverArtFit,
            onFitChange: (f: any) => {
              setCoverArtFit(f);
              if (editingGame) { updateGame(editingGame.id, { coverArtFit: f }); setEditingGame({ ...editingGame, coverArtFit: f }); }
            },
            onUpload: (d: any) => {
              if (editingGame) { updateGame(editingGame.id, { coverArt: d, coverArtFit }); setEditingGame({ ...editingGame, coverArt: d }); }
              else if (pendingGame) setPendingGame({ ...pendingGame, coverArt: d });
            },
            onRemove: () => {
              if (editingGame) { updateGame(editingGame.id, { coverArt: undefined }); setEditingGame({ ...editingGame, coverArt: undefined }); }
              else if (pendingGame) setPendingGame({ ...pendingGame, coverArt: undefined });
            }
          }}
        />
      )}
    </div>
  );
}

const AddGameButton = memo(({ onClick, colors, gradient }: { onClick: () => void, colors: any, gradient: any }) => (
  <button onClick={onClick} className="px-8 rounded-lg font-semibold transition-all hover:shadow-md active:scale-95 flex items-center gap-2 justify-center h-12" style={{ ...gradient, color: colors.darkBg }}>
    <Plus className="w-5 h-5" /> <span>Add Game</span>
  </button>
));
AddGameButton.displayName = 'AddGameButton';

const SortControls = ({ colors, sortBy, setSortBy, sortOrder, setSortOrder }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex items-center rounded-xl border-2 h-12 transition-all duration-300 ease-in-out" style={{ backgroundColor: colors.darkBg, borderColor: colors.midDark }}>
      <button onClick={() => setIsOpen(!isOpen)} className="h-full px-3 flex items-center justify-center transition-colors" style={{ color: isOpen ? colors.highlight : colors.softLight }}><ListFilter className="w-5 h-5" /></button>
      <div className="h-6 transition-all duration-300 ease-in-out" style={{ backgroundColor: colors.midDark, width: isOpen ? '1px' : '0px', marginRight: isOpen ? '0.75rem' : '0px' }} />
      <div className="flex items-center overflow-hidden transition-all duration-300 ease-in-out" style={{ maxWidth: isOpen ? '300px' : '0px', opacity: isOpen ? 1 : 0, visibility: isOpen ? 'visible' : 'hidden' }}>
        <div className="flex items-center pr-4 gap-1">
          {['title', 'system'].map((opt) => (
            <button key={opt} onClick={() => setSortBy(opt)} className="px-3 py-1 rounded-lg text-sm font-medium h-9 capitalize transition-all active:scale-95" style={{ backgroundColor: sortBy === opt ? colors.highlight : colors.midDark, color: sortBy === opt ? colors.darkBg : colors.softLight }}>{opt}</button>
          ))}
          <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="px-3 h-9 rounded-lg flex items-center justify-center transition-all active:scale-95" style={{ backgroundColor: colors.midDark, color: colors.softLight }}>
            {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = memo(({ isOpen, activeView, colors, onNavClick }: any) => (
  <aside className={`w-64 p-6 flex flex-col shadow-xl fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`} style={{ backgroundColor: colors.midDark, boxShadow: '4px 0 12px rgba(0,0,0,0.3)' }}>
    <div className="flex items-center gap-3 mb-12 pb-6 border-b animate-fade-in" style={{ borderColor: colors.highlight + '30' }}>
      <img src="/favicon.ico" alt="Joe T" className="w-12 h-12 flex-shrink-0" />
      <h2 className="text-2xl font-extrabold bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${colors.softLight}, ${colors.highlight})` }}>Joe T Emulator</h2>
    </div>
    <nav>
      {NAV_ITEMS.map(({ view, icon: Icon, label }, idx) => (
        <button key={view} onClick={() => onNavClick(view)}
          className="w-full p-3 mb-2 rounded-lg transition-all flex items-center hover:translate-x-1 hover:bg-opacity-50"
          style={{
            backgroundColor: activeView === view ? colors.sidebarHover : 'transparent',
            borderLeft: activeView === view ? `4px solid ${colors.highlight}` : '4px solid transparent',
            color: colors.softLight,
            animation: `fadeInSlide 0.3s ease-out ${idx * 0.1}s both`
          }}>
          <Icon className="w-6 h-6 mr-3 transition-transform" /> <span className="font-semibold">{label}</span>
        </button>
      ))}
    </nav>
  </aside>
));
Sidebar.displayName = 'Sidebar';

const ThemeGrid = ({ colors, selectedTheme, onSelectTheme, animKey }: any) => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold" style={{ color: colors.softLight }}>Select Theme</h2>
    </div>
    <div key={animKey} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(THEMES).map(([name, t]: [string, any], idx) => (
        <button key={name} onClick={() => onSelectTheme(name)} className="p-6 rounded-xl border-2 relative overflow-hidden animate-fade-in text-left transition-all hover:shadow-lg"
          style={{ backgroundColor: t.midDark, borderColor: selectedTheme === name ? t.playGreen : t.highlight + '40', boxShadow: selectedTheme === name ? `0 2px 8px ${t.playGreen}30` : '0 2px 4px rgba(0,0,0,0.2)', animationDelay: `${idx * 0.05}s` }}>
          <div className="flex justify-between mb-4">
            <h3 className="text-xl font-bold capitalize" style={{ color: t.softLight }}>{name}</h3>
            {selectedTheme === name && <CircleCheck className="w-6 h-6" style={{ color: t.playGreen }} />}
          </div>
          <div className="flex gap-2">
            {[t.darkBg, t.midDark, t.playGreen, t.highlight].map((c, i) => <div key={i} className="flex-1 h-12 rounded-lg" style={{ backgroundColor: c }} />)}
          </div>
        </button>
      ))}
    </div>
  </div>
);

const SystemPickerModal = ({ isOpen, isClosing, colors, gradient, editingGame, pendingGame, pendingFiles, searchQuery, onSearchChange, onClose, onDone, onSelectSystem, coverArtState, isProcessing, pendingBatchCore }: any) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const categories = useMemo(() => {
    const filtered: Record<string, Array<[string, string]>> = {};
    Object.entries(SYSTEM_PICKER).forEach(([cat, systems]) => {
      const matches = Object.entries(systems).filter(([name]) => name.toLowerCase().includes(searchQuery.toLowerCase()));
      if (matches.length) filtered[cat] = matches;
    });
    return filtered;
  }, [searchQuery]);

  const showCoverArt = pendingFiles.length <= 1;

  const currentCore = editingGame?.core || (pendingFiles.length > 1 ? pendingBatchCore : pendingGame?.core);

  const isDoneDisabled = isProcessing;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}
      style={{ animation: isClosing ? 'fadeOut 0.2s ease-out' : 'fadeIn 0.2s ease-out' }}>
      <div className="p-6 rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl border overflow-hidden"
        style={{ backgroundColor: colors.darkBg, borderColor: colors.midDark, boxShadow: '0 20px 60px rgba(0,0,0,0.7)', animation: isClosing ? 'slideDown 0.2s ease-out' : 'slideUp 0.3s ease-out' }} onClick={e => e.stopPropagation()}>

        <div className="mb-6">
          <h3 className="text-3xl font-bold mb-2" style={{ color: colors.softLight }}>
            {editingGame ? editingGame.title : pendingFiles.length > 1 ? `Add ${pendingFiles.length} Games` : 'Select System'}
          </h3>
          <p className="text-sm opacity-70" style={{ color: colors.highlight }}>
            {editingGame ? 'Choose system and cover art' : pendingFiles.length > 1 ? `Choose system for ${pendingFiles.length} files` : 'Select a system'}
          </p>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
          {showCoverArt && (
            <div className="flex-shrink-0 w-full xl:w-80 space-y-4 max-h-[60vh] xl:max-h-full overflow-y-auto">
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: colors.midDark, backgroundColor: colors.darkBg }}>
                {coverArtState.file ? (
                  <div className="relative group aspect-[4/5] bg-black/20">
                    <img src={coverArtState.file} alt="Cover" className="w-full h-full" style={{ objectFit: coverArtState.fit, objectPosition: 'center' }} />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={coverArtState.onRemove} className="p-2.5 rounded-lg hover:shadow-md active:scale-95 transition-all" style={{ backgroundColor: '#ef4444', color: colors.softLight }}><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[3/4] flex items-center justify-center bg-gradient-to-br p-6 text-center" style={{ backgroundImage: `linear-gradient(135deg, ${colors.darkBg}, ${colors.midDark})` }}>
                    <div><Image className="w-8 h-8 mx-auto mb-4" style={{ color: colors.highlight }} /><p className="text-sm font-medium" style={{ color: colors.softLight }}>No Cover Art</p></div>
                  </div>
                )}
                {coverArtState.file && (
                  <div className="p-4 border-t" style={{ borderColor: colors.highlight + '30' }}>
                    <button onClick={() => coverArtState.onFitChange(coverArtState.fit === 'contain' ? 'cover' : 'contain')}
                      className="w-full py-2.5 rounded-lg text-sm font-semibold active:scale-95 transition-all" style={{ backgroundColor: colors.highlight, color: colors.darkBg }}>
                      {coverArtState.fit === 'contain' ? 'Zoom to Fill' : 'Shrink to Fit'}
                    </button>
                  </div>
                )}
                <div className="p-4 border-t" style={{ borderColor: colors.highlight + '30' }}>
                  <input type="file" accept="image/*" className="hidden" id="art-upload" onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) { const r = new FileReader(); r.onload = ev => coverArtState.onUpload(ev.target?.result); r.readAsDataURL(f); }
                  }} />
                  <label htmlFor="art-upload" className="block w-full py-2.5 rounded-lg text-sm font-semibold text-center active:scale-95 transition-all"
                    style={{ ...((coverArtState.file) ? { backgroundColor: colors.highlight } : gradient), color: colors.darkBg }}>
                    {coverArtState.file ? 'Change Image' : 'Upload Cover Art'}
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center rounded-xl border-2 transition-all mb-4 h-10" style={{ backgroundColor: colors.darkBg, borderColor: isSearchFocused ? colors.highlight : colors.midDark, boxShadow: isSearchFocused ? `0 0 0 2px ${colors.highlight}30` : 'none' }}>
              <div className="w-10 flex items-center justify-center" style={{ color: colors.softLight }}><Search className="w-4 h-4" /></div>
              <input type="text" placeholder="Search systems..." value={searchQuery} onChange={e => onSearchChange(e.target.value)} onFocus={() => setIsSearchFocused(true)} onBlur={() => setIsSearchFocused(false)}
                className="bg-transparent flex-1 focus:outline-none text-sm pr-4" style={{ color: colors.softLight }} autoFocus />
            </div>
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
              {Object.entries(categories).map(([cat, systems]) => (
                <div key={cat} className="mb-6 last:mb-0">
                  <div className="flex items-center mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider pr-3" style={{ color: colors.highlight }}>{cat}</h4>
                    <div className="flex-1 h-px" style={{ backgroundColor: colors.highlight + '30' }} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {systems.map(([name, core]: any, index: number) => {
                      const isSel = currentCore === core;
                      return (
                        <button key={core} onClick={() => onSelectSystem(core)} className="p-3.5 rounded-xl text-left border-2 flex items-center justify-between group transition-all active:scale-95"
                          style={{
                            backgroundColor: isSel ? colors.highlight : colors.midDark,
                            borderColor: isSel ? colors.highlight : colors.midDark,
                            color: isSel ? colors.darkBg : colors.softLight,
                            animation: `fadeIn 0.4s ease-out ${index * 0.03}s both`
                          }}>
                          <span className="font-medium text-sm truncate pr-2 flex-1">{name}</span>
                          {isSel && <CircleCheck className="w-5 h-5 flex-shrink-0 transition-all" style={{ color: colors.darkBg }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {Object.keys(categories).length === 0 && (
                <div className="text-center py-16" style={{ color: colors.highlight }}>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.highlight + '15' }}>
                    <Search className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-semibold mb-1" style={{ color: colors.softLight }}>No systems found</p>
                  <p className="text-sm opacity-70">Try a different search term</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: colors.midDark }}>
          {(editingGame || pendingFiles.length > 0) && (
            <button onClick={onDone} disabled={isDoneDisabled} className="py-2.5 px-6 rounded-lg font-semibold active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" style={{ ...gradient, color: colors.darkBg }}>
              <span>Done</span>
            </button>
          )}
          <button onClick={onClose} disabled={isProcessing} className="py-2.5 px-6 rounded-lg font-semibold active:scale-95 transition-all disabled:opacity-50" style={{ backgroundColor: colors.highlight, color: colors.darkBg }}>{editingGame ? 'Cancel' : 'Close'}</button>
        </div>
      </div>
    </div>
  );
};