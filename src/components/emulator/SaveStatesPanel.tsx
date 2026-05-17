'use client';

import { memo, useState, useEffect, useCallback } from 'react';
import { Trash2, Download, Upload, Save } from 'lucide-react';
import type { ThemeColors } from '@/types';
import {
    fetchStates, removeState, importState, downloadState,
    fmtTime, groupByDay, stampCoverAspect, DEFAULT_COVER_ASPECT,
    SAVE_STATE_THUMBNAIL_EVENT, parseSaveStateThumbnailEvent,
    type SaveState,
} from '@/lib/savestates';
import { DANGER_BG, DANGER_FG, SHADOW_CARD } from '@/lib/constants';
import { SectionHeader } from '@/components/emulator/shared';
import { SaveStateCover } from '@/components/emulator/SaveStateCover';

const BTN_BASE = 'w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95 cursor-pointer';

interface SaveStatesPanelProps {
    colors: ThemeColors;
    gameName: string;
    gameTitle: string;
    onDuplicateError: (msg: string) => void;
    onLoad?: (key: string) => void;
    /** Ref forwarded so the parent (menu footer) can trigger the file picker. */
    importRef: React.RefObject<HTMLInputElement | null>;
}

export const SaveStatesPanel = memo(({
    colors, gameName, gameTitle, onDuplicateError, onLoad, importRef,
}: SaveStatesPanelProps) => {
    const [states, setStates] = useState<SaveState[]>([]);
    const [loading, setLoading] = useState(true);
    const [pendingCovers, setPendingCovers] = useState<Set<string>>(() => new Set());

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            setStates(await fetchStates(gameName));
        } catch {
            setStates([]);
        } finally {
            setLoading(false);
        }
    }, [gameName]);

    useEffect(() => { refresh(); }, [refresh]);

    useEffect(() => {
        const onThumbnail = (e: Event) => {
            const detail = parseSaveStateThumbnailEvent(e, gameName);
            if (!detail) return;
            const { key, phase } = detail;
            if (phase === 'pending') {
                setPendingCovers(prev => {
                    if (prev.has(key)) return prev;
                    const next = new Set(prev);
                    next.add(key);
                    return next;
                });
                return;
            }
            setPendingCovers(prev => {
                if (!prev.has(key)) return prev;
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
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

    const handleDelete = useCallback(async (key: string, savedAt: Date | null) => {
        if (!confirm(`Delete save state from ${fmtTime(savedAt)} for ${gameTitle}?`)) return;
        await removeState(key, gameName);
        setStates(prev => prev.filter(s => s.key !== key));
    }, [gameName, gameTitle]);

    const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        try {
            await importState(gameName, file);
            await refresh();
        } catch (err) {
            if (err instanceof Error && err.message === 'duplicate') onDuplicateError('Save state already exists');
            else console.error('import failed:', err);
        }
    }, [gameName, refresh, onDuplicateError]);

    return (
        <>
            <input ref={importRef} type="file" className="hidden" onChange={handleImport} />

            <div className="flex flex-col min-w-0 h-full" style={{ minHeight: '320px' }}>
                {loading ? null : states.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <EmptyState colors={colors} />
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {groupByDay(states).map(({ label, items }) => (
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
        </>
    );
});

SaveStatesPanel.displayName = 'SaveStatesPanel';

function EmptyState({ colors }: { colors: ThemeColors }) {
    return (
        <div className="flex flex-col items-center justify-center text-center animate-fade-in">
            <div
                className="w-20 h-20 rounded-xl mb-6 flex items-center justify-center"
                style={{ backgroundColor: colors.midDark, color: colors.highlight, boxShadow: SHADOW_CARD }}
            >
                <Save className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: colors.softLight }}>
                No save states found
            </h3>
            <p className="opacity-70" style={{ color: colors.highlight }}>
                Press F1 in game or import one
            </p>
        </div>
    );
}

interface StateCardProps {
    s: SaveState;
    idx: number;
    colors: ThemeColors;
    gameName: string;
    fallbackAspect: number;
    coverPending: boolean;
    onDelete: (key: string, savedAt: Date | null) => void;
    onLoad?: (key: string) => void;
}

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
                {onLoad && (
                    <button onClick={() => onLoad(s.key)} aria-label="Load"
                        className={BTN_BASE}
                        style={{ backgroundColor: colors.midDark, color: colors.softLight }}>
                        <Upload className="w-4 h-4" />
                    </button>
                )}
                <button onClick={() => downloadState(gameName, s.savedAt, s.rawData, s.thumbnail)} aria-label="Download"
                    className={BTN_BASE}
                    style={{ backgroundColor: colors.midDark, color: colors.softLight }}>
                    <Download className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(s.key, s.savedAt)} aria-label="Delete"
                    className={BTN_BASE}
                    style={{ backgroundColor: DANGER_BG, color: DANGER_FG }}>
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    </article>
));
StateCard.displayName = 'StateCard';
