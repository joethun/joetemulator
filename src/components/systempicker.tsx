'use client';

import { memo, useState, useMemo } from 'react';
import { Trash2, Image, CircleCheck, Edit2 } from 'lucide-react';
import { SYSTEM_PICKER } from '@/lib/constants';
import { SearchBar } from '@/components/searchbar';
import { Game } from '@/types';

interface SystemPickerProps {
    isOpen: boolean;
    isClosing: boolean;
    colors: any;
    gradient: any;
    editingGame: Game | null;
    pendingGame: any;
    pendingFiles: any[];
    searchQuery: string;
    onSearchChange: (q: string) => void;
    onClose: () => void;
    onDone: () => void;
    onSelectSystem: (core: string) => void;
    onRename: (title: string) => void;
    coverArtState: {
        file: string | undefined;
        fit: 'cover' | 'contain';
        onFitChange: (fit: 'cover' | 'contain') => void;
        onUpload: (data: any) => void;
        onRemove: () => void;
    };
    isProcessing: boolean;
    pendingBatchCore: string | null;
}

export const SystemPickerModal = memo(({
    isClosing, colors, gradient, editingGame, pendingGame, pendingFiles,
    searchQuery, onSearchChange, onClose, onDone, onSelectSystem, onRename, coverArtState,
    isProcessing, pendingBatchCore
}: SystemPickerProps) => {
    const [isRenameFocused, setIsRenameFocused] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // derived values
    const currentCore = editingGame?.core || (pendingFiles.length > 1 ? pendingBatchCore : pendingGame?.core);
    const showCoverArt = pendingFiles.length <= 1;
    const canRename = !!editingGame || pendingFiles.length === 1;
    const currentTitle = editingGame ? editingGame.title : (pendingGame?.title || '');

    // filter systems
    const categories = useMemo(() => {
        const filtered: Record<string, Array<[string, string]>> = {};
        Object.entries(SYSTEM_PICKER).forEach(([cat, systems]) => {
            const matches = Object.entries(systems).filter(([name]) => name.toLowerCase().includes(searchQuery.toLowerCase()));
            if (matches.length) filtered[cat] = matches;
        });
        return filtered;
    }, [searchQuery]);

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
            style={{ animation: isClosing ? 'fadeOut 0.2s ease-out forwards' : 'fadeIn 0.2s ease-out forwards' }}
        >
            <div
                className="p-6 rounded-xl max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl border overflow-hidden"
                style={{
                    backgroundColor: colors.darkBg,
                    borderColor: colors.midDark,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
                    animation: isClosing ? 'fadeOut 0.2s ease-out forwards' : 'fadeIn 0.2s ease-out forwards'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* header */}
                <div className="mb-6">
                    {canRename ? (
                        <div
                            className="flex items-center rounded-xl border-[0.125rem] transition-all w-full h-16 mb-2"
                            style={{
                                backgroundColor: colors.darkBg,
                                borderColor: isRenameFocused ? colors.highlight : colors.midDark,
                                boxShadow: isRenameFocused ? `0 0 0 2px ${colors.highlight}30` : 'none'
                            }}
                        >
                            <div className="w-16 h-full flex items-center justify-center flex-shrink-0" style={{ color: colors.softLight }}>
                                <Edit2 className="w-6 h-6" />
                            </div>
                            <input
                                type="text"
                                value={currentTitle}
                                onChange={(e) => onRename(e.target.value)}
                                onFocus={() => setIsRenameFocused(true)}
                                onBlur={() => setIsRenameFocused(false)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        onDone();
                                    }
                                }}
                                className="bg-transparent h-full flex-1 focus:outline-none text-2xl font-bold pr-6"
                                style={{ color: colors.softLight }}
                                placeholder="Game Title"
                            />
                        </div>
                    ) : (
                        <h3 className="text-3xl font-bold mb-2" style={{ color: colors.softLight }}>
                            {pendingFiles.length > 1 ? `Add ${pendingFiles.length} Games` : 'Select System'}
                        </h3>
                    )}
                    <p className="text-sm opacity-70" style={{ color: colors.highlight }}>
                        {editingGame ? 'Edit game metadata' : pendingFiles.length > 1 ? `Choose system for ${pendingFiles.length} files` : 'Name your game and select a system'}
                    </p>
                </div>

                <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
                    {showCoverArt && (
                        <CoverArtSection
                            colors={colors}
                            gradient={gradient}
                            coverArtState={coverArtState}
                        />
                    )}

                    <SystemListSection
                        colors={colors}
                        categories={categories}
                        searchQuery={searchQuery}
                        onSearchChange={onSearchChange}
                        currentCore={currentCore}
                        onSelectSystem={onSelectSystem}
                        isSearchFocused={isSearchFocused}
                        setIsSearchFocused={setIsSearchFocused}
                    />
                </div>

                {/* footer actions */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: colors.highlight + '30' }}>
                    {(editingGame || pendingFiles.length > 0) && (
                        <button onClick={onDone} disabled={isProcessing} className="h-12 px-6 rounded-xl font-semibold active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50" style={{ ...gradient, color: colors.darkBg }}>
                            <span>Done</span>
                        </button>
                    )}
                    <button onClick={onClose} disabled={isProcessing} className="h-12 px-6 rounded-xl font-semibold active:scale-95 transition-all disabled:opacity-50" style={{ backgroundColor: colors.highlight, color: colors.darkBg }}>
                        {editingGame ? 'Cancel' : 'Close'}
                    </button>
                </div>
            </div>
        </div>
    );
});

SystemPickerModal.displayName = 'SystemPickerModal';

const CoverArtSection = memo(({ colors, gradient, coverArtState }: any) => (
    <div className="flex-shrink-0 w-full xl:w-80 space-y-4 max-h-[60vh] xl:max-h-full overflow-y-auto">
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: colors.midDark, backgroundColor: colors.darkBg }}>
            {coverArtState.file ? (
                <div className="relative group aspect-[4/5] bg-black/20">
                    <img src={coverArtState.file} alt="Cover" className="w-full h-full" style={{ objectFit: coverArtState.fit, objectPosition: 'center' }} />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={coverArtState.onRemove} className="p-2.5 rounded-xl hover:shadow-md active:scale-95 transition-all bg-red-500 text-white">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="aspect-[3/4] flex items-center justify-center p-6 text-center" style={{ backgroundColor: colors.midDark }}>
                    <div>
                        <Image className="w-8 h-8 mx-auto mb-4" style={{ color: colors.highlight }} />
                        <p className="text-sm font-medium" style={{ color: colors.softLight }}>No Cover Art</p>
                    </div>
                </div>
            )}

            {coverArtState.file && (
                <div className="p-4 border-t" style={{ borderColor: colors.highlight + '30' }}>
                    <button onClick={() => coverArtState.onFitChange(coverArtState.fit === 'contain' ? 'cover' : 'contain')} className="w-full h-12 rounded-xl text-sm font-semibold active:scale-95 transition-all" style={{ backgroundColor: colors.highlight, color: colors.darkBg }}>
                        {coverArtState.fit === 'contain' ? 'Zoom to Fill' : 'Shrink to Fit'}
                    </button>
                </div>
            )}

            <div className="p-4 border-t" style={{ borderColor: colors.highlight + '30' }}>
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="art-upload"
                    onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) {
                            const r = new FileReader();
                            r.onload = ev => coverArtState.onUpload(ev.target?.result);
                            r.readAsDataURL(f);
                        }
                        e.target.value = '';
                    }}
                />
                <label
                    htmlFor="art-upload"
                    className="w-full h-12 flex items-center justify-center rounded-xl text-sm font-semibold active:scale-95 transition-all"
                    style={{ ...(coverArtState.file ? { backgroundColor: colors.highlight } : gradient), color: colors.darkBg }}
                >
                    {coverArtState.file ? 'Change Image' : 'Upload Cover Art'}
                </label>
            </div>
        </div>
    </div>
));
CoverArtSection.displayName = 'CoverArtSection';

const SystemListSection = memo(({ colors, categories, searchQuery, onSearchChange, currentCore, onSelectSystem, isSearchFocused, setIsSearchFocused }: any) => (
    <div className="flex-1 flex flex-col min-w-0">
        <SearchBar
            colors={colors}
            value={searchQuery}
            onChange={onSearchChange}
            isFocused={isSearchFocused}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            inputRef={null}
        />
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide mt-4">
            {Object.entries(categories).map(([cat, systems]: [string, any]) => (
                <div key={cat} className="mb-6 last:mb-0">
                    <div className="flex items-center mb-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider pr-3" style={{ color: colors.highlight }}>{cat}</h4>
                        <div className="flex-1 h-px" style={{ backgroundColor: colors.highlight + '30' }} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {systems.map(([name, core]: any, idx: number) => {
                            const isSel = currentCore === core;
                            return (
                                <button
                                    key={core}
                                    onClick={() => onSelectSystem(core)}
                                    className="h-12 px-4 rounded-xl text-left border-[0.125rem] flex items-center justify-between transition-all active:scale-95"
                                    style={{
                                        backgroundColor: isSel ? colors.highlight : colors.midDark,
                                        borderColor: isSel ? colors.highlight : colors.midDark,
                                        color: isSel ? colors.darkBg : colors.softLight,
                                        animation: `fadeIn 0.4s ease-out ${idx * 0.03}s both`
                                    }}
                                >
                                    <span className="font-medium text-sm truncate pr-2 flex-1">{name}</span>
                                    {isSel && <CircleCheck className="w-5 h-5 flex-shrink-0" style={{ color: colors.darkBg }} />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    </div>
));
SystemListSection.displayName = 'SystemListSection';