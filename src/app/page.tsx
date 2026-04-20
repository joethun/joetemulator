"use client";

import { useEffect } from 'react';
import { useGameLibrary } from '@/hooks/useGameLibrary';
import { useApp } from '@/hooks/useApp';
import { useFileHandler } from '@/hooks/useFileHandler';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useGameList } from '@/hooks/useGameList';
import { useGameLauncher } from '@/hooks/useGameLauncher';
import { useSystemPickerFlow } from '@/hooks/useSystemPickerFlow';
import { useDragDrop } from '@/hooks/useDragDrop';
import { useGameActions } from '@/hooks/useGameActions';
import { Sidebar } from '@/components/sidebar';
import { SearchBar } from '@/components/searchbar';
import { SortControls } from '@/components/sortcontrols';
import { Alert } from '@/components/alert';
import { EmulatorNotification } from '@/components/emulatornotification';
import { SystemPickerModal } from '@/components/systempicker';
import { SaveStateManager } from '@/components/savestatemanager';
import { MainContent } from '@/components/maincontent';

export default function Home() {
    const lib = useGameLibrary();
    const app = useApp();
    const settings = useAppSettings();
    const files = useFileHandler(lib.games, lib.addGame, app);
    const view = useGameList(lib.games, files.uploads, app.gameSearchQuery, settings.sortOrder);
    const launcher = useGameLauncher(settings);
    const pickerFlow = useSystemPickerFlow(app, lib, files);
    const drag = useDragDrop(files.handleIncomingFiles);
    const actions = useGameActions(lib, files);

    useEffect(() => {
        app.setIsMounted(true);
        lib.loadGamesFromStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!app.isMounted || !settings.isHydrated)
        return <div className="min-h-screen" style={{ backgroundColor: '#0a0a0f' }} />;

    return (
        <div className="min-h-screen flex font-[family-name:var(--font-lexend)]" style={{ backgroundColor: settings.currentColors.darkBg }}>
            <Sidebar
                activeView={app.activeView}
                colors={settings.currentColors}
                gradient={settings.gradientStyle}
                onNavClick={app.setActiveView}
                onAddGame={actions.handleAddGame}
            />

            <div className="flex-1 overflow-hidden md:ml-20">
                <main
                    className="pt-6 pb-20 px-4 sm:px-6 md:pb-8 md:px-8 overflow-y-auto min-h-screen"
                    onDragOver={drag.handleDragOver}
                    onDrop={drag.handleDrop}
                >
                    <header className="mb-8 flex flex-col md:flex-row justify-between gap-6 md:items-center md:h-12">
                        <h1 className="text-4xl font-extrabold tracking-tight capitalize" style={{ color: settings.currentColors.softLight, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                            {app.activeView}
                            {app.activeView === 'library' && <span className="ml-3">({view.sortedGames.length})</span>}
                        </h1>

                        {app.activeView === 'library' && (
                            <div className="flex gap-3 items-center w-full md:w-auto">
                                <div className="flex-1 md:flex-initial md:w-[340px] min-w-0">
                                    <SearchBar
                                        colors={settings.currentColors}
                                        value={app.gameSearchQuery}
                                        onChange={app.setGameSearchQuery}
                                    />
                                </div>
                                <SortControls colors={settings.currentColors} sortOrder={settings.sortOrder} setSortOrder={settings.setSortOrder} />
                            </div>
                        )}
                    </header>

                    <MainContent
                        activeView={app.activeView}
                        games={lib.games}
                        uploads={files.uploads}
                        sortedGames={view.sortedGames}
                        groupedGames={view.groupedGames}
                        gameSearchQuery={app.gameSearchQuery}
                        libraryAnimationKey={app.libraryAnimationKey}
                        handlers={{
                            onPlay: launcher.handlePlayClick,
                            onDelete: actions.handleDeleteGame,
                            onUploadCover: actions.handleUploadCover,
                            onResetCover: actions.handleResetCover,
                            onEdit: pickerFlow.handleEditGame,
                            onSaveStates: app.openSaveStateManager,
                        }}
                        settings={settings}
                    />
                </main>
            </div>

            {app.duplicateMessage && <Alert message={app.duplicateMessage} isVisible={app.showDuplicateMessage} />}
            <EmulatorNotification colors={settings.currentColors} autoSaveIcon={settings.autoSaveIcon} autoLoadIcon={settings.autoLoadIcon} />

            {(app.systemPickerOpen || app.systemPickerClosing) && (
                <SystemPickerModal
                    isClosing={app.systemPickerClosing}
                    colors={settings.currentColors}
                    gradient={settings.gradientStyle}
                    editingGame={app.editingGame}
                    pendingGame={app.pendingGame}
                    pendingFiles={app.pendingFiles}
                    searchQuery={app.systemSearchQuery}
                    onSearchChange={app.setSystemSearchQuery}
                    onClose={app.closeSystemPicker}
                    onDone={pickerFlow.handleSystemPickerDone}
                    pendingBatchCore={app.pendingBatchCore}
                    onSelectSystem={pickerFlow.onSelectSystem}
                    onRename={pickerFlow.onRename}
                />
            )}

            {(app.saveStateOpen || app.saveStateClosing) && app.saveStateGame && (
                <SaveStateManager
                    isOpen={app.saveStateOpen}
                    isClosing={app.saveStateClosing}
                    colors={settings.currentColors}
                    gradient={settings.gradientStyle}
                    gameTitle={app.saveStateGame.title}
                    gameName={app.saveStateGame.name}
                    onClose={app.closeSaveStateManager}
                    onDuplicateError={app.showDuplicateError}
                />
            )}
        </div>
    );
}
