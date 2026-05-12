'use client';

import { useRef } from 'react';
import { ThemeColors, GradientStyle } from '@/types';
import { SaveStatesPanel } from '@/components/emulator/SaveStatesPanel';
import { Modal, ModalHeader, ModalFooter } from '@/components/modal';

interface SaveStateManagerProps {
    isOpen: boolean;
    isClosing: boolean;
    colors: ThemeColors;
    gradient: GradientStyle;
    gameTitle: string;
    gameName: string;
    onClose: () => void;
    onDuplicateError: (msg: string) => void;
    showBack?: boolean;
    onLoad?: (key: string) => void;
}

export function SaveStateManager({
    isOpen, isClosing, colors, gradient, gameTitle, gameName,
    onClose, onDuplicateError, showBack, onLoad,
}: SaveStateManagerProps) {
    const importRef = useRef<HTMLInputElement>(null);
    if (!isOpen && !isClosing) return null;

    return (
        <Modal isClosing={isClosing} colors={colors} onClose={onClose} labelledBy="save-state-title">
            <ModalHeader title="Manage States" subtitle={gameTitle} colors={colors} id="save-state-title" />

            <div className="flex flex-col min-w-0 overflow-y-auto" style={{ height: '320px', padding: '2px', margin: '-2px' }}>
                <SaveStatesPanel
                    colors={colors}
                    gameName={gameName}
                    gameTitle={gameTitle}
                    onDuplicateError={onDuplicateError}
                    onLoad={onLoad}
                    importRef={importRef}
                />
            </div>

            <ModalFooter colors={colors}>
                <button onClick={e => { e.stopPropagation(); importRef.current?.click(); }}
                    className="h-12 px-8 rounded-xl font-bold transition-all active:scale-95 cursor-pointer"
                    style={{ backgroundColor: colors.highlight, color: colors.darkBg }}>
                    Import
                </button>
                <button onClick={onClose}
                    className="h-12 px-8 rounded-xl font-bold transition-all active:scale-95 cursor-pointer"
                    style={{ ...gradient, color: colors.darkBg }}>
                    {showBack ? 'Back' : 'Done'}
                </button>
            </ModalFooter>
        </Modal>
    );
}
