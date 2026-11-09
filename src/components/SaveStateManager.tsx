'use client';

import { useRef } from 'react';
import { ThemeColors, GradientStyle } from '@/types';
import { SaveStatesPanel } from '@/components/emulator/SaveStatesPanel';
import { Modal, ModalHeader, ModalFooter, ModalButton } from '@/components/Modal';
import type { SlotRef } from '@/lib/savestates';

interface SaveStateManagerProps {
    isClosing: boolean;
    colors: ThemeColors;
    gradient: GradientStyle;
    gameTitle: string;
    gameName: string;
    onClose: () => void;
    onDuplicateError: (msg: string) => void;
    onLoadState?: (slot: SlotRef) => void;
    /** Save states are turned on in settings (else open on In-Game Saves). */
    statesEnabled: boolean;
}

export function SaveStateManager({
    isClosing, colors, gradient, gameTitle, gameName,
    onClose, onDuplicateError, onLoadState, statesEnabled,
}: SaveStateManagerProps) {
    const importRef = useRef<HTMLInputElement>(null);

    return (
        <Modal isClosing={isClosing} colors={colors} onClose={onClose} labelledBy="save-state-title">
            <div className="flex flex-col flex-1 min-h-0">
                <ModalHeader title="Manage Saves" subtitle={`Saves for ${gameTitle}`} colors={colors} id="save-state-title" />

                <SaveStatesPanel
                    colors={colors}
                    gameName={gameName}
                    gameTitle={gameTitle}
                    onDuplicateError={onDuplicateError}
                    importRef={importRef}
                    onLoad={onLoadState}
                    initialTab={statesEnabled ? 'state' : 'save'}
                />

                <ModalFooter colors={colors}>
                    <ModalButton onClick={e => { e.stopPropagation(); importRef.current?.click(); }} colors={colors}>
                        Import
                    </ModalButton>
                    <ModalButton onClick={onClose} colors={colors} variant="gradient" gradient={gradient}>
                        Done
                    </ModalButton>
                </ModalFooter>
            </div>
        </Modal>
    );
}
