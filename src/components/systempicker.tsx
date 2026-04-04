'use client';

import { memo, useState, useMemo, useEffect, useRef } from 'react';
import { CircleCheck, Edit2 } from 'lucide-react';
import { SYSTEM_PICKER } from '@/lib/constants';
import { SearchBar } from '@/components/searchbar';
import { Game, ThemeColors, GradientStyle } from '@/types';

interface SystemPickerProps {
    isOpen: boolean;
    isClosing: boolean;
    colors: ThemeColors;
    gradient: GradientStyle;
    editingGame: Game | null;
    pendingGame: Partial<Game> | null;
    pendingFiles: Array<{ file: File; index: number }>;
    searchQuery: string;
    onSearchChange: (q: string) => void;
    onClose: () => void;
    onDone: () => void;
    onSelectSystem: (core: string) => void;
    onRename: (title: string) => void;
    isProcessing: boolean;
    pendingBatchCore: string | null;
}

export const SystemPickerModal = memo(({
    isOpen, isClosing, colors, gradient, editingGame, pendingGame, pendingFiles,
    searchQuery, onSearchChange, onClose, onDone, onSelectSystem, onRename,
    isProcessing, pendingBatchCore
}: SystemPickerProps) => {
    const [isRenameFocused, setIsRenameFocused] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    const currentCore = editingGame?.core || (pendingFiles.length > 1 ? pendingBatchCore : pendingGame?.core);
    const canRename = !!editingGame || pendingFiles.length === 1;
    const currentTitle = editingGame ? editingGame.title : (pendingGame?.title || '');
    const query = searchQuery.toLowerCase();
    const systemSelected = !!currentCore;

    const categories = useMemo(() => {
        const result: Record<string, Array<[string, string]>> = {};
        for (const [cat, systems] of Object.entries(SYSTEM_PICKER)) {
            const matches = Object.entries(systems).filter(([name]) => name.toLowerCase().includes(query));
            if (matches.length) result[cat] = matches;
        }
        return result;
    }, [query]);

    useEffect(() => { modalRef.current?.focus(); }, []);

    const anim = isClosing ? 'fadeOut 0.2s ease-out forwards' : 'fadeIn 0.2s ease-out forwards';

    return (
        <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden"
            onClick={onClose}
            style={{ animation: anim }}
        >
            <div
                ref={modalRef}
                tabIndex={-1}
                onKeyDown={e => { if (e.key === 'Escape' && !isProcessing) { e.preventDefault(); onClose(); } }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="system-picker-title"
                className="p-8 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border overflow-hidden focus:outline-none"
                style={{ backgroundColor: colors.darkBg, borderColor: colors.midDark, boxShadow: '0 20px 60px rgba(0,0,0,0.7)', animation: anim }}
                onClick={e => e.stopPropagation()}
            >
                <div className="mb-6">
                    {canRename ? (
                        <div
                            className="flex items-center rounded-xl border-[0.125rem] w-full h-16 mb-2 transition-all"
                            style={{
                                backgroundColor: colors.darkBg,
                                borderColor: isRenameFocused ? colors.highlight : colors.midDark,
                                boxShadow: isRenameFocused ? `0 0 0 2px ${colors.highlight}30` : 'none'
                            }}
                        >
                            <div className="w-16 h-full flex items-center justify-center shrink-0" style={{ color: colors.softLight }}>
                                <Edit2 className="w-6 h-6" />
                            </div>
                            <input
                                id="system-picker-title"
                                type="text"
                                value={currentTitle}
                                onChange={e => onRename(e.target.value)}
                                onFocus={() => setIsRenameFocused(true)}
                                onBlur={() => setIsRenameFocused(false)}
                                onKeyDown={e => { if (e.key === 'Enter') onDone(); }}
                                className="bg-transparent h-full flex-1 focus:outline-none text-2xl font-bold pr-6"
                                style={{ color: colors.softLight }}
                                placeholder="Game Title"
                                aria-label="Game title"
                            />
                        </div>
                    ) : (
                        <h3 id="system-picker-title" className="text-3xl font-bold mb-2" style={{ color: colors.softLight }}>
                            {pendingFiles.length > 1 ? `Add ${pendingFiles.length} Games` : 'Select System'}
                        </h3>
                    )}
                    <p className="text-sm opacity-80" style={{ color: colors.highlight }}>
                        {editingGame ? 'Change game system' : pendingFiles.length > 1 ? `Choose system for ${pendingFiles.length} files` : 'Select a system for your game'}
                    </p>
                </div>

                <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
                    <SearchBar
                        colors={colors} value={searchQuery} onChange={onSearchChange}
                        isFocused={isSearchFocused}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        inputRef={null}
                    />
                    <div className="flex-1 overflow-y-auto pr-2 mt-4">
                        {Object.entries(categories).map(([cat, systems]) => (
                            <div key={cat} className="mb-8 last:mb-0">
                                <div className="flex items-center mb-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider pr-3" style={{ color: colors.highlight }}>{cat}</h4>
                                    <div className="flex-1 h-px" style={{ backgroundColor: `${colors.highlight}30` }} />
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {systems.map(([name, core], idx) => {
                                        const isSel = currentCore === core;
                                        return (
                                            <button
                                                key={core}
                                                onClick={() => onSelectSystem(core)}
                                                className="h-12 px-4 rounded-xl text-left border-[0.125rem] flex items-center justify-between transition-all active:scale-95 cursor-pointer"
                                                style={{
                                                    backgroundColor: isSel ? colors.highlight : colors.midDark,
                                                    borderColor: isSel ? colors.highlight : colors.midDark,
                                                    color: isSel ? colors.darkBg : colors.softLight,
                                                    animation: `fadeIn 0.4s ease-out ${idx * 0.03}s both`
                                                }}
                                            >
                                                <span className="text-sm font-medium truncate pr-2 flex-1">{name}</span>
                                                {isSel && <CircleCheck className="w-5 h-5 shrink-0" style={{ color: colors.darkBg }} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t" style={{ borderColor: `${colors.highlight}30` }}>
                    {!editingGame && (
                        <button
                            onClick={onClose}
                            disabled={isProcessing || isClosing}
                            className="h-12 px-8 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                            style={{ backgroundColor: colors.highlight, color: colors.darkBg }}
                        >
                            Cancel
                        </button>
                    )}
                    {(editingGame || pendingFiles.length > 0) && (
                        <button
                            onClick={onDone}
                            disabled={isProcessing || isClosing || !systemSelected}
                            className="h-12 px-8 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                            style={{ ...gradient, color: colors.darkBg }}
                        >
                            Done
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});

SystemPickerModal.displayName = 'SystemPickerModal';