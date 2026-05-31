import type { Game } from '@/types';
import type { useGameLibrary } from '@/hooks/useGameLibrary';
import type { useApp } from '@/hooks/useApp';
import type { useFileHandler } from '@/hooks/useFileHandler';
import type { useAppSettings } from '@/hooks/useAppSettings';
import type { useEmulator } from '@/hooks/useEmulator';
import { selectFiles, prewarmDat, calculateAutoCoverArt } from '@/lib/files';
import { getSystemNameByCore } from '@/lib/constants';
import { getCorePref } from '@/lib/ra/cores';
import { getGameFile } from '@/lib/storage';
import { gameSaveName } from '@/lib/utils';

interface Deps {
    lib: ReturnType<typeof useGameLibrary>;
    app: ReturnType<typeof useApp>;
    files: ReturnType<typeof useFileHandler>;
    settings: ReturnType<typeof useAppSettings>;
    session: ReturnType<typeof useEmulator>;
}

export function usePageHandlers({ lib, app, files, settings, session }: Deps) {
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
            const baseName = gameSaveName(game);
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

    // why: an auto-cover URL from libretro can 404 if the DAT-matched filename
    // isn't actually in their thumbnail repo. Clearing it on first failure stops
    // every reload from re-fetching and flashing a blank card. Guarded by
    // navigator.onLine so a transient offline state doesn't wipe valid metadata.
    const handleCoverFailed = (id: number) => {
        if (typeof navigator !== 'undefined' && !navigator.onLine) return;
        const g = lib.games.find(x => x.id === id);
        if (!g || !g.coverArt || g.coverArt !== g.autoCoverArt) return;
        lib.updateGame(id, { coverArt: undefined, autoCoverArt: undefined, coverArtFit: undefined });
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

    const handleUploadCover = (id: number, data: string) => lib.updateGame(id, { coverArt: data });

    return {
        handleAddGame,
        handleDragOver,
        handleDrop,
        handlePlay,
        handleDeleteGame,
        handleResetCover,
        handleCoverFailed,
        handleEditGame,
        handleSelectSystem,
        handleRename,
        handlePickerDone,
        handleUploadCover,
    };
}
