'use client';

import { useRef } from 'react';
import { ThemeColors, GradientStyle } from '@/types';
import { SaveStatesPanel } from '@/components/emulator/SaveStatesPanel';
import { Modal, ModalHeader, ModalFooter } from '@/components/Modal';

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
        <Modal isClosing={isClosing} colors={colors} onClose={onClose} height="tall" labelledBy="save-state-title">
            <div className="flex flex-col flex-1 min-h-0">
                <ModalHeader title="Manage States" subtitle={gameTitle} colors={colors} id="save-state-title" />

                <div className="flex-1 overflow-y-auto min-h-0" style={{ padding: '2px', margin: '-2px' }}>
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
            </div>
        </Modal>
    );
}
