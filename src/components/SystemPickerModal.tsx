'use client';

import { memo, useMemo } from 'react';
import { Edit2 } from 'lucide-react';
import { SYSTEM_PICKER } from '@/lib/constants';
import { SearchBar } from '@/components/SearchBar';
import { TextInput } from '@/components/TextInput';
import { Modal, ModalHeader, ModalFooter, ModalButton } from '@/components/Modal';
import { OptionButton, SectionHeader, OPTION_GRID_CLASS } from '@/components/emulator/shared';
import { Game, ThemeColors, GradientStyle } from '@/types';

interface SystemPickerProps {
    isClosing: boolean;
    colors: ThemeColors;
    gradient: GradientStyle;
    editingGame: Game | null;
    pendingGame: Partial<Game> | null;
    pendingFiles: Array<{ file: File }>;
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

            <SearchBar colors={colors} value={searchQuery} onChange={onSearchChange} />
            <div className="flex-1 min-h-0 min-w-0 overflow-y-auto pr-2 mt-4">
                {Object.keys(categories).length === 0 ? (
                    <div className="text-center py-20 opacity-60">
                        <p style={{ color: colors.softLight }}>No systems found matching &quot;{searchQuery}&quot;</p>
                    </div>
                ) : (
                    Object.entries(categories).map(([cat, systems]) => (
                        <div key={cat} className="mb-8 last:mb-0">
                            <SectionHeader title={cat} colors={colors} />
                            <div className={OPTION_GRID_CLASS}>
                                {systems.map(([name, core], idx) => (
                                    <OptionButton
                                        key={core}
                                        label={name}
                                        active={currentCore === core}
                                        idx={idx}
                                        colors={colors}
                                        onClick={() => onSelectSystem(core)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ModalFooter colors={colors} align="end">
                {!editingGame && (
                    <ModalButton onClick={onClose} disabled={isClosing} colors={colors}>
                        Cancel
                    </ModalButton>
                )}
                {(editingGame || pendingFiles.length > 0) && (
                    <ModalButton
                        onClick={onDone}
                        disabled={isClosing || !systemSelected}
                        colors={colors}
                        variant="gradient"
                        gradient={gradient}
                        className="flex items-center gap-2"
                    >
                        Done
                    </ModalButton>
                )}
            </ModalFooter>
        </Modal>
    );
});
