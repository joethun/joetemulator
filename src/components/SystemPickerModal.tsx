'use client';

import { memo, useMemo } from 'react';
import { CircleCheck, Edit2 } from 'lucide-react';
import { SYSTEM_PICKER } from '@/lib/constants';
import { SearchBar } from '@/components/SearchBar';
import { TextInput } from '@/components/TextInput';
import { Modal, ModalHeader, ModalFooter } from '@/components/Modal';
import { Game, ThemeColors, GradientStyle } from '@/types';

interface SystemPickerProps {
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
    pendingBatchCore: string | null;
}

export const SystemPickerModal = memo(function SystemPickerModal({
    isClosing, colors, gradient, editingGame, pendingGame, pendingFiles,
    searchQuery, onSearchChange, onClose, onDone, onSelectSystem, onRename,
    pendingBatchCore,
}: SystemPickerProps) {
    const currentCore = editingGame?.core || (pendingFiles.length > 1 ? pendingBatchCore : pendingGame?.core);
    const canRename = !!editingGame || pendingFiles.length === 1;
    const currentTitle = editingGame ? editingGame.title : (pendingGame?.title || '');
    const query = searchQuery.toLowerCase();
    const systemSelected = !!currentCore;
    const headerSubtitle = editingGame
        ? 'Change game system'
        : pendingFiles.length > 1
            ? `Choose system for ${pendingFiles.length} files`
            : 'Select a system for your game';
    const headerTitle = pendingFiles.length > 1 ? `Add ${pendingFiles.length} Games` : 'Select System';

    const categories = useMemo(() => {
        const result: Record<string, Array<[string, string]>> = {};
        for (const [cat, systems] of Object.entries(SYSTEM_PICKER)) {
            const matches = Object.entries(systems).filter(([name]) => name.toLowerCase().includes(query));
            if (matches.length) result[cat] = matches;
        }
        return result;
    }, [query]);

    return (
        <Modal isClosing={isClosing} colors={colors} onClose={onClose} labelledBy="system-picker-title">
            {canRename ? (
                <div className="mb-6">
                    <div className="mb-2">
                        <TextInput
                            colors={colors}
                            value={currentTitle}
                            onChange={onRename}
                            onKeyDown={e => { if (e.key === 'Enter') onDone(); }}
                            leftIcon={<Edit2 className="w-6 h-6" />}
                            size="lg"
                            placeholder="Game Title"
                            ariaLabel="Game title"
                            id="system-picker-title"
                            inputClassName="text-2xl font-bold pr-6"
                        />
                    </div>
                    <p className="text-sm opacity-80" style={{ color: colors.highlight }}>{headerSubtitle}</p>
                </div>
            ) : (
                <ModalHeader title={headerTitle} subtitle={headerSubtitle} colors={colors} id="system-picker-title" />
            )}

            <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
                <SearchBar colors={colors} value={searchQuery} onChange={onSearchChange} />
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
                                                animation: `fadeIn 0.4s ease-out ${idx * 0.03}s both`,
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

            <ModalFooter colors={colors} align="end">
                {!editingGame && (
                    <button
                        onClick={onClose}
                        disabled={isClosing}
                        className="h-12 px-8 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                        style={{ backgroundColor: colors.highlight, color: colors.darkBg }}
                    >
                        Cancel
                    </button>
                )}
                {(editingGame || pendingFiles.length > 0) && (
                    <button
                        onClick={onDone}
                        disabled={isClosing || !systemSelected}
                        className="h-12 px-8 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                        style={{ ...gradient, color: colors.darkBg }}
                    >
                        Done
                    </button>
                )}
            </ModalFooter>
        </Modal>
    );
});
