'use client';

import { memo, useMemo } from 'react';
import { SYSTEM_PICKER } from '@/lib/constants';
import { pendingFileNames, stripExt } from '@/lib/utils';
import { SearchBar } from '@/components/SearchBar';
import { Modal, ModalHeader, ModalFooter, ModalButton } from '@/components/Modal';
import { OptionButton, SectionHeader, OPTION_GRID_CLASS } from '@/components/emulator/shared';
import { Game, PendingFile, ThemeColors, GradientStyle } from '@/types';

interface SystemPickerProps {
    isClosing: boolean;
    colors: ThemeColors;
    gradient: GradientStyle;
    pendingGame: Partial<Game> | null;
    pendingFiles: PendingFile[];
    searchQuery: string;
    onSearchChange: (q: string) => void;
    onClose: () => void;
    onDone: () => void;
    onSelectSystem: (core: string) => void;
    pendingBatchCore: string | null;
}

export const SystemPickerModal = memo(function SystemPickerModal({
    isClosing, colors, gradient, pendingGame, pendingFiles,
    searchQuery, onSearchChange, onClose, onDone, onSelectSystem,
    pendingBatchCore,
}: SystemPickerProps) {
    const currentCore = pendingFiles.length > 1 ? pendingBatchCore : pendingGame?.core;
    const query = searchQuery.toLowerCase();
    const systemSelected = !!currentCore;
    const firstFileName = pendingFiles[0] ? pendingFileNames(pendingFiles[0])[0] : null;
    const headerSubtitle = pendingFiles.length > 1
        ? `Choose system for ${pendingFiles.length} files`
        : `Select a system for ${pendingGame?.title || stripExt(firstFileName ?? 'your game')}`;
    const headerTitle = pendingFiles.length > 1 ? `Add ${pendingFiles.length} Games` : 'System';

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
            <ModalHeader title={headerTitle} subtitle={headerSubtitle} colors={colors} id="system-picker-title" />

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
                <ModalButton onClick={onClose} disabled={isClosing} colors={colors}>
                    Cancel
                </ModalButton>
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
            </ModalFooter>
        </Modal>
    );
});
