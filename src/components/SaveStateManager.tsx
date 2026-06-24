'use client';

import { useRef } from 'react';
import { ThemeColors, GradientStyle } from '@/types';
import { SaveStatesPanel } from '@/components/emulator/SaveStatesPanel';
import { Modal, ModalHeader, ModalFooter, ModalButton } from '@/components/Modal';

interface SaveStateManagerProps {
    isClosing: boolean;
    colors: ThemeColors;
    gradient: GradientStyle;
    gameTitle: string;
    gameName: string;
    onClose: () => void;
    onDuplicateError: (msg: string) => void;
    onLoadState?: (key: string) => void;
}

export function SaveStateManager({
    isClosing, colors, gradient, gameTitle, gameName,
    onClose, onDuplicateError, onLoadState,
}: SaveStateManagerProps) {
    const importRef = useRef<HTMLInputElement>(null);

    return (
        <Modal isClosing={isClosing} colors={colors} onClose={onClose} labelledBy="save-state-title">
            <div className="flex flex-col flex-1 min-h-0">
                <ModalHeader title="Manage States" subtitle={`Manage states for ${gameTitle}`} colors={colors} id="save-state-title" />

                <div className="flex-1 overflow-y-auto min-h-0" style={{ padding: '2px', margin: '-2px' }}>
                    <SaveStatesPanel
                        colors={colors}
                        gameName={gameName}
                        gameTitle={gameTitle}
                        onDuplicateError={onDuplicateError}
                        importRef={importRef}
                        onLoad={onLoadState}
                    />
                </div>

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
