"use client";

import { useEffect, useMemo, useState, useCallback, memo, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { DragEvent } from 'react';
import { loadGame } from '@/lib/emulator';
import { saveGameFile, getGameFile } from '@/lib/storage';
import { SYSTEM_PICKER, getSystemNameByCore, getSystemCategory } from '@/lib/constants';
import { Game, THEMES, getGradientStyle } from '@/types';
import { GameCard } from '@/components/gamecard';
import { 
  Gamepad2, Palette, Menu, X, Trash2, ArrowUp, ArrowDown, Search, Plus, 
  CircleCheck, Image, XCircle, ListFilter, Settings, Save, Clock, Upload, 
  Eye, EyeOff, Timer 
} from 'lucide-react';
import { useGameLibrary } from '@/hooks/useGameLibrary';
import { useUIState } from '@/hooks/useUIState';
import { useGameOperations } from '@/hooks/useGameOperations';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// constants
const FONT_FAMILY = 'Lexend, sans-serif';
const GRID_CLASS = "grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-6";
const NAV_ITEMS = [
  { view: 'library' as const, icon: Gamepad2, label: 'Library' },
  { view: 'themes' as const, icon: Palette, label: 'Themes' },
  { view: 'settings' as const, icon: Settings, label: 'Settings' }
] as const;

// utils
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const stripExtension = (filename: string) => filename.replace(/\.[^/.]+$/, '');
const getFileExtension = (filename: string) => filename.split(".").pop()?.toLowerCase() || "";

export default function Home() {
  const { games, loadGamesFromStorage, addGame, updateGame, deleteGame } = useGameLibrary();
  
  // ui state hooks
  const {
    activeView, setActiveView, isSidebarOpen, setIsSidebarOpen,
    isMounted, setIsMounted, gameSearchQuery, setGameSearchQuery, gameSearchFocused, setGameSearchFocused,
    setIsDragActive, themeAnimationKey, setThemeAnimationKey,
    isDeleteMode, setIsDeleteMode, selectedGameIds, setSelectedGameIds,
    deletingGameIds, setDeletingGameIds, gameSearchInputRef, dragCounterRef,
    toggleGameSelection, exitDeleteMode
  } = useUIState();

  // game operations hooks
  const {
    duplicateMessage, showDuplicateMessage, editingGame, setEditingGame, pendingGame, setPendingGame,
    pendingFiles, setPendingFiles, systemPickerOpen, setSystemPickerOpen, systemPickerClosing,
    systemSearchQuery, setSystemSearchQuery, pendingBatchCore, setPendingBatchCore, coverArtFit, setCoverArtFit,
    showDuplicateError, closeSystemPicker, getSystemFromExtension, extractFilesFromDataTransfer
  } = useGameOperations();

  // settings and storage hooks
  const [selectedTheme, setSelectedTheme, isThemeHydrated] = useLocalStorage('theme', 'default');
  const [sortBy, setSortBy, isSortByHydrated] = useLocalStorage<'title' | 'system'>('sortBy', 'title');
  const [sortOrder, setSortOrder, isSortOrderHydrated] = useLocalStorage<'asc' | 'desc'>('sortOrder', 'asc');
  const [autoLoadState, setAutoLoadState, isAutoLoadHydrated] = useLocalStorage('autoLoadState', false);
  const [autoLoadIcon, setAutoLoadIcon] = useLocalStorage('autoLoadIcon', true);
  const [autoSaveState, setAutoSaveState, isAutoSaveHydrated] = useLocalStorage('autoSaveState', false);
  const [autoSaveInterval, setAutoSaveInterval] = useLocalStorage('autoSaveInterval', 60);
  const [autoSaveIcon, setAutoSaveIcon] = useLocalStorage('autoSaveIcon', true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const isHydrated = isThemeHydrated && isSortByHydrated && isSortOrderHydrated && isAutoLoadHydrated && isAutoSaveHydrated;
  const currentColors = useMemo(() => THEMES[selectedTheme as keyof typeof THEMES] || THEMES.default, [selectedTheme]);
  const gradientStyle = useMemo(() => getGradientStyle(currentColors.gradientFrom, currentColors.gradientTo), [currentColors]);

  // initialization
  useEffect(() => {
    setIsMounted(true);
    loadGamesFromStorage();
    const loadTimer = setTimeout(() => setIsInitialLoad(false), 2000);
    return () => clearTimeout(loadTimer);
  }, [loadGamesFromStorage, setIsMounted]);

  useEffect(() => {
    if (activeView === 'themes') setThemeAnimationKey(k => k + 1);
  }, [activeView, setThemeAnimationKey]);

  // game file processing
  const isDuplicate = useCallback((fileName: string, list: Game[]) => 
    list.some(g => g.fileName === fileName || g.filePath === fileName), []);

  const processGameFile = useCallback(async (file: File, index: number, selectedCore?: string, currentGamesList: Game[] = games): Promise<Game[]> => {
    if (isDuplicate(file.name, currentGamesList)) {
      showDuplicateError(`"${file.name}" is already in your library`);
      return currentGamesList;
    }
    const detectedCore = selectedCore || getSystemFromExtension(getFileExtension(file.name));
    if (!detectedCore) return currentGamesList;

    const gameId = Date.now() + index;
    await saveGameFile(gameId, file);
    await delay(200); // FIX: Add delay to ensure IDB transaction completes before allowing immediate read.
    const newGame: Game = {
      id: gameId,
      title: stripExtension(file.name),
      genre: getSystemNameByCore(detectedCore),
      filePath: file.name,
      fileName: file.name,
      core: detectedCore,
    };
    addGame(newGame);
    return [...currentGamesList, newGame];
  }, [games, isDuplicate, showDuplicateError, getSystemFromExtension, addGame]);

  const handleIncomingFiles = useCallback(async (files: File[]) => {
    if (!files.length) return;
    const filesNeedingSystem: Array<{ file: File; index: number }> = [];
    let currentGames = games;

    for (let i = 0; i < files.length; i++) {
      const detectedCore = getSystemFromExtension(getFileExtension(files[i].name));
      if (detectedCore) {
        currentGames = await processGameFile(files[i], i, detectedCore, currentGames);
      } else {
        filesNeedingSystem.push({ file: files[i], index: i });
      }
    }

    const filteredNeeding = filesNeedingSystem.filter(({ file }) => !isDuplicate(file.name, currentGames));

    if (filteredNeeding.length > 0) {
      setPendingFiles(filteredNeeding);
      if (filteredNeeding.length === 1) {
        setPendingGame({ 
          id: Date.now(), 
          title: stripExtension(filteredNeeding[0].file.name), 
          genre: 'Unknown', 
          filePath: filteredNeeding[0].file.name, 
          fileName: filteredNeeding[0].file.name 
        });
      } else {
        setPendingGame(null);
      }
      setPendingBatchCore(null);
      setCoverArtFit('cover');
      setSystemPickerOpen(true);
    } else if (filesNeedingSystem.length > 0) {
      showDuplicateError(filesNeedingSystem.length === 1 ? 'File already in library' : 'All selected files are duplicates');
    }
  }, [games, isDuplicate, getSystemFromExtension, processGameFile, setPendingFiles, setPendingGame, setPendingBatchCore, setCoverArtFit, setSystemPickerOpen, showDuplicateError]);

  const handleSystemPickerDone = useCallback(async () => {
    if (editingGame) { closeSystemPicker(); return; }
    const effectiveCore = pendingFiles.length > 1 ? pendingBatchCore : pendingGame?.core;

    if (!effectiveCore) { showDuplicateError("Please select a system"); return; }
    setIsProcessing(true);

    try {
      if (pendingFiles.length > 1) {
        let currentGames = games;
        for (const { file, index } of pendingFiles) {
          currentGames = await processGameFile(file, index, effectiveCore, currentGames);
        }
        setPendingFiles([]); setPendingBatchCore(null);
      } else if (pendingFiles.length === 1) {
        const { file } = pendingFiles[0];
        const gameId = pendingGame?.id ?? Date.now();
        if (isDuplicate(file.name, games)) { 
          showDuplicateError(`"${file.name}" is duplicate`); 
          closeSystemPicker(); 
          return; 
        }

        await saveGameFile(gameId, file);
        await delay(200); // FIX: Add delay to ensure IDB transaction completes before allowing immediate read.
        addGame({
          id: gameId,
          title: pendingGame?.title || stripExtension(file.name),
          genre: pendingGame?.genre || getSystemNameByCore(effectiveCore) || 'Unknown',
          filePath: pendingGame?.filePath || file.name,
          fileName: file.name,
          core: effectiveCore,
          coverArt: pendingGame?.coverArt,
          coverArtFit: pendingGame?.coverArt ? (pendingGame.coverArtFit || coverArtFit) : undefined,
        });
      }
      closeSystemPicker();
    } catch (error) { console.error(error); } finally { setIsProcessing(false); }
  }, [editingGame, pendingFiles, pendingBatchCore, pendingGame, games, isDuplicate, closeSystemPicker, showDuplicateError, processGameFile, addGame, coverArtFit]);

  // interaction handlers
  const handleDrag = useCallback((e: DragEvent<HTMLElement>, active: boolean) => {
    e.preventDefault(); e.stopPropagation();
    if (active && e.dataTransfer?.types.includes('Files')) {
      dragCounterRef.current += 1; setIsDragActive(true); e.dataTransfer.dropEffect = 'copy';
    } else if (!active) {
      dragCounterRef.current -= 1; if (dragCounterRef.current === 0) setIsDragActive(false);
    }
  }, [setIsDragActive, dragCounterRef]);

  const handleDrop = useCallback(async (e: DragEvent<HTMLElement>) => {
    e.preventDefault(); e.stopPropagation();
    dragCounterRef.current = 0; setIsDragActive(false);
    if (e.dataTransfer) await handleIncomingFiles(extractFilesFromDataTransfer(e.dataTransfer));
  }, [setIsDragActive, dragCounterRef, handleIncomingFiles, extractFilesFromDataTransfer]);

  const handleFileSelect = useCallback(async () => {
    try {
      let files: File[] = [];
      if ('showOpenFilePicker' in window) {
        const handles = await (window as any).showOpenFilePicker({ multiple: true });
        files = await Promise.all(handles.map((fh: any) => fh.getFile()));
      } else {
        files = await new Promise<File[]>(r => {
          const inp = document.createElement('input'); inp.type = 'file'; inp.multiple = true;
          inp.onchange = (e: any) => r(Array.from(e.target.files || [])); inp.click();
        });
      }
      await handleIncomingFiles(files);
    } catch (err: any) { if (err?.name !== 'AbortError') console.error(err); }
  }, [handleIncomingFiles]);

  const handlePlayClick = useCallback(async (game: Game) => {
    try {
      let file = await getGameFile(game.id);
      if (!file && game.fileData) {
        const res = await fetch(game.fileData);
        file = new File([await res.blob()], game.fileName || game.title, { type: 'application/octet-stream' });
        await saveGameFile(game.id, file);
      }
      if (file) await loadGame(file, game.core, selectedTheme, autoLoadState, autoSaveState, autoSaveInterval * 1000);
      else console.error('Game file missing', game);
    } catch (e) { console.error('Launch failed', e); }
  }, [selectedTheme, autoLoadState, autoSaveState, autoSaveInterval]);

  const handleDeleteGame = useCallback(async (game: Game) => {
    if (!confirm(`Delete "${game.title}"?`)) return;
    setDeletingGameIds(prev => new Set(prev).add(game.id));
    await delay(350); await deleteGame(game.id);
    setDeletingGameIds(prev => { const n = new Set(prev); n.delete(game.id); return n; });
  }, [deleteGame, setDeletingGameIds]);

  const handleMassDelete = useCallback(async () => {
    if (!selectedGameIds.size || !confirm(`Delete ${selectedGameIds.size} games?`)) return;
    setDeletingGameIds(new Set(selectedGameIds));
    await delay(350);
    await Promise.all([...selectedGameIds].map(id => deleteGame(id)));
    setSelectedGameIds(new Set()); setDeletingGameIds(new Set()); setIsDeleteMode(false);
  }, [selectedGameIds, deleteGame, setDeletingGameIds, setSelectedGameIds, setIsDeleteMode]);

  const handleEditGame = useCallback((g: Game) => {
    setEditingGame(g); setPendingGame({ ...g }); setCoverArtFit(g.coverArtFit || 'cover'); setSystemPickerOpen(true);
  }, [setEditingGame, setPendingGame, setCoverArtFit, setSystemPickerOpen]);

  // render calculations
  const sortedGames = useMemo(() => {
    let filtered = games;
    if (gameSearchQuery.trim()) {
      const q = gameSearchQuery.toLowerCase();
      filtered = games.filter(g => 
        g.title.toLowerCase().includes(q) || 
        g.genre.toLowerCase().includes(q) || 
        getSystemCategory(g.core).toLowerCase().includes(q)
      );
    }
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'title') cmp = a.title.localeCompare(b.title);
      else {
        cmp = getSystemCategory(a.core).localeCompare(getSystemCategory(b.core));
        if (cmp === 0) cmp = a.genre.localeCompare(b.genre);
        if (cmp === 0) cmp = a.title.localeCompare(b.title);
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [games, sortBy, sortOrder, gameSearchQuery]);

  const groupedGames = useMemo(() => {
    if (sortBy !== 'system') return null;
    // group efficiently
    const groups = sortedGames.reduce((acc, g) => {
      const mfg = getSystemCategory(g.core);
      const cat = mfg === 'Other' ? g.genre : `${mfg} ${g.genre}`;
      (acc[cat] ||= []).push(g); 
      return acc;
    }, {} as Record<string, Game[]>);
    
    // sort keys and return simplified object
    return Object.keys(groups)
      .sort((a, b) => sortOrder === 'asc' ? a.localeCompare(b) : b.localeCompare(a))
      .reduce((res, cat) => { res[cat] = groups[cat]; return res; }, {} as Record<string, Game[]>);
  }, [sortedGames, sortBy, sortOrder]);

  const renderCard = useCallback((game: Game, idx: number) => (
    <div key={game.id} className={deletingGameIds.has(game.id) ? 'animate-card-exit' : 'animate-card-enter'} style={{ animationDelay: deletingGameIds.has(game.id) ? '0s' : `${isInitialLoad ? idx * 0.05 : 0}s` }}>
      <GameCard game={game} isSelected={selectedGameIds.has(game.id)} onPlay={handlePlayClick} onDelete={handleDeleteGame} onSelect={toggleGameSelection} isDeleteMode={isDeleteMode} onEnterDeleteMode={() => setIsDeleteMode(true)} colors={currentColors} onEdit={handleEditGame} onCoverArtClick={handleEditGame} />
    </div>
  ), [deletingGameIds, isInitialLoad, selectedGameIds, handlePlayClick, handleDeleteGame, toggleGameSelection, isDeleteMode, currentColors, handleEditGame]);

  if (!isMounted || !isHydrated) return <div className="min-h-screen" style={{ backgroundColor: '#0a0a0f', fontFamily: FONT_FAMILY }} />;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: currentColors.darkBg, fontFamily: FONT_FAMILY }}>
      <div className={`fixed inset-0 z-40 transition-all duration-300 ${isSidebarOpen ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)} />
      <Sidebar isOpen={isSidebarOpen} activeView={activeView} colors={currentColors} onNavClick={(v: any) => { setActiveView(v); setIsSidebarOpen(false); }} />

      <div className="flex-1 overflow-hidden">
        <main className="p-8 overflow-y-auto pb-20 scrollbar-hide" style={{ minHeight: 'calc(100vh - 4rem)' }} onDragEnter={(e) => handleDrag(e, true)} onDragOver={(e) => e.dataTransfer && (e.dataTransfer.dropEffect = 'copy')} onDragLeave={(e) => handleDrag(e, false)} onDrop={handleDrop}>
          <header className="mb-10 flex justify-between items-center">
            <h1 className="text-4xl font-extrabold tracking-tight capitalize" style={{ color: currentColors.softLight, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>{activeView}</h1>
          </header>

          {activeView === 'themes' ? (
            <ThemeGrid colors={currentColors} selectedTheme={selectedTheme} onSelectTheme={setSelectedTheme} animKey={themeAnimationKey} />
          ) : activeView === 'settings' ? (
            <SettingsView 
              colors={currentColors} gradient={gradientStyle} 
              autoLoadState={autoLoadState} setAutoLoadState={setAutoLoadState} 
              autoSaveState={autoSaveState} setAutoSaveState={setAutoSaveState}
              autoSaveInterval={autoSaveInterval} setAutoSaveInterval={setAutoSaveInterval}
              autoSaveIcon={autoSaveIcon} setAutoSaveIcon={setAutoSaveIcon}
              autoLoadIcon={autoLoadIcon} setAutoLoadIcon={setAutoLoadIcon}
            />
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: currentColors.softLight }}>Games ({sortedGames.length})</h2>
              </div>
              {games.length === 0 ? (
                <EmptyState colors={currentColors} gradient={gradientStyle} onAddGame={handleFileSelect} />
              ) : (
                <>
                  <GameControls colors={currentColors} gradient={gradientStyle} gameSearchQuery={gameSearchQuery} setGameSearchQuery={setGameSearchQuery} gameSearchFocused={gameSearchFocused} setGameSearchFocused={setGameSearchFocused} gameSearchInputRef={gameSearchInputRef} sortBy={sortBy} setSortBy={setSortBy} sortOrder={sortOrder} setSortOrder={setSortOrder} isDeleteMode={isDeleteMode} selectedGameIds={selectedGameIds} onMassDelete={handleMassDelete} onExitDeleteMode={exitDeleteMode} onAddGame={handleFileSelect} />
                  {sortedGames.length === 0 ? (
                    <div className="text-center py-20 opacity-60"><p style={{ color: currentColors.softLight }}>No games found matching "{gameSearchQuery}"</p></div>
                  ) : groupedGames ? (
                    Object.entries(groupedGames).map(([cat, catGames]) => (
                      <div key={cat} className="mb-8 last:mb-0 animate-fade-in">
                        <div className="flex items-center mb-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider pr-3" style={{ color: currentColors.highlight }}>{cat}</h4>
                          <div className="flex-1 h-px" style={{ backgroundColor: currentColors.highlight + '30' }} />
                        </div>
                        <div className={GRID_CLASS}>{catGames.map((g, i) => renderCard(g, i))}</div>
                      </div>
                    ))
                  ) : (
                    <div className={GRID_CLASS}>{sortedGames.map((g, i) => renderCard(g, i))}</div>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>

      {duplicateMessage && <Toast message={duplicateMessage} isVisible={showDuplicateMessage} />}
      <EmulatorNotification colors={currentColors} autoSaveIcon={autoSaveIcon} autoLoadIcon={autoLoadIcon} />
      <Footer colors={currentColors} isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {(systemPickerOpen || systemPickerClosing) && (
        <SystemPickerModal
          isOpen={systemPickerOpen} isClosing={systemPickerClosing} colors={currentColors} gradient={gradientStyle}
          editingGame={editingGame} pendingGame={pendingGame} pendingFiles={pendingFiles} searchQuery={systemSearchQuery}
          onSearchChange={setSystemSearchQuery} onClose={closeSystemPicker} onDone={handleSystemPickerDone}
          isProcessing={isProcessing} pendingBatchCore={pendingBatchCore}
          onSelectSystem={(core: string) => {
            if (pendingFiles.length > 1) setPendingBatchCore(core);
            else {
              const update = { core, genre: getSystemNameByCore(core) };
              if (editingGame) { updateGame(editingGame.id, update); setEditingGame({ ...editingGame, ...update }); }
              if (pendingGame) setPendingGame({ ...pendingGame, ...update });
            }
          }}
          coverArtState={{
            file: editingGame ? editingGame.coverArt : pendingGame?.coverArt, fit: coverArtFit,
            onFitChange: (f: any) => { setCoverArtFit(f); if (editingGame) { updateGame(editingGame.id, { coverArtFit: f }); setEditingGame({ ...editingGame, coverArtFit: f }); } },
            onUpload: (d: any) => { if (editingGame) { updateGame(editingGame.id, { coverArt: d }); setEditingGame({ ...editingGame, coverArt: d }); } else if (pendingGame) setPendingGame({ ...pendingGame, coverArt: d }); },
            onRemove: () => { if (editingGame) { updateGame(editingGame.id, { coverArt: undefined }); setEditingGame({ ...editingGame, coverArt: undefined }); } else if (pendingGame) setPendingGame({ ...pendingGame, coverArt: undefined }); }
          }}
        />
      )}
    </div>
  );
}

// sub-components
const EmulatorNotification = memo(({ colors, autoSaveIcon, autoLoadIcon }: any) => {
  const [notification, setNotification] = useState<{ type: 'save' | 'load', id: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { setMountNode(document.body); }, []);

  useEffect(() => {
    const handler = (e: any) => {
      const { type, source } = e.detail;
      if (source === 'auto') {
        if (type === 'save' && !autoSaveIcon) return;
        if (type === 'load' && !autoLoadIcon) return;
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      
      const gameEl = document.getElementById('game');
      setMountNode((gameEl && window.getComputedStyle(gameEl).display !== 'none') ? gameEl : document.body);

      setIsVisible(false);
      setTimeout(() => {
        setNotification({ type, id: Date.now() });
        requestAnimationFrame(() => setIsVisible(true));
        timerRef.current = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => setNotification(null), 300);
        }, 1500);
      }, 10);
    };
    window.addEventListener('emulator_notification', handler);
    return () => {
      window.removeEventListener('emulator_notification', handler);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoSaveIcon, autoLoadIcon]);

  if (!notification || !mountNode) return null;
  return createPortal(
    <div className={`fixed top-4 left-4 z-[1000000] pointer-events-none transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center backdrop-blur-sm shadow-lg"
           style={{ backgroundColor: colors.highlight + '15', color: colors.highlight }}>
        {notification.type === 'save' ? <Save className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
      </div>
    </div>, mountNode
  );
});

const SettingsView = memo(({ colors, gradient, autoLoadState, setAutoLoadState, autoSaveState, setAutoSaveState, autoSaveInterval, setAutoSaveInterval, autoSaveIcon, setAutoSaveIcon, autoLoadIcon, setAutoLoadIcon }: any) => {
  const getSwitchStyle = (isActive: boolean) => ({
    ...(isActive ? gradient : { backgroundColor: colors.darkBg }),
    borderColor: isActive ? 'transparent' : colors.midDark,
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
  });

  return (
    <div className="animate-fade-in w-full grid gap-4">
      <div className="p-6 rounded-xl border-2 transition-all flex flex-col animate-card-enter" style={{ backgroundColor: colors.darkBg, borderColor: colors.midDark, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}>
        <div className="flex items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5 overflow-hidden">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.highlight + '20', color: colors.highlight }}><Clock className="w-6 h-6" /></div>
            <div className="flex-1 min-w-0"><h3 className="text-lg font-bold leading-tight mb-1" style={{ color: colors.softLight }}>Auto-Save State</h3><p className="text-sm leading-relaxed opacity-70" style={{ color: colors.softLight }}>Automatically save your game state periodically.</p></div>
          </div>
          <button onClick={() => setAutoSaveState(!autoSaveState)} className="relative w-14 h-8 rounded-full transition-all duration-300 ease-out focus:outline-none border-2 flex-shrink-0" style={getSwitchStyle(autoSaveState)}>
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full shadow-md transform transition-all duration-300 cubic-bezier(0.4, 0.0, 0.2, 1) ${autoSaveState ? 'translate-x-6' : 'translate-x-0'}`} style={{ backgroundColor: autoSaveState ? colors.darkBg : colors.softLight }} />
          </button>
        </div>
        <div className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: autoSaveState ? '200px' : '0px', opacity: autoSaveState ? 1 : 0, marginTop: autoSaveState ? '1.5rem' : '0px', visibility: autoSaveState ? 'visible' : 'hidden' }}>
          <div className="pt-4 border-t space-y-4 pl-16" style={{ borderColor: colors.highlight + '30' }}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3"><Timer className="w-4 h-4" style={{ color: colors.highlight }} /><span className="text-sm font-medium" style={{ color: colors.softLight }}>Save Interval</span></div>
              <div className="flex items-center gap-2">{[15, 30, 45, 60].map(v => <button key={v} onClick={() => setAutoSaveInterval(v)} className="px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all active:scale-95" style={{ backgroundColor: autoSaveInterval === v ? colors.highlight : colors.midDark, borderColor: autoSaveInterval === v ? colors.highlight : colors.midDark, color: autoSaveInterval === v ? colors.darkBg : colors.softLight }}>{v}s</button>)}</div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">{autoSaveIcon ? <Eye className="w-4 h-4" style={{ color: colors.highlight }} /> : <EyeOff className="w-4 h-4" style={{ color: colors.highlight }} />}<span className="text-sm font-medium" style={{ color: colors.softLight }}>Show Save Icon</span></div>
              <button onClick={() => setAutoSaveIcon(!autoSaveIcon)} className="relative w-14 h-8 rounded-full transition-all duration-300 ease-out focus:outline-none border-2 flex-shrink-0" style={getSwitchStyle(autoSaveIcon)}>
                <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full shadow-md transform transition-all duration-300 cubic-bezier(0.4, 0.0, 0.2, 1) ${autoSaveIcon ? 'translate-x-6' : 'translate-x-0'}`} style={{ backgroundColor: autoSaveIcon ? colors.darkBg : colors.softLight }} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 rounded-xl border-2 transition-all flex flex-col animate-card-enter" style={{ backgroundColor: colors.darkBg, borderColor: colors.midDark, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5 overflow-hidden">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.highlight + '20', color: colors.highlight }}><Save className="w-6 h-6" /></div>
            <div className="flex-1 min-w-0"><h3 className="text-lg font-bold leading-tight mb-1" style={{ color: colors.softLight }}>Auto-Load State</h3><p className="text-sm leading-relaxed opacity-70" style={{ color: colors.softLight }}>Resume gameplay from your last save automatically.</p></div>
          </div>
          <button onClick={() => setAutoLoadState(!autoLoadState)} className="relative w-14 h-8 rounded-full transition-all duration-300 ease-out focus:outline-none border-2 flex-shrink-0" style={getSwitchStyle(autoLoadState)}>
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full shadow-md transform transition-all duration-300 cubic-bezier(0.4, 0.0, 0.2, 1) ${autoLoadState ? 'translate-x-6' : 'translate-x-0'}`} style={{ backgroundColor: autoLoadState ? colors.darkBg : colors.softLight }} />
          </button>
        </div>
        <div className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: autoLoadState ? '100px' : '0px', opacity: autoLoadState ? 1 : 0, marginTop: autoLoadState ? '1.5rem' : '0px', visibility: autoLoadState ? 'visible' : 'hidden' }}>
          <div className="pt-4 border-t pl-16" style={{ borderColor: colors.highlight + '30' }}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">{autoLoadIcon ? <Eye className="w-4 h-4" style={{ color: colors.highlight }} /> : <EyeOff className="w-4 h-4" style={{ color: colors.highlight }} />}<span className="text-sm font-medium" style={{ color: colors.softLight }}>Show Load Icon</span></div>
              <button onClick={() => setAutoLoadIcon(!autoLoadIcon)} className="relative w-14 h-8 rounded-full transition-all duration-300 ease-out focus:outline-none border-2 flex-shrink-0" style={getSwitchStyle(autoLoadIcon)}>
                <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full shadow-md transform transition-all duration-300 cubic-bezier(0.4, 0.0, 0.2, 1) ${autoLoadIcon ? 'translate-x-6' : 'translate-x-0'}`} style={{ backgroundColor: autoLoadIcon ? colors.darkBg : colors.softLight }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const EmptyState = memo(({ colors, gradient, onAddGame }: any) => (
  <div className="flex flex-col items-center justify-center py-20 animate-fade-in text-center">
    <div className="w-20 h-20 rounded-2xl mb-6 flex items-center justify-center shadow-lg transition-colors" style={{ backgroundColor: colors.highlight + '15', color: colors.highlight }}><Gamepad2 className="w-10 h-10" /></div>
    <h3 className="text-xl font-bold mb-2" style={{ color: colors.softLight }}>No games found</h3>
    <p className="mb-8 opacity-70" style={{ color: colors.highlight }}>Add your first ROM to get started</p>
    <AddGameButton onClick={onAddGame} colors={colors} gradient={gradient} />
  </div>
));

const GameControls = memo(({ colors, gradient, gameSearchQuery, setGameSearchQuery, gameSearchFocused, setGameSearchFocused, gameSearchInputRef, sortBy, setSortBy, sortOrder, setSortOrder, isDeleteMode, selectedGameIds, onMassDelete, onExitDeleteMode, onAddGame }: any) => (
  <div className="flex flex-col gap-4 mb-6">
    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
      <div className="flex flex-wrap gap-3 items-center flex-1 min-w-0">
        <SearchBar colors={colors} value={gameSearchQuery} onChange={setGameSearchQuery} isFocused={gameSearchFocused} onFocus={() => setGameSearchFocused(true)} onBlur={() => setGameSearchFocused(false)} inputRef={gameSearchInputRef} />
        <SortControls colors={colors} sortBy={sortBy} setSortBy={setSortBy} sortOrder={sortOrder} setSortOrder={setSortOrder} />
      </div>
      <div className="flex flex-wrap gap-3 justify-end items-center">
        {isDeleteMode ? (
          <>
            <button onClick={onMassDelete} disabled={!selectedGameIds.size} className="px-5 py-2.5 rounded-lg h-12 flex items-center justify-center text-white bg-red-500 transition-all active:scale-95 disabled:opacity-60"><Trash2 className="w-5 h-5" /></button>
            <button onClick={onExitDeleteMode} className="px-5 py-2.5 rounded-lg font-semibold h-12 transition-all active:scale-95" style={{ backgroundColor: colors.highlight, color: colors.darkBg }}>Cancel</button>
          </>
        ) : <AddGameButton onClick={onAddGame} colors={colors} gradient={gradient} />}
      </div>
    </div>
  </div>
));

const SearchBar = memo(({ colors, value, onChange, isFocused, onFocus, onBlur, inputRef }: any) => (
  <div className="flex items-center rounded-xl border-2 transition-all w-[340px] h-12" style={{ backgroundColor: colors.darkBg, borderColor: isFocused ? colors.highlight : colors.midDark, boxShadow: isFocused ? `0 0 0 2px ${colors.highlight}30` : 'none' }}>
    <div className="w-12 h-full flex items-center justify-center" style={{ color: colors.softLight }}><Search className="w-4 h-4" /></div>
    <input ref={inputRef} type="text" placeholder="Search..." value={value} onChange={(e) => onChange(e.target.value)} onFocus={onFocus} onBlur={onBlur} className="bg-transparent h-full flex-1 focus:outline-none text-sm pr-4" style={{ color: colors.softLight }} />
  </div>
));

const AddGameButton = memo(({ onClick, colors, gradient }: any) => (
  <button onClick={onClick} className="px-8 rounded-lg font-semibold transition-all hover:shadow-md active:scale-95 flex items-center gap-2 justify-center h-12" style={{ ...gradient, color: colors.darkBg }}><Plus className="w-5 h-5" /><span>Add Game</span></button>
));

const SortControls = memo(({ colors, sortBy, setSortBy, sortOrder, setSortOrder }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex items-center rounded-xl border-2 h-12 transition-all duration-300 ease-in-out" style={{ backgroundColor: colors.darkBg, borderColor: colors.midDark }}>
      <button onClick={() => setIsOpen(!isOpen)} className="h-full px-3 flex items-center justify-center transition-colors" style={{ color: isOpen ? colors.highlight : colors.softLight }}><ListFilter className="w-5 h-5" /></button>
      <div className="h-6 transition-all duration-300 ease-in-out" style={{ backgroundColor: colors.midDark, width: isOpen ? '1px' : '0px', marginRight: isOpen ? '0.75rem' : '0px' }} />
      <div className="flex items-center overflow-hidden transition-all duration-300 ease-in-out" style={{ maxWidth: isOpen ? '300px' : '0px', opacity: isOpen ? 1 : 0, visibility: isOpen ? 'visible' : 'hidden' }}>
        <div className="flex items-center pr-4 gap-1">
          {['title', 'system'].map(opt => <button key={opt} onClick={() => setSortBy(opt)} className="px-3 py-1 rounded-lg text-sm font-medium h-9 capitalize transition-all active:scale-95" style={{ backgroundColor: sortBy === opt ? colors.highlight : colors.midDark, color: sortBy === opt ? colors.darkBg : colors.softLight }}>{opt}</button>)}
          <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="px-3 h-9 rounded-lg flex items-center justify-center transition-all active:scale-95" style={{ backgroundColor: colors.midDark, color: colors.softLight }}>{sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}</button>
        </div>
      </div>
    </div>
  );
});

const Toast = memo(({ message, isVisible }: any) => (
  <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-4 rounded-lg shadow-2xl z-60 bg-red-500 text-white flex items-center gap-2 transition-opacity duration-300 ${isVisible ? 'animate-fade-in' : 'animate-fade-out'}`} style={{ pointerEvents: isVisible ? 'auto' : 'none' }}><XCircle className="w-5 h-5" /><span className="font-semibold">{message}</span></div>
));

const Footer = memo(({ colors, isSidebarOpen, onToggleSidebar }: any) => (
  <footer className="fixed bottom-0 left-0 right-0 h-16 border-t flex items-center px-6 z-50" style={{ backgroundColor: colors.midDark, borderColor: colors.sidebarHover, boxShadow: '0 -4px 12px rgba(0,0,0,0.3)' }}>
    <button className="p-2.5 rounded-lg transition-all hover:bg-opacity-50" onClick={onToggleSidebar} style={{ color: colors.softLight, backgroundColor: isSidebarOpen ? colors.sidebarHover : 'transparent' }}>{isSidebarOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}</button>
  </footer>
));

const Sidebar = memo(({ isOpen, activeView, colors, onNavClick }: any) => (
  <aside className={`w-64 p-6 flex flex-col shadow-xl fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`} style={{ backgroundColor: colors.midDark, boxShadow: '4px 0 12px rgba(0,0,0,0.3)' }}>
    <div className="flex items-center gap-3 mb-12 pb-6 border-b animate-fade-in" style={{ borderColor: colors.highlight + '30' }}>
      <img src="/favicon.ico" alt="Joe T" className="w-12 h-12 flex-shrink-0" />
      <h2 className="text-2xl font-extrabold bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${colors.softLight}, ${colors.highlight})` }}>Joe T Emulator</h2>
    </div>
    <nav>
      {NAV_ITEMS.map(({ view, icon: Icon, label }, idx) => (
        <button key={view} onClick={() => onNavClick(view)} className="w-full p-3 mb-2 rounded-lg transition-all flex items-center hover:translate-x-1 hover:bg-opacity-50" style={{ backgroundColor: activeView === view ? colors.sidebarHover : 'transparent', borderLeft: activeView === view ? `4px solid ${colors.highlight}` : '4px solid transparent', color: colors.softLight, animation: `fadeInSlide 0.3s ease-out ${idx * 0.1}s both` }}>
          <Icon className="w-6 h-6 mr-3 transition-transform" /><span className="font-semibold">{label}</span>
        </button>
      ))}
    </nav>
  </aside>
));

const ThemeGrid = memo(({ colors, selectedTheme, onSelectTheme, animKey }: any) => (
  <div>
    <div key={animKey} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(THEMES).map(([name, t]: [string, any], idx) => (
        <button key={name} onClick={() => onSelectTheme(name)} className="p-6 rounded-xl border-2 relative overflow-hidden animate-card-enter text-left transition-all hover:shadow-lg"
          style={{ backgroundColor: t.midDark, borderColor: selectedTheme === name ? t.play : t.highlight + '40', boxShadow: selectedTheme === name ? `0 2px 8px ${t.play}30` : '0 2px 4px rgba(0,0,0,0.2)', animationDelay: `${idx * 0.05}s` }}>
          <div className="flex justify-between mb-4">
            <h3 className="text-xl font-bold capitalize" style={{ color: t.softLight }}>{name}</h3>
            {selectedTheme === name && <CircleCheck className="w-6 h-6" style={{ color: t.play }} />}
          </div>
          <div className="flex gap-2">
            {[t.darkBg, t.midDark, t.play, t.highlight].map((c, i) => <div key={i} className="flex-1 h-12 rounded-lg" style={{ backgroundColor: c }} />)}
          </div>
        </button>
      ))}
    </div>
  </div>
));

const SystemPickerModal = memo(({ isOpen, isClosing, colors, gradient, editingGame, pendingGame, pendingFiles, searchQuery, onSearchChange, onClose, onDone, onSelectSystem, coverArtState, isProcessing, pendingBatchCore }: any) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const categories = useMemo(() => {
    const filtered: Record<string, Array<[string, string]>> = {};
    Object.entries(SYSTEM_PICKER).forEach(([cat, systems]) => {
      const matches = Object.entries(systems).filter(([name]) => name.toLowerCase().includes(searchQuery.toLowerCase()));
      if (matches.length) filtered[cat] = matches;
    });
    return filtered;
  }, [searchQuery]);

  const currentCore = editingGame?.core || (pendingFiles.length > 1 ? pendingBatchCore : pendingGame?.core);
  const showCoverArt = pendingFiles.length <= 1;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose} style={{ animation: isClosing ? 'fadeOut 0.2s ease-out forwards' : 'fadeIn 0.2s ease-out forwards' }}>
      <div className="p-6 rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl border overflow-hidden" style={{ backgroundColor: colors.darkBg, borderColor: colors.midDark, boxShadow: '0 20px 60px rgba(0,0,0,0.7)', animation: isClosing ? 'fadeOut 0.2s ease-out forwards' : 'fadeIn 0.3s ease-out forwards' }} onClick={e => e.stopPropagation()}>
        <div className="mb-6"><h3 className="text-3xl font-bold mb-2" style={{ color: colors.softLight }}>{editingGame ? editingGame.title : pendingFiles.length > 1 ? `Add ${pendingFiles.length} Games` : 'Select System'}</h3><p className="text-sm opacity-70" style={{ color: colors.highlight }}>{editingGame ? 'Choose system and cover art' : pendingFiles.length > 1 ? `Choose system for ${pendingFiles.length} files` : 'Select a system'}</p></div>
        <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
          {showCoverArt && (
            <div className="flex-shrink-0 w-full xl:w-80 space-y-4 max-h-[60vh] xl:max-h-full overflow-y-auto">
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: colors.midDark, backgroundColor: colors.darkBg }}>
                {coverArtState.file ? (
                  <div className="relative group aspect-[4/5] bg-black/20">
                    <img src={coverArtState.file} alt="Cover" className="w-full h-full" style={{ objectFit: coverArtState.fit, objectPosition: 'center' }} />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={coverArtState.onRemove} className="p-2.5 rounded-lg hover:shadow-md active:scale-95 transition-all" style={{ backgroundColor: '#ef4444', color: colors.softLight }}><Trash2 className="w-5 h-5" /></button></div>
                  </div>
                ) : (
                  <div className="aspect-[3/4] flex items-center justify-center p-6 text-center" style={{ backgroundColor: colors.midDark }}><div><Image className="w-8 h-8 mx-auto mb-4" style={{ color: colors.highlight }} /><p className="text-sm font-medium" style={{ color: colors.softLight }}>No Cover Art</p></div></div>
                )}
                {coverArtState.file && <div className="p-4 border-t" style={{ borderColor: colors.highlight + '30' }}><button onClick={() => coverArtState.onFitChange(coverArtState.fit === 'contain' ? 'cover' : 'contain')} className="w-full py-2.5 rounded-lg text-sm font-semibold active:scale-95 transition-all" style={{ backgroundColor: colors.highlight, color: colors.darkBg }}>{coverArtState.fit === 'contain' ? 'Zoom to Fill' : 'Shrink to Fit'}</button></div>}
                <div className="p-4 border-t" style={{ borderColor: colors.highlight + '30' }}>
                  <input type="file" accept="image/*" className="hidden" id="art-upload" onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => coverArtState.onUpload(ev.target?.result); r.readAsDataURL(f); } e.target.value = ''; }} />
                  <label htmlFor="art-upload" className="block w-full py-2.5 rounded-lg text-sm font-semibold text-center active:scale-95 transition-all" style={{ ...(coverArtState.file ? { backgroundColor: colors.highlight } : gradient), color: colors.darkBg }}>{coverArtState.file ? 'Change Image' : 'Upload Cover Art'}</label>
                </div>
              </div>
            </div>
          )}
          <div className="flex-1 flex flex-col min-w-0">
            <SearchBar colors={colors} value={searchQuery} onChange={onSearchChange} isFocused={isSearchFocused} onFocus={() => setIsSearchFocused(true)} onBlur={() => setIsSearchFocused(false)} inputRef={null} />
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide mt-4">
              {Object.entries(categories).map(([cat, systems]) => (
                <div key={cat} className="mb-6 last:mb-0">
                  <div className="flex items-center mb-3"><h4 className="text-xs font-bold uppercase tracking-wider pr-3" style={{ color: colors.highlight }}>{cat}</h4><div className="flex-1 h-px" style={{ backgroundColor: colors.highlight + '30' }} /></div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {systems.map(([name, core]: any, idx) => {
                      const isSel = currentCore === core;
                      return (
                        <button key={core} onClick={() => onSelectSystem(core)} className="p-3.5 rounded-xl text-left border-2 flex items-center justify-between group transition-all active:scale-95" style={{ backgroundColor: isSel ? colors.highlight : colors.midDark, borderColor: isSel ? colors.highlight : colors.midDark, color: isSel ? colors.darkBg : colors.softLight, animation: `fadeIn 0.4s ease-out ${idx * 0.03}s both` }}>
                          <span className="font-medium text-sm truncate pr-2 flex-1">{name}</span>{isSel && <CircleCheck className="w-5 h-5 flex-shrink-0 transition-all" style={{ color: colors.darkBg }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: colors.midDark }}>
          {(editingGame || pendingFiles.length > 0) && <button onClick={onDone} disabled={isProcessing} className="py-2.5 px-6 rounded-lg font-semibold active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50" style={{ ...gradient, color: colors.darkBg }}><span>Done</span></button>}
          <button onClick={onClose} disabled={isProcessing} className="py-2.5 px-6 rounded-lg font-semibold active:scale-95 transition-all disabled:opacity-50" style={{ backgroundColor: colors.highlight, color: colors.darkBg }}>{editingGame ? 'Cancel' : 'Close'}</button>
        </div>
      </div>
    </div>
  );
});