'use client';

import { memo, useState, useEffect, useCallback } from 'react';
import { Trash2, Download, Upload, Save, HardDrive, type LucideIcon } from 'lucide-react';
import type { ThemeColors } from '@/types';
import {
    fetchStates, removeState, importState, downloadState,
    fmtTime, groupByDay, stampCoverAspect, DEFAULT_COVER_ASPECT,
    SAVE_STATE_THUMBNAIL_EVENT, parseSaveStateThumbnailEvent,
    type SaveState, type SaveKind, type SlotRef,
} from '@/lib/savestates';
import { DANGER_BG, DANGER_FG, SHADOW_CARD } from '@/lib/constants';
import { EmptyState, SectionHeader } from '@/components/emulator/shared';
import { ChipButton } from '@/components/SettingsCard';
import { SaveStateCover } from '@/components/emulator/SaveStateCover';

interface SaveStatesPanelProps {
    colors: ThemeColors;
    gameName: string;
    gameTitle: string;
    onDuplicateError: (msg: string) => void;
    /** Load a slot into the running game. Omitted in the library. */
    onLoad?: (slot: SlotRef) => void;
    /** Ref forwarded so the parent (menu footer) can trigger the file picker. */
    importRef: React.RefObject<HTMLInputElement | null>;
    /** Tab shown on open. */
    initialTab: SaveKind;
}

export const SaveStatesPanel = memo(({
    colors, gameName, gameTitle, onDuplicateError, onLoad, importRef, initialTab,
}: SaveStatesPanelProps) => {
    const [states, setStates] = useState<SaveState[]>([]);
    const [loadedGame, setLoadedGame] = useState<string | null>(null);
    const [pendingCovers, setPendingCovers] = useState<Set<string>>(() => new Set());
    const [reloadKey, setReloadKey] = useState(0);
    // Always opens on the same tab, never one picked earlier or the newest save's.
    const [tab, setTab] = useState<SaveKind>(initialTab);
    const loading = loadedGame !== gameName;
    const shown = states.filter(s => s.kind === tab);

    // Load the game's save states. setState runs only after the await (never a synchronous
    // cascade), guarded against a stale gameName. Bump reloadKey to force a re-fetch.
    useEffect(() => {
        let active = true;
        (async () => {
            let next: SaveState[] = [];
            try { next = await fetchStates(gameName); } catch { next = []; }
            if (active) { setStates(next); setLoadedGame(gameName); }
        })();
        return () => { active = false; };
    }, [gameName, reloadKey]);

    useEffect(() => {
        const onThumbnail = (e: Event) => {
            const detail = parseSaveStateThumbnailEvent(e, gameName);
            if (!detail) return;
            const { key, phase } = detail;
            const isPending = phase === 'pending';
            setPendingCovers(prev => {
                if (prev.has(key) === isPending) return prev;
                const next = new Set(prev);
                if (isPending) next.add(key); else next.delete(key);
                return next;
            });
            if (isPending) return;
            if (detail.thumbnail !== undefined) {
                setStates(prev => prev.map(s => s.key === key
                    ? {
                        ...s,
                        thumbnail: detail.thumbnail ?? null,
                        coverAspect: detail.coverAspect ?? s.coverAspect,
                    }
                    : s,
                ));
            }
        };
        window.addEventListener(SAVE_STATE_THUMBNAIL_EVENT, onThumbnail);
        return () => window.removeEventListener(SAVE_STATE_THUMBNAIL_EVENT, onThumbnail);
    }, [gameName]);

    const gameCoverAspect = states.find(s => s.coverAspect && s.coverAspect > 0)?.coverAspect
        ?? DEFAULT_COVER_ASPECT;

    const handleDelete = useCallback(async (s: SaveState) => {
        if (!confirm(`Delete ${KIND_UI[s.kind].noun} from ${fmtTime(s.savedAt)} for ${gameTitle}?`)) return;
        await removeState(s.key, gameName, s.kind);
        setStates(prev => prev.filter(x => x.key !== s.key));
    }, [gameName, gameTitle]);

    const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        try {
            // Show the tab the import landed in.
            setTab(await importState(gameName, file));
            setReloadKey(k => k + 1);
        } catch (err) {
            if (err instanceof Error && err.message === 'duplicate') onDuplicateError('Already imported');
            else console.error('import failed:', err);
        }
    }, [gameName, onDuplicateError]);

    // Tabs stay put above the scrolling list.
    return (
        <div className="flex flex-col gap-6 flex-1 min-h-0 min-w-0">
            <input ref={importRef} type="file" className="hidden" onChange={handleImport} />

            <div className="flex items-center gap-2 shrink-0">
                {KINDS.map(kind => (
                    <ChipButton
                        key={kind}
                        colors={colors}
                        className="flex-1"
                        active={tab === kind}
                        aria-pressed={tab === kind}
                        onClick={() => setTab(kind)}
                    >
                        {KIND_UI[kind].label}
                    </ChipButton>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto min-h-0" style={{ padding: '2px', margin: '-2px' }}>
                <div className="flex flex-col min-w-0 h-full" style={{ minHeight: '260px' }}>
                    {loading ? null : shown.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <EmptyState icon={KIND_UI[tab].icon} colors={colors} title={KIND_UI[tab].emptyTitle} text={KIND_UI[tab].emptyText} />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {groupByDay(shown).map(({ label, items }) => (
                                <div key={label}>
                                    <SectionHeader title={label} colors={colors} />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-start">
                                        {items.map((s, idx) => (
                                            <StateCard
                                                key={s.key}
                                                s={s}
                                                idx={idx}
                                                colors={colors}
                                                gameName={gameName}
                                                fallbackAspect={s.coverAspect ?? gameCoverAspect}
                                                coverPending={pendingCovers.has(s.key)}
                                                onDelete={handleDelete}
                                                onLoad={onLoad}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

SaveStatesPanel.displayName = 'SaveStatesPanel';

interface StateCardProps {
    s: SaveState;
    idx: number;
    colors: ThemeColors;
    gameName: string;
    fallbackAspect: number;
    coverPending: boolean;
    onDelete: (s: SaveState) => void;
    onLoad?: (s: SaveState) => void;
}

/** Tab order. */
const KINDS: SaveKind[] = ['state', 'save'];

const KIND_UI: Record<SaveKind, { label: string; noun: string; icon: LucideIcon; emptyTitle: string; emptyText: string }> = {
    state: {
        label: 'Save States', noun: 'save state', icon: Save, emptyTitle: 'No save states',
        emptyText: 'Save a state with the hotkey or button, or import one.',
    },
    save: {
        label: 'In-Game Saves', noun: 'in-game save', icon: HardDrive, emptyTitle: 'No in-game saves',
        emptyText: "Save from the game's own menu, or import a .sav or .srm file.",
    },
};

const StateCard = memo(({
    s, idx, colors, gameName, fallbackAspect, coverPending, onDelete, onLoad,
}: StateCardProps) => (
    <article
        className="rounded-xl border-[0.125rem] overflow-hidden flex flex-col w-full min-w-0"
        style={{
            backgroundColor: colors.darkBg,
            borderColor: colors.midDark,
            boxShadow: SHADOW_CARD,
            animation: `fadeIn 0.4s ease-out ${idx * 0.03}s both`,
        }}
    >
        <SaveStateCover
            src={s.thumbnail}
            fallbackAspect={fallbackAspect}
            colors={colors}
            showNoImage={!s.thumbnail && !coverPending}
            onAspectKnown={aspect => {
                if (!s.coverAspect) stampCoverAspect(s.key, aspect);
            }}
        />
        <div
            className="h-12 px-3 flex items-center gap-2 border-t-[0.125rem] shrink-0"
            style={{ borderColor: colors.midDark }}
        >
            <span className="text-sm font-medium truncate flex-1 min-w-0" style={{ color: colors.softLight }}>
                {fmtTime(s.savedAt)}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
                {onLoad && <IconButton icon={Upload} label="Load" colors={colors} onClick={() => onLoad(s)} />}
                <IconButton icon={Download} label="Download" colors={colors}
                    onClick={() => void downloadState(gameName, s.key, s.savedAt, s.kind)} />
                <IconButton icon={Trash2} label="Delete" colors={colors} danger
                    onClick={() => onDelete(s)} />
            </div>
        </div>
    </article>
));
StateCard.displayName = 'StateCard';

function IconButton({ icon: Icon, label, colors, danger, onClick }: {
    icon: LucideIcon; label: string; colors: ThemeColors; danger?: boolean; onClick: () => void;
}) {
    return (
        <button onClick={onClick} aria-label={label}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            style={danger
                ? { backgroundColor: DANGER_BG, color: DANGER_FG }
                : { backgroundColor: colors.midDark, color: colors.softLight }}>
            <Icon className="w-4 h-4" />
        </button>
    );
}
