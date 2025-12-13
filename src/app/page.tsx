"use client";

import { useEffect, useCallback, useState } from 'react';
import { Game } from '@/types';
import { GameCard } from '@/components/gamecard';
import { Sidebar } from '@/components/sidebar';
import { SearchBar } from '@/components/searchbar';
import { SystemPickerModal } from '@/components/systempicker';
import { EmulatorNotification } from '@/components/emulatornotification';
import { SortControls } from '@/components/sortcontrols';
import { ThemeGrid } from '@/components/themegrid';
import { SettingsView } from '@/components/settingsview';
import { Trash2, Gamepad2 } from 'lucide-react';
import { Alert } from '@/components/alert';
import { useGameLibrary } from '@/hooks/useGameLibrary';
import { useUIState } from '@/hooks/useUIState';
import { useGameOperations } from '@/hooks/useGameOperations';
import { useFileHandler } from '@/hooks/useFileHandler';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useGameList } from '@/hooks/useGameList';
import { useGameLauncher } from '@/hooks/useGameLauncher';
import { useGameDeletion } from '@/hooks/useGameDeletion';
import { useSystemPickerFlow } from '@/hooks/useSystemPickerFlow';
import { selectFiles } from '@/lib/files';

const FONT_FAMILY = 'Lexend, sans-serif';
const GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))',
  gap: 'clamp(1rem, 2vw, 1.5rem)',
  width: '100%',
} as const;

export default function Home() {
  const lib = useGameLibrary();
  const ui = useUIState();
  const ops = useGameOperations();
  const settings = useAppSettings();
  const files = useFileHandler(lib.games, lib.addGame, ops);
  const view = useGameList(lib.games, files.uploads, ui.gameSearchQuery, settings.sortBy, settings.sortOrder);
  const launcher = useGameLauncher(settings);
  const deletion = useGameDeletion(lib, ui);
  const pickerFlow = useSystemPickerFlow(ops, lib, files);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    ui.setIsMounted(true);
    lib.loadGamesFromStorage();
    const timer = setTimeout(() => setIsInitialLoad(false), 2000);
    return () => clearTimeout(timer);
  }, [lib.loadGamesFromStorage, ui.setIsMounted]);

  useEffect(() => {
    if (ui.activeView === 'themes') ui.setThemeAnimationKey(k => k + 1);
  }, [ui.activeView, ui.setThemeAnimationKey]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.dataTransfer?.types.includes('Files')) {
      ui.dragCounterRef.current++;
      e.dataTransfer.dropEffect = 'copy';
    }
  }, [ui]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    ui.dragCounterRef.current--;
  }, [ui]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    ui.dragCounterRef.current = 0;
    if (e.dataTransfer) await files.handleIncomingFiles(ops.extractFilesFromDataTransfer(e.dataTransfer));
  }, [ui, files, ops]);

  const renderGameCard = useCallback((g: Game, i: number) => (
    <div key={g.id} className={ui.deletingGameIds.has(g.id) ? 'animate-card-exit' : 'animate-card-enter'}
      style={{ animationDelay: ui.deletingGameIds.has(g.id) ? '0s' : isInitialLoad ? `${i * 0.05}s` : '0s' }}>
      <GameCard
        game={g}
        isSelected={ui.selectedGameIds.has(g.id)}
        onPlay={launcher.handlePlayClick}
        onDelete={deletion.handleDeleteGame}
        onSelect={ui.toggleGameSelection}
        isDeleteMode={ui.isDeleteMode}
        onEnterDeleteMode={() => ui.setIsDeleteMode(true)}
        colors={settings.currentColors}
        onEdit={pickerFlow.handleEditGame}
        onCoverArtClick={pickerFlow.handleEditGame}
      />
    </div>
  ), [ui.deletingGameIds, ui.selectedGameIds, isInitialLoad, launcher.handlePlayClick, deletion.handleDeleteGame, ui.toggleGameSelection, ui.isDeleteMode, ui.setIsDeleteMode, settings.currentColors, pickerFlow.handleEditGame]);

  if (!ui.isMounted || !settings.isHydrated) return <div className="min-h-screen" style={{ backgroundColor: '#0a0a0f', fontFamily: FONT_FAMILY }} />;

  return (
    <div className={`min-h-screen flex ${settings.snappyAnimations ? 'snappy-animations' : ''}`} style={{ backgroundColor: settings.currentColors.darkBg, fontFamily: FONT_FAMILY }}>
      <Sidebar
        activeView={ui.activeView}
        colors={settings.currentColors}
        gradient={settings.gradientStyle}
        onNavClick={ui.setActiveView}
        onAddGame={async () => {
          try {
            const f = await selectFiles();
            await files.handleIncomingFiles(f);
          } catch (err: any) { if (err?.name !== 'AbortError') console.error(err); }
        }}
      />

      <div className="flex-1 overflow-hidden ml-20">
        <main
          className="pt-6 pb-4 px-4 sm:pb-6 sm:px-6 md:pb-8 md:px-8 overflow-y-auto scrollbar-hide"
          style={{ minHeight: '100vh' }}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <header className="mb-[32px] flex flex-col md:flex-row justify-between gap-6 md:items-center md:h-12">
            <h1 className="text-4xl font-extrabold tracking-tight capitalize" style={{ color: settings.currentColors.softLight, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
              {ui.activeView}
              {ui.activeView === 'library' && <span className="ml-3">({view.sortedGames.length})</span>}
            </h1>
            {ui.activeView === 'library' && (
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <div className="flex gap-3 items-center w-full md:w-auto">
                  <div className="flex-1 md:flex-initial md:w-[340px] min-w-0">
                    <SearchBar
                      colors={settings.currentColors}
                      value={ui.gameSearchQuery}
                      onChange={ui.setGameSearchQuery}
                      isFocused={ui.gameSearchFocused}
                      onFocus={() => ui.setGameSearchFocused(true)}
                      onBlur={() => ui.setGameSearchFocused(false)}
                      inputRef={ui.gameSearchInputRef}
                    />
                  </div>
                  <SortControls
                    colors={settings.currentColors}
                    sortBy={settings.sortBy}
                    setSortBy={settings.setSortBy}
                    sortOrder={settings.sortOrder}
                    setSortOrder={settings.setSortOrder}
                  />
                </div>
                {ui.isDeleteMode && (
                  <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={deletion.onMassDelete} disabled={!ui.selectedGameIds.size} className="flex-1 md:flex-none px-5 py-2.5 rounded-xl h-12 flex items-center justify-center text-white bg-red-500 transition-all active:scale-95 disabled:opacity-60"><Trash2 className="w-5 h-5" /></button>
                    <button onClick={() => ui.setIsDeleteMode(false)} className="flex-1 md:flex-none px-5 py-2.5 rounded-xl font-semibold h-12 transition-all active:scale-95" style={{ backgroundColor: settings.currentColors.highlight, color: settings.currentColors.darkBg }}>Cancel</button>
                  </div>
                )}
              </div>
            )}
          </header>

          {ui.activeView === 'themes' ? (
            <ThemeGrid colors={settings.currentColors} selectedTheme={settings.selectedTheme} onSelectTheme={settings.setSelectedTheme} animKey={ui.themeAnimationKey} />
          ) : ui.activeView === 'settings' ? (
            <SettingsView
              colors={settings.currentColors} gradient={settings.gradientStyle}
              autoLoadState={settings.autoLoadState} setAutoLoadState={settings.setAutoLoadState}
              autoSaveState={settings.autoSaveState} setAutoSaveState={settings.setAutoSaveState}
              autoSaveInterval={settings.autoSaveInterval} setAutoSaveInterval={settings.setAutoSaveInterval}
              autoSaveIcon={settings.autoSaveIcon} setAutoSaveIcon={settings.setAutoSaveIcon}
              autoLoadIcon={settings.autoLoadIcon} setAutoLoadIcon={settings.setAutoLoadIcon}
              reducedMotion={settings.snappyAnimations} setReducedMotion={settings.setSnappyAnimations}
            />
          ) : lib.games.length === 0 && Object.keys(files.uploads).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in text-center">
              <div className="w-20 h-20 rounded-xl mb-6 flex items-center justify-center shadow-lg" style={{ backgroundColor: settings.currentColors.midDark, color: settings.currentColors.highlight }}><Gamepad2 className="w-10 h-10" /></div>
              <h3 className="text-xl font-bold mb-2" style={{ color: settings.currentColors.softLight }}>No games found</h3>
              <p className="mb-8 opacity-70" style={{ color: settings.currentColors.highlight }}>Add your first ROM to get started</p>
            </div>
          ) : view.sortedGames.length === 0 ? (
            <div className="text-center py-20 opacity-60"><p style={{ color: settings.currentColors.softLight }}>No games found matching "{ui.gameSearchQuery}"</p></div>
          ) : view.groupedGames ? (
            Object.entries(view.groupedGames).map(([cat, catGames]) => (
              <div key={cat} className="mb-8 last:mb-0 animate-fade-in">
                <div className="flex items-center mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider pr-3" style={{ color: settings.currentColors.highlight }}>{cat}</h4>
                  <div className="flex-1 h-px" style={{ backgroundColor: settings.currentColors.highlight + '30' }} />
                </div>
                <div style={GRID_STYLE}>{catGames.map(renderGameCard)}</div>
              </div>
            ))
          ) : (
            <div style={GRID_STYLE}>{view.sortedGames.map(renderGameCard)}</div>
          )}
        </main>
      </div>

      {ops.duplicateMessage && <Alert message={ops.duplicateMessage} isVisible={ops.showDuplicateMessage} />}
      <EmulatorNotification colors={settings.currentColors} autoSaveIcon={settings.autoSaveIcon} autoLoadIcon={settings.autoLoadIcon} />

      {(ops.systemPickerOpen || ops.systemPickerClosing) && (
        <SystemPickerModal
          isOpen={ops.systemPickerOpen} isClosing={ops.systemPickerClosing} colors={settings.currentColors} gradient={settings.gradientStyle}
          editingGame={ops.editingGame} pendingGame={ops.pendingGame} pendingFiles={ops.pendingFiles} searchQuery={ops.systemSearchQuery}
          onSearchChange={ops.setSystemSearchQuery} onClose={ops.closeSystemPicker} onDone={pickerFlow.handleSystemPickerDone}
          isProcessing={files.isProcessing} pendingBatchCore={ops.pendingBatchCore}
          onSelectSystem={pickerFlow.onSelectSystem}
          onRename={pickerFlow.onRename}
          coverArtState={{
            file: ops.editingGame ? ops.editingGame.coverArt : ops.pendingGame?.coverArt,
            fit: ops.coverArtFit,
            onFitChange: (f: any) => {
              ops.setCoverArtFit(f);
              if (ops.editingGame) { lib.updateGame(ops.editingGame.id, { coverArtFit: f }); ops.setEditingGame({ ...ops.editingGame, coverArtFit: f }); }
            },
            onUpload: (d: any) => {
              if (ops.editingGame) { lib.updateGame(ops.editingGame.id, { coverArt: d }); ops.setEditingGame({ ...ops.editingGame, coverArt: d }); }
              else if (ops.pendingGame) ops.setPendingGame({ ...ops.pendingGame, coverArt: d });
            },
            onRemove: () => {
              if (ops.editingGame) { lib.updateGame(ops.editingGame.id, { coverArt: undefined }); ops.setEditingGame({ ...ops.editingGame, coverArt: undefined }); }
              else if (ops.pendingGame) ops.setPendingGame({ ...ops.pendingGame, coverArt: undefined });
            }
          }}
        />
      )}
    </div>
  );
}