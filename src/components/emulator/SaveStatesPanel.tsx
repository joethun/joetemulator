'use client';

import { memo, useState, useEffect, useCallback } from 'react';
import { Trash2, Download, Upload, Save } from 'lucide-react';
import type { ThemeColors } from '@/types';
import {
    fetchStates, removeState, importState, downloadState,
    fmtDate, groupByDay, type SaveState,
} from '@/lib/savestates';
import { SectionHeader } from '@/components/emulator/shared';

const BTN_BASE = 'w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer border-[0.125rem]';
const DELETE_ANIM_MS = 350;

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
    const [deletingKey, setDeletingKey] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        try { setStates(await fetchStates(gameName)); }
        catch { setStates([]); }
        finally { setLoading(false); }
    }, [gameName]);

    useEffect(() => { refresh(); }, [refresh]);

    const handleDelete = useCallback(async (key: string) => {
        if (!confirm(`Delete this save state for ${gameTitle}?`)) return;
        setDeletingKey(key);
        await new Promise(r => setTimeout(r, DELETE_ANIM_MS));
        await removeState(key, gameName);
        setStates(prev => prev.filter(s => s.key !== key));
        setDeletingKey(null);
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
                                <div className="flex flex-col gap-2.5">
                                    {items.map((s, idx) => (
                                        <StateRow
                                            key={s.key}
                                            s={s}
                                            idx={idx}
                                            isDeleting={deletingKey === s.key}
                                            colors={colors}
                                            gameName={gameName}
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
                className="w-20 h-20 rounded-xl mb-6 flex items-center justify-center shadow-lg"
                style={{ backgroundColor: colors.midDark, color: colors.highlight }}
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

interface StateRowProps {
    s: SaveState;
    idx: number;
    isDeleting: boolean;
    colors: ThemeColors;
    gameName: string;
    onDelete: (key: string) => void;
    onLoad?: (key: string) => void;
}

const StateRow = memo(({ s, idx, isDeleting, colors, gameName, onDelete, onLoad }: StateRowProps) => (
    <div
        className={`py-3 px-4 rounded-xl border-[0.125rem] flex items-center gap-4 ${isDeleting ? 'animate-card-exit' : ''}`}
        style={{
            backgroundColor: colors.darkBg,
            borderColor: colors.midDark,
            animation: isDeleting ? undefined : `fadeIn 0.4s ease-out ${idx * 0.03}s both`,
        }}
    >
        <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-tight" style={{ color: colors.softLight }}>
                {fmtDate(s.savedAt)}
            </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
            {onLoad && (
                <button onClick={() => onLoad(s.key)} aria-label="Load"
                    className={BTN_BASE}
                    style={{ backgroundColor: colors.midDark, borderColor: colors.midDark, color: colors.softLight }}>
                    <Upload className="w-4 h-4" />
                </button>
            )}
            <button onClick={() => downloadState(gameName, s.savedAt, s.rawData)} aria-label="Download"
                className={BTN_BASE}
                style={{ backgroundColor: colors.midDark, borderColor: colors.midDark, color: colors.softLight }}>
                <Download className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(s.key)} aria-label="Delete" disabled={isDeleting}
                className={`${BTN_BASE} disabled:opacity-40`}
                style={{ backgroundColor: 'rgba(239,68,68,0.15)', borderColor: 'transparent', color: 'rgb(248,113,113)' }}>
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    </div>
));
StateRow.displayName = 'StateRow';
