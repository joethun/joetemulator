'use client';

import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, Download, Play, Save } from 'lucide-react';
import { ThemeColors, GradientStyle } from '@/types';
import {
    fetchStates, removeState, importState, downloadState,
    fmtDate, groupByDay, SaveState, NEXT_LOAD_KEY,
} from '@/lib/savestates';

export { NEXT_LOAD_KEY } from '@/lib/savestates';

// Shared button styles

const BTN_BASE = 'w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer border-[0.125rem]';

interface IconBtnProps {
    onClick: () => void;
    label: string;
    disabled?: boolean;
    style: React.CSSProperties;
    children: React.ReactNode;
}

const IconBtn = ({ onClick, label, disabled, style, children }: IconBtnProps) => (
    <button onClick={onClick} aria-label={label} disabled={disabled}
        className={`${BTN_BASE} disabled:opacity-40`} style={style}>
        {children}
    </button>
);

// Empty state

const EmptyState = ({ colors }: { colors: ThemeColors }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-xl mb-6 flex items-center justify-center shadow-lg"
            style={{ backgroundColor: colors.midDark, color: colors.highlight }}>
            <Save className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: colors.softLight }}>No save states found</h3>
        <p className="opacity-70" style={{ color: colors.highlight }}>Press F1 in game or import one</p>
    </div>
);

// Single save state row

interface StateRowProps {
    s: SaveState;
    idx: number;
    isNextLoad: boolean;
    isDeleting: boolean;
    colors: ThemeColors;
    gameName: string;
    onToggleNextLoad: (key: string) => void;
    onDelete: (key: string) => void;
}

const StateRow = memo(({ s, idx, isNextLoad, isDeleting, colors, gameName, onToggleNextLoad, onDelete }: StateRowProps) => (
    <div key={s.key}
        className={`py-3 px-4 rounded-xl border-[0.125rem] flex items-center gap-4 transition-[border-color,box-shadow] duration-200 ${isDeleting ? 'animate-card-exit' : ''}`}
        style={{
            backgroundColor: colors.darkBg,
            borderColor: isNextLoad ? colors.highlight : colors.midDark,
            boxShadow: isNextLoad ? `0 0 0 2px ${colors.highlight}30` : 'none',
            animation: isDeleting ? undefined : `fadeIn 0.4s ease-out ${idx * 0.03}s both`,
        }}>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-tight" style={{ color: colors.softLight }}>{fmtDate(s.savedAt)}</p>
            <div className="overflow-hidden transition-all duration-300 mt-0.5"
                style={{ maxHeight: isNextLoad ? '1.25rem' : '0px', opacity: isNextLoad ? 1 : 0 }}>
                <p className="text-xs opacity-70" style={{ color: colors.highlight }}>Loads on next launch</p>
            </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
            <IconBtn onClick={() => onToggleNextLoad(s.key)} label="Use on next load"
                style={{
                    backgroundColor: isNextLoad ? colors.highlight : colors.midDark,
                    borderColor: isNextLoad ? colors.highlight : colors.midDark,
                    color: isNextLoad ? colors.darkBg : colors.softLight,
                }}>
                <Play className="w-4 h-4" />
            </IconBtn>
            <IconBtn onClick={() => downloadState(gameName, s.savedAt, s.rawData)} label="Download"
                style={{ backgroundColor: colors.midDark, borderColor: colors.midDark, color: colors.softLight }}>
                <Download className="w-4 h-4" />
            </IconBtn>
            <IconBtn onClick={() => onDelete(s.key)} label="Delete" disabled={isDeleting}
                style={{ backgroundColor: 'rgba(239,68,68,0.15)', borderColor: 'transparent', color: 'rgb(248,113,113)' }}>
                <Trash2 className="w-4 h-4" />
            </IconBtn>
        </div>
    </div>
));
StateRow.displayName = 'StateRow';

// Main component

interface SaveStateManagerProps {
    isOpen: boolean;
    isClosing: boolean;
    colors: ThemeColors;
    gradient: GradientStyle;
    gameTitle: string;
    gameName: string;
    onClose: () => void;
    onDuplicateError: (msg: string) => void;
}

export const SaveStateManager = memo(({
    isOpen, isClosing, colors, gradient, gameTitle, gameName, onClose, onDuplicateError,
}: SaveStateManagerProps) => {
    const [states, setStates] = useState<SaveState[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingKey, setDeletingKey] = useState<string | null>(null);
    const [nextLoadKey, setNextLoadKey] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const importRef = useRef<HTMLInputElement>(null);

    const anim = isClosing ? 'fadeOut 0.2s ease-out forwards' : 'fadeIn 0.2s ease-out forwards';

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const result = await fetchStates(gameName);
            setStates(result);
            setNextLoadKey(result.find(s => localStorage.getItem(NEXT_LOAD_KEY + s.key))?.key ?? null);
        } catch { setStates([]); }
        finally { setLoading(false); }
    }, [gameName]);

    useEffect(() => {
        if (isOpen) { refresh(); setTimeout(() => modalRef.current?.focus(), 0); }
    }, [isOpen, refresh]);

    const handleDelete = useCallback(async (key: string) => {
        if (!confirm(`Delete this save state for ${gameTitle}?`)) return;
        setDeletingKey(key);
        await new Promise(r => setTimeout(r, 350));
        await removeState(key, gameName);
        setStates(prev => prev.filter(s => s.key !== key));
        if (nextLoadKey === key) setNextLoadKey(null);
        setDeletingKey(null);
    }, [gameName, gameTitle, nextLoadKey]);

    const handleToggleNextLoad = useCallback((key: string) => {
        try {
            if (nextLoadKey === key) {
                localStorage.removeItem(NEXT_LOAD_KEY + key);
                setNextLoadKey(null);
            } else {
                if (nextLoadKey) localStorage.removeItem(NEXT_LOAD_KEY + nextLoadKey);
                localStorage.setItem(NEXT_LOAD_KEY + key, '1');
                setNextLoadKey(key);
            }
        } catch { /* noop */ }
    }, [nextLoadKey]);

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

    if (!isOpen && !isClosing) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden"
            onClick={onClose} style={{ animation: anim, fontFamily: 'var(--font-lexend, system-ui)' }}>

            <input ref={importRef} type="file" className="hidden"
                onClick={e => e.stopPropagation()} onChange={handleImport} />

            <div ref={modalRef} tabIndex={0} role="dialog" aria-modal="true" aria-labelledby="save-state-title"
                onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } }}
                onClick={e => e.stopPropagation()}
                className="p-8 rounded-2xl max-w-2xl w-full flex flex-col border focus:outline-none"
                style={{ backgroundColor: colors.darkBg, borderColor: colors.midDark, boxShadow: '0 20px 60px rgba(0,0,0,0.7)', animation: anim }}>

                <div className="mb-6">
                    <h3 id="save-state-title" className="text-3xl font-bold mb-2" style={{ color: colors.softLight }}>Save States</h3>
                    <p className="text-sm opacity-80" style={{ color: colors.highlight }}>{gameTitle}</p>
                </div>

                <div className="flex flex-col min-w-0" style={{ height: '320px' }}>
                    <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ padding: '2px', margin: '-2px' }}>
                        {loading ? (
                            <div className="flex items-center justify-center py-16 opacity-50" style={{ color: colors.softLight }}>
                                <span className="text-sm">Loading...</span>
                            </div>
                        ) : states.length === 0 ? (
                            <EmptyState colors={colors} />
                        ) : (
                            <div className="flex flex-col gap-6 pr-2">
                                {groupByDay(states).map(({ label, items }) => (
                                    <div key={label}>
                                        <div className="flex items-center mb-3">
                                            <h4 className="text-xs font-bold uppercase tracking-wider pr-3" style={{ color: colors.highlight }}>{label}</h4>
                                            <div className="flex-1 h-px" style={{ backgroundColor: `${colors.highlight}30` }} />
                                        </div>
                                        <div className="flex flex-col gap-2.5">
                                            {items.map((s, idx) => (
                                                <StateRow key={s.key} s={s} idx={idx}
                                                    isNextLoad={nextLoadKey === s.key}
                                                    isDeleting={deletingKey === s.key}
                                                    colors={colors} gameName={gameName}
                                                    onToggleNextLoad={handleToggleNextLoad}
                                                    onDelete={handleDelete} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: `${colors.highlight}30` }}>
                    <button onClick={e => { e.stopPropagation(); importRef.current?.click(); }}
                        className="h-12 px-8 rounded-xl font-bold transition-all active:scale-95 cursor-pointer"
                        style={{ backgroundColor: colors.highlight, color: colors.darkBg }}>
                        Import
                    </button>
                    <button onClick={onClose}
                        className="h-12 px-8 rounded-xl font-bold transition-all active:scale-95 cursor-pointer"
                        style={{ ...gradient, color: colors.darkBg }}>
                        Done
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
});

SaveStateManager.displayName = 'SaveStateManager';
