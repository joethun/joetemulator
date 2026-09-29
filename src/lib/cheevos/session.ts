import { cheevos, CheevosError, type MemorySource } from '@/lib/cheevos/client';
import { unpackForHashing } from '@/lib/cheevos/archive';
import { consoleIdFor, libraryNameFor } from '@/lib/cheevos/consoles';
import { RAM_BLOCK_IDS, type MemoryInfoFn } from '@/lib/cheevos/memory';
import {
    CHEEVOS_MESSAGE, cacheHash, clearCredentials, getCheevosState, isHardcoreLocked, patchCheevosState,
    pushCheevosToast, resetCheevosSession, saveCredentials, type RACredentials,
} from '@/lib/cheevos/store';
import {
    RA_EVENT, RC_NO_GAME_LOADED, isWarningAchievement, type RAAchievement, type RAEvent, type RAUser,
} from '@/lib/cheevos/types';
import { fileExt } from '@/lib/files';

/** What the session needs from the emulator runtime. */
interface CheevosHost {
    heap: () => Uint8Array;
    memoryInfo: MemoryInfoFn;
    /** Raw ejs_get_memory_map string; null when the core lacks the export. */
    memoryMap: () => string | null;
    frameCount: () => number;
    /** Hard-reset the emulated system (hardcore enable requires a clean boot). */
    restart: () => void;
    setFrameHook: (fn: (() => void) | null) => void;
    /** Current core option values, for hardcore validation. */
    coreOptions: () => Array<{ key: string; current: string }>;
}

interface CheevosSessionOptions {
    host: CheevosHost;
    system: string;
    libretroName: string;
    /** Every file written to the core's FS, including a generated .m3u. */
    files: Array<{ name: string; bytes: Uint8Array }>;
    /** Path the core booted (the .m3u for multi-disc sets). */
    bootPath: string;
    /** The .m3u's entries in disc order (empty for a single disc). */
    discs: string[];
    hardcore: boolean;
    credentials: RACredentials;
}

const IDLE_INTERVAL_MS = 1000;
const POINTER_CHECK_FRAMES = 300;
const PROGRESS_VISIBLE_MS = 2500;
const PSP_CONSOLE_ID = 41;

/** Image formats rcheevos can't hash (CHD is handled by rcw_chd.c). A .pbp
 *  is only hashable for PSP (whole-file MD5), not as a PSX disc image. */
const isUnhashable = (ext: string, consoleId: number) =>
    ext === 'cso' || (ext === 'pbp' && consoleId !== PSP_CONSOLE_ID);

const upsertById = <T extends { id: number }>(list: T[], item: T): T[] => [...list.filter(x => x.id !== item.id), item];
const removeById = <T extends { id: number }>(list: T[], id: number): T[] => list.filter(x => x.id !== id);

/**
 * One RetroAchievements session per running game: logs in with the stored
 * token, identifies the game, evaluates achievements once per emulated frame
 * and turns rc_client events into UI state.
 */
export class CheevosSession {
    /** Resolves once the game is identified (or identification failed). */
    readonly ready: Promise<void>;

    private disposed = false;
    private lastFrame = -1;
    private lastFrameAt = 0;
    private framesSinceCheck = 0;
    private memoryFingerprint = '';
    private idleTimer: ReturnType<typeof setInterval> | null = null;
    private progressTimer: ReturnType<typeof setTimeout> | null = null;
    private unsubscribe: (() => void) | null = null;
    /** Progress from a state loaded before the game finished identifying. */
    private pendingProgress: Uint8Array | null | undefined;
    /** Refined once an archived ROM is unpacked (a zipped .gbc is GBC, not GB). */
    private consoleId: number | null;

    constructor(private readonly opts: CheevosSessionOptions) {
        const bootName = opts.files[0]?.name ?? opts.bootPath;
        this.consoleId = consoleIdFor(opts.system, bootName);
        resetCheevosSession();
        patchCheevosState({ status: 'loading', hardcore: opts.hardcore });
        this.ready = this.begin().catch(e => {
            console.error('RetroAchievements session failed:', e);
            this.fail('error', e instanceof Error ? e.message : String(e));
        });
    }

    // ── state for the emulator ──────────────────────────────────────────

    get hardcoreLocked(): boolean { return isHardcoreLocked(getCheevosState()); }

    get active(): boolean { return getCheevosState().status === 'active'; }

    /** Frames until the player may pause (hardcore pause-buffering guard). */
    pauseFramesRemaining(): number {
        return getCheevosState().hardcore && this.active ? cheevos.pauseFramesRemaining() : 0;
    }

    serializeProgress(): Uint8Array | null {
        return this.active ? cheevos.serializeProgress() : null;
    }

    /** A save state was loaded; restore (or reset) achievement progress. */
    onStateLoaded(progress: Uint8Array | null): void {
        if (getCheevosState().status === 'loading') { this.pendingProgress = progress; return; }
        if (!this.active) return;
        cheevos.deserializeProgress(progress);
        cheevos.refreshMemory();
    }

    onReset(): void { if (this.active) cheevos.reset(); }

    /** The core swapped to playlist entry `index`; re-identify for RA. */
    async changeDisc(index: number): Promise<void> {
        const name = this.opts.discs[index];
        if (!this.active || !name) return;
        const res = await cheevos.changeMedia('/' + name);
        if (res.result !== 0) {
            pushCheevosToast({ kind: 'error', title: 'Disc not recognized', description: res.error ?? 'Achievements are disabled for this disc.' });
        }
    }

    /** Null when the option may change; otherwise the reason it can't in hardcore. */
    checkCoreOption(key: string, value: string): string | null {
        if (!this.hardcoreLocked || this.consoleId == null) return null;
        return cheevos.isSettingAllowed(libraryNameFor(this.opts.libretroName), this.consoleId, key, value)
            ? null
            : `${key} = ${value} is not allowed in hardcore mode`;
    }

    dispose(): void {
        if (this.disposed) return;
        this.disposed = true;
        this.opts.host.setFrameHook(null);
        if (this.idleTimer) clearInterval(this.idleTimer);
        if (this.progressTimer) clearTimeout(this.progressTimer);
        this.unsubscribe?.();
        if (cheevos.ready) cheevos.unloadGame();
        resetCheevosSession();
    }

    // ── startup ─────────────────────────────────────────────────────────

    private async begin(): Promise<void> {
        const { opts } = this;
        if (this.consoleId == null) return this.fail('unsupported', CHEEVOS_MESSAGE.unsupportedSystem);

        // Unpacking the ROM and loading rcheevos + logging in are independent.
        const [unpacked, loggedIn] = await Promise.all([
            unpackForHashing(opts.files, opts.bootPath, opts.system),
            this.logIn(),
        ]);
        if (this.disposed || !loggedIn) return;
        const { files, bootPath } = unpacked;
        const consoleId = unpacked.consoleId ?? this.consoleId;
        this.consoleId = consoleId;

        const blocked = files.map(f => fileExt(f.name)).find(e => isUnhashable(e, consoleId));
        if (blocked) return this.fail('unsupported', `.${blocked} images can't be identified for achievements. Use .chd, .cue/.bin or .iso.`);

        cheevos.setHardcore(opts.hardcore);
        cheevos.setFiles(files);
        this.unsubscribe = cheevos.onEvent(e => this.handleEvent(e));

        // Evaluate frames from now on; rc_client ignores do_frame until loaded.
        this.opts.host.setFrameHook(() => this.onFrame());
        this.idleTimer = setInterval(() => {
            if (performance.now() - this.lastFrameAt > IDLE_INTERVAL_MS - 100) cheevos.idle();
        }, IDLE_INTERVAL_MS);

        const source: MemorySource = {
            heap: opts.host.heap,
            info: opts.host.memoryInfo,
            memoryMap: opts.host.memoryMap,
            libretroName: opts.libretroName,
            consoleId,
            bootName: files[0]?.name ?? bootPath,
        };
        const res = await cheevos.loadGame(consoleId, bootPath, source);
        if (this.disposed) return;
        // Only a disc swap hashes again; don't hold an unpacked ROM all session.
        if (!opts.discs.length) cheevos.setFiles([]);

        if (res.result === RC_NO_GAME_LOADED) return this.fail('unknown-game', CHEEVOS_MESSAGE.unknownGame);
        if (res.result !== 0) return this.fail('error', res.error ?? 'Could not load achievements.');

        this.memoryFingerprint = this.fingerprint();
        const game = cheevos.getGame();
        if (game?.hash && opts.files[0]) cacheHash(opts.system, opts.files[0].name, game.hash);
        const hasAchievements = !!game?.summary.numCoreAchievements;
        patchCheevosState({ status: hasAchievements ? 'active' : 'no-achievements', game, message: null });

        if (hasAchievements && opts.hardcore) this.validateHardcoreSettings();

        if (this.pendingProgress !== undefined) {
            cheevos.deserializeProgress(this.pendingProgress);
            this.pendingProgress = undefined;
        }

        if (game) {
            const { numUnlockedAchievements: n, numCoreAchievements: total } = game.summary;
            pushCheevosToast({
                kind: 'info',
                title: game.title,
                description: total
                    ? `${n} of ${total} achievements unlocked${getCheevosState().hardcore ? ' · Hardcore' : ''}`
                    : 'No achievements for this game yet.',
                badgeUrl: game.badgeUrl,
            });
        }
    }

    /** Hardcore can't start with a banned core option set; drop to softcore. */
    private validateHardcoreSettings(): void {
        for (const opt of this.opts.host.coreOptions()) {
            const reason = this.checkCoreOption(opt.key, opt.current);
            if (!reason) continue;
            cheevos.setHardcore(false);
            patchCheevosState({ hardcore: false });
            pushCheevosToast({ kind: 'error', title: 'Hardcore disabled', description: reason });
            return;
        }
    }

    /** Log in with the stored token; false (and reported) once it has expired. */
    private async logIn(): Promise<boolean> {
        if (await resumeLogin(this.opts.credentials)) return true;
        if (!this.disposed) this.fail('error', CHEEVOS_MESSAGE.loginExpired);
        return false;
    }

    private fail(status: 'unsupported' | 'unknown-game' | 'error', message: string): void {
        patchCheevosState({ status, message, hardcore: false });
        pushCheevosToast({ kind: status === 'error' ? 'error' : 'info', title: 'RetroAchievements', description: message });
    }

    // ── per frame ───────────────────────────────────────────────────────

    private onFrame(): void {
        // The main loop can iterate without advancing emulation; count frames.
        const frame = this.opts.host.frameCount();
        if (frame === this.lastFrame) return;
        this.lastFrame = frame;
        this.lastFrameAt = performance.now();
        cheevos.doFrame();

        if (++this.framesSinceCheck >= POINTER_CHECK_FRAMES) {
            this.framesSinceCheck = 0;
            const fp = this.fingerprint();
            if (fp !== this.memoryFingerprint) {
                this.memoryFingerprint = fp;
                cheevos.refreshMemory();
            }
        }
    }

    /** Cheap identity of the core's memory blocks, to notice reallocations. */
    private fingerprint(): string {
        const info = this.opts.host.memoryInfo;
        // Includes the core's memory map: RetroArch refreshes achievement memory
        // whenever a core re-registers it, and so do we.
        return RAM_BLOCK_IDS.map(id => info(id).join(':')).join('|') + '#' + (this.opts.host.memoryMap() ?? '');
    }

    // ── events ──────────────────────────────────────────────────────────

    private handleEvent(e: RAEvent): void {
        const a = e.achievement;
        // The server's "Warning: Unknown Emulator" placeholder isn't a real
        // achievement; don't toast or track it.
        if (isWarningAchievement(a)) return;
        switch (e.type) {
            case RA_EVENT.ACHIEVEMENT_TRIGGERED:
                if (!a) return;
                pushCheevosToast({
                    kind: 'achievement', title: a.title, description: a.description,
                    badgeUrl: a.badgeUrl, points: a.points, achievementId: a.id,
                });
                patchCheevosState(s => ({ game: cheevos.getGame(), listVersion: s.listVersion + 1 }));
                return;

            case RA_EVENT.GAME_COMPLETED: {
                const game = getCheevosState().game;
                pushCheevosToast({
                    kind: 'mastery',
                    title: `${getCheevosState().hardcore ? 'Mastered' : 'Completed'} ${game?.title ?? 'game'}`,
                    description: 'All achievements unlocked!',
                    badgeUrl: game?.badgeUrl,
                });
                return;
            }

            case RA_EVENT.SUBSET_COMPLETED:
                pushCheevosToast({ kind: 'mastery', title: `Completed ${e.subset?.title ?? 'subset'}`, badgeUrl: e.subset?.badgeUrl });
                return;

            case RA_EVENT.CHALLENGE_INDICATOR_SHOW:
                if (a) patchCheevosState(s => ({ challenges: upsertById(s.challenges, a) }));
                return;
            case RA_EVENT.CHALLENGE_INDICATOR_HIDE:
                if (a) patchCheevosState(s => ({ challenges: removeById(s.challenges, a.id) }));
                return;

            case RA_EVENT.PROGRESS_INDICATOR_SHOW:
            case RA_EVENT.PROGRESS_INDICATOR_UPDATE:
                if (!a) return;
                this.showProgress(a);
                return;
            case RA_EVENT.PROGRESS_INDICATOR_HIDE:
                patchCheevosState({ progress: null });
                return;

            case RA_EVENT.LEADERBOARD_STARTED:
            case RA_EVENT.LEADERBOARD_FAILED:
                pushCheevosToast({
                    kind: 'leaderboard',
                    title: `Leaderboard attempt ${e.type === RA_EVENT.LEADERBOARD_STARTED ? 'started' : 'failed'}`,
                    description: e.leaderboard?.title,
                });
                return;
            case RA_EVENT.LEADERBOARD_SUBMITTED:
                pushCheevosToast({
                    kind: 'leaderboard',
                    title: `Submitted ${e.leaderboard?.trackerValue ?? ''}`.trim(),
                    description: e.leaderboard?.title,
                });
                return;
            case RA_EVENT.LEADERBOARD_SCOREBOARD:
                if (e.scoreboard) {
                    pushCheevosToast({
                        kind: 'leaderboard',
                        title: `Rank ${e.scoreboard.newRank} of ${e.scoreboard.numEntries}`,
                        description: `Best: ${e.scoreboard.bestScore}`,
                    });
                }
                return;

            case RA_EVENT.LEADERBOARD_TRACKER_SHOW:
            case RA_EVENT.LEADERBOARD_TRACKER_UPDATE: {
                const t = e.tracker;
                if (t) patchCheevosState(s => ({ trackers: upsertById(s.trackers, t) }));
                return;
            }
            case RA_EVENT.LEADERBOARD_TRACKER_HIDE: {
                const t = e.tracker;
                if (t) patchCheevosState(s => ({ trackers: removeById(s.trackers, t.id) }));
                return;
            }

            case RA_EVENT.RESET:
                // Raised when hardcore is enabled mid-game: the system must be
                // reset before achievements resume.
                this.opts.host.restart();
                cheevos.reset();
                return;

            case RA_EVENT.SERVER_ERROR:
                pushCheevosToast({
                    kind: 'error',
                    title: 'RetroAchievements error',
                    description: e.serverError?.message ?? 'The server rejected a request.',
                });
                return;
            case RA_EVENT.DISCONNECTED:
                pushCheevosToast({ kind: 'error', title: 'RetroAchievements offline', description: 'Unlocks will be sent when the connection returns.' });
                return;
            case RA_EVENT.RECONNECTED:
                pushCheevosToast({ kind: 'info', title: 'RetroAchievements reconnected', description: 'Pending unlocks were submitted.' });
                return;
        }
    }

    private showProgress(a: RAAchievement): void {
        patchCheevosState({ progress: a });
        if (this.progressTimer) clearTimeout(this.progressTimer);
        this.progressTimer = setTimeout(() => patchCheevosState({ progress: null }), PROGRESS_VISIBLE_MS);
    }
}

/** Log in with a username + password, keeping only the returned token. */
export async function loginToRetroAchievements(username: string, password: string): Promise<RAUser> {
    const user = await cheevos.loginWithPassword(username, password);
    saveCredentials({ username: user.username, token: user.token });
    patchCheevosState({ user });
    return user;
}

/** Log in with a stored token (a no-op when already logged in). Resolves
 *  null — and forgets the login — when the token is no longer valid. */
export async function resumeLogin(creds: RACredentials): Promise<RAUser | null> {
    await cheevos.init();
    let user = cheevos.getUser();
    if (!user) {
        try {
            user = await cheevos.loginWithToken(creds.username, creds.token);
        } catch (e) {
            if (!(e instanceof CheevosError) || !e.loginExpired) throw e;
            logoutOfRetroAchievements();
            return null;
        }
    }
    patchCheevosState({ user });
    return user;
}

export function logoutOfRetroAchievements(): void {
    if (cheevos.ready) cheevos.logout();
    clearCredentials();
    patchCheevosState({ user: null });
}
