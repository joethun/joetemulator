"use client";

import { useEffect, useCallback, useState, memo } from 'react';
import { Game, THEMES } from '@/types';
import { GameCard } from '@/components/gamecard';
import { Sidebar } from '@/components/sidebar';
import { SearchBar } from '@/components/searchbar';
import { SystemPickerModal } from '@/components/systempicker';
import { EmulatorNotification } from '@/components/emulatornotification';
import {
  Trash2, ArrowUp, ArrowDown, ListFilter,
  Save, Clock, Eye, EyeOff, Gamepad2, CircleCheck, Zap
} from 'lucide-react';
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

const FONT_FAMILY = 'Lexend, sans-serif';
const GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))',
  gap: 'clamp(1rem, 2vw, 1.5rem)',
  width: '100%',
} as const;

async function selectFiles(): Promise<File[]> {
  if ('showOpenFilePicker' in window) {
    // @ts-ignore
    const handles = await window.showOpenFilePicker({ multiple: true });
    return Promise.all(handles.map((fh: any) => fh.getFile()));
  }

  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e: any) => resolve(Array.from(e.target.files || []));
    input.click();
  });
}

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
      ui.setIsDragActive(true);
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
    if (ui.dragCounterRef.current === 0) ui.setIsDragActive(false);
  }, [ui]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    ui.dragCounterRef.current = 0;
    ui.setIsDragActive(false);
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

// sort controls dropdown
const SortControls = memo(({ colors, sortBy, setSortBy, sortOrder, setSortOrder }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative z-40">
      {isOpen && <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />}
      <button onClick={() => setIsOpen(!isOpen)} className="relative z-40 flex items-center rounded-xl border-[0.125rem] h-12 px-3 transition-all duration-300" style={{ backgroundColor: colors.darkBg, borderColor: isOpen ? colors.highlight : colors.midDark, color: isOpen ? colors.highlight : colors.softLight, boxShadow: isOpen ? `0 0 0 2px ${colors.highlight}30` : 'none' }}>
        <ListFilter className="w-5 h-5" />
      </button>
      <div className="absolute top-full mt-2 right-0 z-40 rounded-xl border-[0.125rem] overflow-hidden transition-all duration-300 origin-top" style={{ backgroundColor: colors.darkBg, borderColor: colors.midDark, maxHeight: isOpen ? '200px' : '0px', opacity: isOpen ? 1 : 0, visibility: isOpen ? 'visible' : 'hidden', boxShadow: isOpen ? '0 4px 12px rgba(0,0,0,0.3)' : 'none' }}>
        <div className="p-3 space-y-2 min-w-[160px]">
          <div className="flex flex-col gap-1">
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1 px-1 opacity-70" style={{ color: colors.softLight }}>Sort By</div>
            {['title', 'system'].map(opt => (
              <button key={opt} onClick={() => { setSortBy(opt); setIsOpen(false); }} className="px-3 py-2 rounded-xl text-sm font-medium capitalize transition-all active:scale-95 text-left" style={{ backgroundColor: sortBy === opt ? colors.highlight : colors.midDark, color: sortBy === opt ? colors.darkBg : colors.softLight }}>{opt}</button>
            ))}
          </div>
          <div className="h-px" style={{ backgroundColor: colors.highlight + '30' }} />
          <div className="flex flex-col gap-1">
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1 px-1 opacity-70" style={{ color: colors.softLight }}>Order</div>
            <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all active:scale-95" style={{ backgroundColor: colors.midDark, color: colors.softLight }}>
              {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
SortControls.displayName = 'SortControls';

// theme selection grid
const ThemeGrid = memo(({ colors, selectedTheme, onSelectTheme, animKey }: any) => (
  <div key={animKey} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Object.entries(THEMES).map(([name, t]: [string, any], idx) => (
      <button key={name} onClick={() => onSelectTheme(name)} className="p-6 rounded-xl border-[0.125rem] relative overflow-hidden text-left transition-all hover:shadow-lg" style={{ backgroundColor: t.midDark, borderColor: selectedTheme === name ? t.play : t.highlight + '40', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', animation: `fadeIn 0.4s ease-out ${idx * 0.03}s both` }}>
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-bold capitalize" style={{ color: t.softLight }}>{name}</h3>
          {selectedTheme === name && <CircleCheck className="w-6 h-6" style={{ color: t.play }} />}
        </div>
        <div className="flex gap-2">
          {[t.darkBg, t.midDark, t.play, t.highlight].map((c: string, i: number) => <div key={i} className="flex-1 h-12 rounded-xl" style={{ backgroundColor: c }} />)}
        </div>
      </button>
    ))}
  </div>
));
ThemeGrid.displayName = 'ThemeGrid';

// toggle switch for settings
const SettingsSwitch = memo(({ checked, onChange, colors, gradient }: any) => (
  <button role="switch" aria-checked={checked} onClick={onChange} className={`relative inline-flex h-8 w-14 flex-shrink-0 rounded-full border-2 transition-colors duration-200 items-center ${checked ? 'border-transparent' : ''}`} style={{ backgroundColor: checked ? 'transparent' : colors.darkBg, borderColor: checked ? 'transparent' : colors.midDark, backgroundImage: checked ? gradient.backgroundImage : 'none', boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.3)' }}>
    <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full shadow transition duration-200 ml-0.5 ${checked ? 'translate-x-6' : 'translate-x-0'}`} style={{ backgroundColor: checked ? colors.darkBg : colors.softLight }} />
  </button>
));
SettingsSwitch.displayName = 'SettingsSwitch';

// settings page content
const SettingsView = memo(({ colors, gradient, autoLoadState, setAutoLoadState, autoSaveState, setAutoSaveState, autoSaveInterval, setAutoSaveInterval, autoSaveIcon, setAutoSaveIcon, autoLoadIcon, setAutoLoadIcon, reducedMotion, setReducedMotion }: any) => (
  <div className="animate-fade-in w-full grid gap-4">
    <div className="p-4 sm:p-6 rounded-xl border-[0.125rem] flex flex-col" style={{ backgroundColor: colors.darkBg, borderColor: colors.midDark, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', animation: 'fadeIn 0.4s ease-out both' }}>
      <div className="flex items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-5 overflow-hidden">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.midDark, color: colors.highlight }}><Clock className="w-5 h-5 sm:w-6 sm:h-6" /></div>
          <div className="flex-1 min-w-0"><h3 className="text-base sm:text-lg font-bold leading-tight mb-1" style={{ color: colors.softLight }}>Auto-Save State</h3><p className="text-xs sm:text-sm leading-relaxed opacity-70" style={{ color: colors.softLight }}>Automatically save your game state periodically.</p></div>
        </div>
        <SettingsSwitch checked={autoSaveState} onChange={() => setAutoSaveState(!autoSaveState)} colors={colors} gradient={gradient} />
      </div>
      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: autoSaveState ? '300px' : '0px', opacity: autoSaveState ? 1 : 0, marginTop: autoSaveState ? '1.5rem' : '0px', visibility: autoSaveState ? 'visible' : 'hidden' }}>
        <div className="pt-4 border-t space-y-4 pl-0 sm:pl-16" style={{ borderColor: colors.highlight + '30' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3"><Clock className="w-4 h-4" style={{ color: colors.highlight }} /><span className="text-sm font-medium" style={{ color: colors.softLight }}>Save Interval</span></div>
            <div className="flex flex-wrap items-center gap-2">{[15, 30, 45, 60].map(v => (
              <button key={v} onClick={() => setAutoSaveInterval(v)} className="px-3 py-1 rounded-xl text-sm font-medium h-9 transition-all active:scale-95 flex items-center justify-center flex-1 sm:flex-none" style={{ backgroundColor: autoSaveInterval === v ? colors.highlight : colors.midDark, color: autoSaveInterval === v ? colors.darkBg : colors.softLight }}>{v}s</button>
            ))}</div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">{autoSaveIcon ? <Eye className="w-4 h-4" style={{ color: colors.highlight }} /> : <EyeOff className="w-4 h-4" style={{ color: colors.highlight }} />}<span className="text-sm font-medium" style={{ color: colors.softLight }}>Show Save Icon</span></div>
            <SettingsSwitch checked={autoSaveIcon} onChange={() => setAutoSaveIcon(!autoSaveIcon)} colors={colors} gradient={gradient} />
          </div>
        </div>
      </div>
    </div>
    <div className="p-4 sm:p-6 rounded-xl border-[0.125rem] flex flex-col" style={{ backgroundColor: colors.darkBg, borderColor: colors.midDark, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', animation: 'fadeIn 0.4s ease-out 0.03s both' }}>
      <div className="flex items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-5 overflow-hidden">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.midDark, color: colors.highlight }}><Save className="w-5 h-5 sm:w-6 sm:h-6" /></div>
          <div className="flex-1 min-w-0"><h3 className="text-base sm:text-lg font-bold leading-tight mb-1" style={{ color: colors.softLight }}>Auto-Load State</h3><p className="text-xs sm:text-sm leading-relaxed opacity-70" style={{ color: colors.softLight }}>Resume gameplay from your last state automatically.</p></div>
        </div>
        <SettingsSwitch checked={autoLoadState} onChange={() => setAutoLoadState(!autoLoadState)} colors={colors} gradient={gradient} />
      </div>
      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: autoLoadState ? '200px' : '0px', opacity: autoLoadState ? 1 : 0, marginTop: autoLoadState ? '1.5rem' : '0px', visibility: autoLoadState ? 'visible' : 'hidden' }}>
        <div className="pt-4 border-t pl-0 sm:pl-16" style={{ borderColor: colors.highlight + '30' }}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">{autoLoadIcon ? <Eye className="w-4 h-4" style={{ color: colors.highlight }} /> : <EyeOff className="w-4 h-4" style={{ color: colors.highlight }} />}<span className="text-sm font-medium" style={{ color: colors.softLight }}>Show Load Icon</span></div>
            <SettingsSwitch checked={autoLoadIcon} onChange={() => setAutoLoadIcon(!autoLoadIcon)} colors={colors} gradient={gradient} />
          </div>
        </div>
      </div>
    </div>
    <div className="p-4 sm:p-6 rounded-xl border-[0.125rem] flex flex-col" style={{ backgroundColor: colors.darkBg, borderColor: colors.midDark, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', animation: 'fadeIn 0.4s ease-out 0.06s both' }}>
      <div className="flex items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-5 overflow-hidden">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.midDark, color: colors.highlight }}><Zap className="w-5 h-5 sm:w-6 sm:h-6" /></div>
          <div className="flex-1 min-w-0"><h3 className="text-base sm:text-lg font-bold leading-tight mb-1" style={{ color: colors.softLight }}>Snappy Animations</h3><p className="text-xs sm:text-sm leading-relaxed opacity-70" style={{ color: colors.softLight }}>Speed up animations for a faster experience.</p></div>
        </div>
        <SettingsSwitch checked={reducedMotion} onChange={() => setReducedMotion(!reducedMotion)} colors={colors} gradient={gradient} />
      </div>
    </div>
  </div>
));
SettingsView.displayName = 'SettingsView';