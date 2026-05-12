"use client";

import { useGameLibrary } from '@/hooks/useGameLibrary';
import { useApp } from '@/hooks/useApp';
import { useFileHandler } from '@/hooks/useFileHandler';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useGameList } from '@/hooks/useGameList';
import { useEmulator } from '@/hooks/useEmulator';
import { Sidebar } from '@/components/Sidebar';
import { SearchBar } from '@/components/SearchBar';
import { SortControls } from '@/components/SortControls';
import { Alert } from '@/components/Alert';
import { EmulatorNotification } from '@/components/EmulatorNotification';
import { SystemPickerModal } from '@/components/SystemPickerModal';
import { SaveStateManager } from '@/components/SaveStateManager';
import { MainContent } from '@/components/MainContent';
import { EmulatorView } from '@/components/emulator/EmulatorView';
import { selectFiles, prewarmDat, calculateAutoCoverArt } from '@/lib/files';
import { getSystemNameByCore } from '@/lib/constants';
import { getCorePref } from '@/lib/ra/cores';
import { getGameFile } from '@/lib/storage';
import { stripExt } from '@/lib/utils';
import type { Game } from '@/types';

export default function Home() {
    const lib = useGameLibrary();
    const app = useApp();
    const settings = useAppSettings();
    const files = useFileHandler(lib.games, lib.addGame, app);
    const view = useGameList(lib.games, files.uploads, app.gameSearchQuery, settings.sortOrder);
    const session = useEmulator();

    const handleAddGame = async () => {
        try { await files.handleIncomingFiles(await selectFiles()); }
        catch (err) {
            if (err instanceof Error && err.name !== 'AbortError') console.error(err);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const dt = e.dataTransfer;
        if (!dt) return;
        const fs = dt.items?.length
            ? Array.from(dt.items).filter(i => i.kind === 'file').map(i => i.getAsFile()).filter((f): f is File => f !== null)
            : Array.from(dt.files);
        if (fs.length) files.handleIncomingFiles(fs);
    };

    const handlePlay = async (game: Game) => {
        try {
            const file = await getGameFile(game.id);
            if (!file || !game.core) { console.error('missing file or core:', game); return; }
            const baseName = stripExt(game.fileName || game.title);
            await session.start({
                system: game.core,
                coreOverride: getCorePref(game.core),
                rom: { name: game.fileName || file.name || `${baseName}.bin`, bytes: new Uint8Array(await file.arrayBuffer()) },
                gameBaseName: baseName,
                opts: {
                    autoLoad: settings.autoLoadState,
                    autoSave: settings.autoSaveState,
                    autoSaveInterval: settings.autoSaveInterval * 1000,
                    saveOnExit: settings.saveOnExit,
                },
            });
        } catch (err) { console.error('launch failed:', err); }
    };

    const handleDeleteGame = async (game: Game) => {
        if (!confirm(`Delete "${game.title}"?`)) return;
        await lib.deleteGame(game.id, game.fileName, game.title);
    };

    const handleResetCover = (id: number) => {
        const g = lib.games.find(x => x.id === id);
        if (g?.autoCoverArt) lib.updateGame(id, { coverArt: g.autoCoverArt });
    };

    const handleEditGame = (game: Game) => {
        app.setEditingGame(game);
        app.setPendingGame({ ...game });
        app.openSystemPicker();
    };

    const handleSelectSystem = (core: string) => {
        const update = { core, genre: getSystemNameByCore(core) };
        prewarmDat(core);
        if (app.pendingFiles.length > 1) app.setPendingBatchCore(core);
        else {
            if (app.editingGame) app.setEditingGame({ ...app.editingGame, ...update });
            if (app.pendingGame) app.setPendingGame({ ...app.pendingGame, ...update });
        }
    };

    const handleRename = (title: string) => {
        if (app.editingGame) app.setEditingGame({ ...app.editingGame, title });
        else if (app.pendingGame) app.setPendingGame({ ...app.pendingGame, title });
    };

    const handlePickerDone = async () => {
        if (app.editingGame) {
            const edited = app.editingGame;
            const original = lib.games.find(g => g.id === edited.id);
            const coreChanged = !!edited.core && original?.core !== edited.core;
            lib.updateGame(edited.id, edited);
            app.closeSystemPicker();

            if (coreChanged && edited.core) {
                const current = { ...original, ...edited };
                const userHasCustomCover = !!current.coverArt && current.coverArt !== current.autoCoverArt;
                if (!userHasCustomCover) {
                    lib.updateGame(edited.id, { coverArt: undefined, autoCoverArt: undefined, coverArtFit: undefined, coverLoading: true });
                }
                const opfs = await getGameFile(edited.id).catch(() => null);
                const cover = opfs
                    ? await calculateAutoCoverArt(edited.fileName ? new File([opfs], edited.fileName) : opfs, edited.core, opfs).catch(() => null)
                    : null;
                if (userHasCustomCover) {
                    if (opfs) lib.updateGame(edited.id, { autoCoverArt: cover ?? undefined });
                } else if (cover) {
                    lib.updateGame(edited.id, {
                        coverArt: cover,
                        autoCoverArt: cover,
                        coverArtFit: current.coverArtFit || 'cover',
                        coverLoading: false,
                    });
                } else {
                    lib.updateGame(edited.id, { coverLoading: false });
                }
            }
            return;
        }
        const core = app.pendingFiles.length > 1 ? app.pendingBatchCore : app.pendingGame?.core;
        if (!core) { app.showDuplicateError('Please select a system'); return; }

        if (app.pendingFiles.length === 1 && lib.games.some(g => g.fileName === app.pendingFiles[0].file.name)) {
            app.showDuplicateError(`"${app.pendingFiles[0].file.name}" is duplicate`);
            app.closeSystemPicker();
            return;
        }

        const meta = app.pendingGame ? { ...app.pendingGame } : undefined;
        app.closeSystemPicker();
        try {
            await Promise.all(app.pendingFiles.map((item, i) =>
                files.processGameFile(item.file, core, i === 0 ? meta : undefined)
            ));
        } catch (err) { console.error('batch processing error:', err); }
    };

    if (!settings.isHydrated)
        return <div className="min-h-screen" style={{ backgroundColor: '#0a0a0f' }} />;

    return (
        <div className="min-h-screen flex font-[family-name:var(--font-lexend)]" style={{ backgroundColor: settings.currentColors.darkBg }}>
            <Sidebar
                activeView={app.activeView}
                colors={settings.currentColors}
                gradient={settings.gradientStyle}
                onNavClick={app.setActiveView}
                onAddGame={handleAddGame}
            />

            <div className="flex-1 overflow-hidden md:ml-20">
                <main
                    className="pt-6 pb-20 px-4 sm:px-6 md:pb-8 md:px-8 overflow-y-auto min-h-screen"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
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
                        count={view.count}
                        groupedGames={view.groupedGames}
                        gameSearchQuery={app.gameSearchQuery}
                        libraryAnimationKey={app.libraryAnimationKey}
                        handlers={{
                            onPlay: handlePlay,
                            onDelete: handleDeleteGame,
                            onUploadCover: (id, data) => lib.updateGame(id, { coverArt: data }),
                            onResetCover: handleResetCover,
                            onEdit: handleEditGame,
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
                    onDone={handlePickerDone}
                    pendingBatchCore={app.pendingBatchCore}
                    onSelectSystem={handleSelectSystem}
                    onRename={handleRename}
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
