"use client";

import { useEffect } from 'react';
import { useGameLibrary } from '@/hooks/useGameLibrary';
import { getSystemNameByCore } from '@/lib/constants';
import { gameSaveName } from '@/lib/utils';
import { useApp } from '@/hooks/useApp';
import { useFileHandler } from '@/hooks/useFileHandler';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useGameList } from '@/hooks/useGameList';
import { useEmulator } from '@/hooks/useEmulator';
import { usePageHandlers } from '@/hooks/usePageHandlers';
import { Sidebar } from '@/components/Sidebar';
import { SearchBar } from '@/components/SearchBar';
import { Alert } from '@/components/Alert';
import { EmulatorNotification } from '@/components/EmulatorNotification';
import { SystemPickerModal } from '@/components/SystemPickerModal';
import { SaveStateManager } from '@/components/SaveStateManager';
import { MainContent } from '@/components/MainContent';
import { EmulatorView } from '@/components/emulator/EmulatorView';

export default function Home() {
    const lib = useGameLibrary();
    const app = useApp();
    const settings = useAppSettings();
    const files = useFileHandler(lib.games, lib.addGame, app);
    const view = useGameList(lib.games, files.uploads, app.gameSearchQuery);
    const session = useEmulator();
    const h = usePageHandlers({ lib, app, files, settings, session });

    useEffect(() => {
        if (app.activeView !== 'library') return;
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'f') {
                const input = document.getElementById('library-search') as HTMLInputElement | null;
                if (!input) return;
                e.preventDefault();
                input.focus();
                input.select();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [app.activeView]);

    if (!settings.isHydrated)
        return <div className="min-h-screen" style={{ backgroundColor: '#0a0a0f' }} />;

    const loadingGame = session.currentGame
        ? lib.games.find(g => gameSaveName(g) === session.currentGame)
        : undefined;

    return (
        <div className="min-h-screen flex font-[family-name:var(--font-lexend)]" style={{ backgroundColor: settings.currentColors.darkBg }}>
            <Sidebar
                activeView={app.activeView}
                colors={settings.currentColors}
                gradient={settings.gradientStyle}
                onNavClick={app.setActiveView}
                onAddGame={h.handleAddGame}
            />

            <div className="flex-1 overflow-hidden md:ml-20">
                <main
                    className="pt-6 pb-20 px-4 sm:px-6 md:pb-8 md:px-8 overflow-y-auto min-h-screen"
                    onDragOver={h.handleDragOver}
                    onDrop={h.handleDrop}
                >
                    <header className="mb-8 flex flex-col md:flex-row justify-between gap-6 md:items-center md:h-12">
                        <h1 className="text-4xl font-extrabold tracking-tight capitalize" style={{ color: settings.currentColors.softLight, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                            {app.activeView}
                            {app.activeView === 'library' && <span className="ml-3">({view.count})</span>}
                        </h1>

                        {app.activeView === 'library' && (
                            <div className="flex gap-3 items-center w-full md:w-auto">
                                <div className="flex-1 md:flex-initial md:w-[340px] min-w-0">
                                    <SearchBar
                                        id="library-search"
                                        colors={settings.currentColors}
                                        value={app.gameSearchQuery}
                                        onChange={app.setGameSearchQuery}
                                    />
                                </div>
                            </div>
                        )}
                    </header>

                    <MainContent
                        activeView={app.activeView}
                        games={lib.games}
                        uploads={files.uploads}
                        count={view.count}
                        groupedGames={view.groupedGames}
                        gameSearchQuery={app.gameSearchQuery}
                        libraryAnimationKey={app.libraryAnimationKey}
                        handlers={{
                            onPlay: h.handlePlay,
                            onDelete: h.handleDeleteGame,
                            onUploadCover: h.handleUploadCover,
                            onResetCover: h.handleResetCover,
                            onCoverFailed: h.handleCoverFailed,
                            onEdit: h.handleEditGame,
                            onSaveStates: app.openSaveStateManager,
                        }}
                        settings={settings}
                    />
                </main>
            </div>

            <EmulatorView
                session={session}
                colors={settings.currentColors}
                gradient={settings.gradientStyle}
                keepPaused={app.saveStateOpen || app.saveStateClosing}
                onDuplicateError={app.showDuplicateError}
                loadingTitle={loadingGame?.title ?? session.currentGame ?? undefined}
                loadingSystemName={session.currentCore ? getSystemNameByCore(session.currentCore) : undefined}
                loadingCoverArt={loadingGame?.coverArt}
            />

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
                    onDone={h.handlePickerDone}
                    pendingBatchCore={app.pendingBatchCore}
                    onSelectSystem={h.handleSelectSystem}
                    onRename={h.handleRename}
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
                    onClose={() => app.closeSaveStateManager()}
                    onDuplicateError={app.showDuplicateError}
                    showBack={app.saveStateHasBack}
                    onLoad={app.saveStateHasBack && session.currentGame === app.saveStateGame.name
                        ? (key) => {
                            session.actions.loadState(key, 'manual');
                            app.closeSaveStateManager(true);
                        }
                        : undefined}
                />
            )}
        </div>
    );
}
