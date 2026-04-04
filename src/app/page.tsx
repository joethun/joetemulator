"use client";

import { useEffect, useCallback, useMemo } from 'react';
import { Game } from '@/types';
import { GameCard } from '@/components/gamecard';
import { Sidebar } from '@/components/sidebar';
import { SearchBar } from '@/components/searchbar';
import { EmulatorNotification } from '@/components/emulatornotification';
import { SortControls } from '@/components/sortcontrols';
import { Alert } from '@/components/alert';
import { Gamepad2 } from 'lucide-react';
import { useGameLibrary } from '@/hooks/useGameLibrary';
import { useApp } from '@/hooks/useApp';
import { useFileHandler } from '@/hooks/useFileHandler';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useGameList } from '@/hooks/useGameList';
import { useGameLauncher } from '@/hooks/useGameLauncher';
import { useSystemPickerFlow } from '@/hooks/useSystemPickerFlow';
import { useDragDrop } from '@/hooks/useDragDrop';
import { selectFiles } from '@/lib/files';
import { SystemPickerModal } from '@/components/systempicker';
import { SaveStateManager } from '@/components/savestatemanager';
import { ThemeGrid } from '@/components/themegrid';
import { SettingsView } from '@/components/settingsview';

const GRID_CLASS = "grid gap-4 md:gap-6 w-full grid-cols-[repeat(auto-fill,minmax(min(150px,100%),1fr))] md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]";

export default function Home() {
    const lib = useGameLibrary();
    const app = useApp();
    const settings = useAppSettings();
    const files = useFileHandler(lib.games, lib.addGame, app);
    const view = useGameList(lib.games, files.uploads, app.gameSearchQuery, settings.sortOrder);
    const launcher = useGameLauncher(settings);
    const pickerFlow = useSystemPickerFlow(app, lib, files);
    const drag = useDragDrop(files.handleIncomingFiles);

    const { currentColors, gradientStyle, sortOrder, setSortOrder, selectedTheme, setSelectedTheme, isHydrated } = settings;
    const {
        isMounted, setIsMounted, activeView, setActiveView,
        themeAnimationKey, libraryAnimationKey,
        gameSearchQuery, setGameSearchQuery, gameSearchFocused, setGameSearchFocused, gameSearchInputRef,
        duplicateMessage, showDuplicateMessage, systemPickerOpen, systemPickerClosing,
        editingGame, pendingGame, pendingFiles, systemSearchQuery, setSystemSearchQuery,
        closeSystemPicker, pendingBatchCore,
        saveStateGame, saveStateOpen, saveStateClosing, openSaveStateManager, closeSaveStateManager,
    } = app;

    useEffect(() => {
        setIsMounted(true);
        lib.loadGamesFromStorage();
    }, []);

    const handleAddGame = useCallback(async () => {
        try {
            const selected = await selectFiles();
            await files.handleIncomingFiles(selected);
        } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError') console.error(err);
        }
    }, [files]);

    const handleUploadCover = useCallback((id: number, data: string) => lib.updateGame(id, { coverArt: data }), [lib]);
    const handleResetCover = useCallback((id: number) => {
        const game = lib.games.find(x => x.id === id);
        if (game?.autoCoverArt) lib.updateGame(id, { coverArt: game.autoCoverArt });
    }, [lib]);

    const handleDeleteGame = useCallback(async (game: Game) => {
        if (!confirm(`Delete "${game.title}"?`)) return;
        await lib.deleteGame(game.id);
    }, [lib]);

    const renderGameCard = useCallback((g: Game, i: number) => (
        <div key={g.id} style={{ animation: `fadeIn 0.4s ease-out ${i * 0.03}s both` }}>
            <GameCard
                game={g}
                onPlay={launcher.handlePlayClick}
                onDelete={handleDeleteGame}
                onUploadCover={handleUploadCover}
                onResetCover={handleResetCover}
                colors={currentColors}
                onEdit={pickerFlow.handleEditGame}
                onSaveStates={openSaveStateManager}
                priority={i < 6}
            />
        </div>
    ), [launcher, pickerFlow, currentColors, handleDeleteGame, handleUploadCover, handleResetCover, openSaveStateManager]);

    const mainContent = useMemo(() => {
        if (activeView === 'themes')
            return <ThemeGrid selectedTheme={selectedTheme} onSelectTheme={setSelectedTheme} animKey={themeAnimationKey} />;

        if (activeView === 'settings')
            return (
                <SettingsView
                    colors={currentColors} gradient={gradientStyle}
                    autoLoadState={settings.autoLoadState} setAutoLoadState={settings.setAutoLoadState}
                    autoSaveState={settings.autoSaveState} setAutoSaveState={settings.setAutoSaveState}
                    autoSaveInterval={settings.autoSaveInterval} setAutoSaveInterval={settings.setAutoSaveInterval}
                    autoSaveIcon={settings.autoSaveIcon} setAutoSaveIcon={settings.setAutoSaveIcon}
                    autoLoadIcon={settings.autoLoadIcon} setAutoLoadIcon={settings.setAutoLoadIcon}
                />
            );

        if (!lib.games.length && !Object.keys(files.uploads).length)
            return (
                <div className="flex flex-col items-center justify-center py-20 animate-fade-in text-center">
                    <div className="w-20 h-20 rounded-xl mb-6 flex items-center justify-center shadow-lg" style={{ backgroundColor: currentColors.midDark, color: currentColors.highlight }}>
                        <Gamepad2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: currentColors.softLight }}>No games found</h3>
                    <p className="mb-8 opacity-70" style={{ color: currentColors.highlight }}>Add your ROMs by clicking the + button in the sidebar</p>
                </div>
            );

        if (!view.sortedGames.length)
            return (
                <div className="text-center py-20 opacity-60">
                    <p style={{ color: currentColors.softLight }}>No games found matching &quot;{gameSearchQuery}&quot;</p>
                </div>
            );

        let globalIndex = 0;
        return (
            <div key={libraryAnimationKey}>
                {Object.entries(view.groupedGames).map(([cat, catGames]) => (
                    <div key={cat} className="mb-8 last:mb-0 animate-fade-in">
                        <div className="flex items-center mb-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider pr-3" style={{ color: currentColors.highlight }}>{cat}</h4>
                            <div className="flex-1 h-px" style={{ backgroundColor: `${currentColors.highlight}30` }} />
                        </div>
                        <div className={GRID_CLASS}>{catGames.map((g) => renderGameCard(g, globalIndex++))}</div>
                    </div>
                ))}
            </div>
        );
    }, [activeView, currentColors, selectedTheme, setSelectedTheme, themeAnimationKey, gradientStyle, settings,
        lib.games, files.uploads, view, gameSearchQuery, libraryAnimationKey, renderGameCard]);

    if (!isMounted || !isHydrated)
        return <div className="min-h-screen" style={{ backgroundColor: '#0a0a0f' }} />;

    return (
        <div className="min-h-screen flex font-[family-name:var(--font-lexend)]" style={{ backgroundColor: currentColors.darkBg }}>
            <Sidebar
                activeView={activeView}
                colors={currentColors}
                gradient={gradientStyle}
                onNavClick={setActiveView}
                onAddGame={handleAddGame}
            />

            <div className="flex-1 overflow-hidden md:ml-20">
                <main
                    className="pt-6 pb-20 px-4 sm:px-6 md:pb-8 md:px-8 overflow-y-auto min-h-screen"
                    onDragOver={drag.handleDragOver}
                    onDrop={drag.handleDrop}
                >
                    <header className="mb-8 flex flex-col md:flex-row justify-between gap-6 md:items-center md:h-12">
                        <h1 className="text-4xl font-extrabold tracking-tight capitalize" style={{ color: currentColors.softLight, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                            {activeView}
                            {activeView === 'library' && <span className="ml-3">({view.sortedGames.length})</span>}
                        </h1>

                        {activeView === 'library' && (
                            <div className="flex gap-3 items-center w-full md:w-auto">
                                <div className="flex-1 md:flex-initial md:w-[340px] min-w-0">
                                    <SearchBar
                                        colors={currentColors}
                                        value={gameSearchQuery}
                                        onChange={setGameSearchQuery}
                                        isFocused={gameSearchFocused}
                                        onFocus={() => setGameSearchFocused(true)}
                                        onBlur={() => setGameSearchFocused(false)}
                                        inputRef={gameSearchInputRef}
                                    />
                                </div>
                                <SortControls colors={currentColors} sortOrder={sortOrder} setSortOrder={setSortOrder} />
                            </div>
                        )}
                    </header>

                    {mainContent}
                </main>
            </div>

            {duplicateMessage && <Alert message={duplicateMessage} isVisible={showDuplicateMessage} />}
            <EmulatorNotification colors={currentColors} autoSaveIcon={settings.autoSaveIcon} autoLoadIcon={settings.autoLoadIcon} />

            {(systemPickerOpen || systemPickerClosing) && (
                <SystemPickerModal
                    isOpen={systemPickerOpen}
                    isClosing={systemPickerClosing}
                    colors={currentColors}
                    gradient={gradientStyle}
                    editingGame={editingGame}
                    pendingGame={pendingGame}
                    pendingFiles={pendingFiles}
                    searchQuery={systemSearchQuery}
                    onSearchChange={setSystemSearchQuery}
                    onClose={closeSystemPicker}
                    onDone={pickerFlow.handleSystemPickerDone}
                    isProcessing={files.isProcessing}
                    pendingBatchCore={pendingBatchCore}
                    onSelectSystem={pickerFlow.onSelectSystem}
                    onRename={pickerFlow.onRename}
                />
            )}
            {(saveStateOpen || saveStateClosing) && saveStateGame && (
                <SaveStateManager
                    isOpen={saveStateOpen}
                    isClosing={saveStateClosing}
                    colors={currentColors}
                    gradient={gradientStyle}
                    gameTitle={saveStateGame.title}
                    gameName={saveStateGame.name}
                    onClose={closeSaveStateManager}
                    onDuplicateError={app.showDuplicateError}
                />
            )}
        </div>
    );
}
