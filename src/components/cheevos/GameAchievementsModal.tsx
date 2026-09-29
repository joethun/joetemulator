'use client';

import { useEffect, useState } from 'react';
import type { Game, GradientStyle, ThemeColors } from '@/types';
import { Modal, ModalButton, ModalFooter, ModalHeader } from '@/components/Modal';
import { AchievementsEmptyState, AchievementsView } from '@/components/cheevos/AchievementsView';
import { fetchLibraryAchievements, type LibraryAchievementsResult } from '@/lib/cheevos/library';
import { CHEEVOS_MESSAGE } from '@/lib/cheevos/store';
import { RetroAchievementsPageButton } from '@/components/cheevos/RetroAchievementsPageButton';

interface GameAchievementsModalProps {
    isClosing: boolean;
    colors: ThemeColors;
    gradient: GradientStyle;
    game: Game;
    hardcore: boolean;
    onClose: () => void;
}

/** A library game's RetroAchievements, opened from its context menu.
 *  Keyed by game id, so a different game always starts from "Loading". */
export function GameAchievementsModal({ isClosing, colors, gradient, game, hardcore, onClose }: GameAchievementsModalProps) {
    const [current, setCurrent] = useState<LibraryAchievementsResult | null>(null);

    useEffect(() => {
        let active = true;
        fetchLibraryAchievements(game, hardcore).then(value => {
            if (active) setCurrent(value);
        });
        return () => { active = false; };
    }, [game, hardcore]);

    return (
        <Modal isClosing={isClosing} colors={colors} onClose={onClose} labelledBy="game-achievements-title">
            <div className="flex flex-col flex-1 min-h-0">
                <ModalHeader title="Achievements" subtitle={`Achievements for ${game.title}`} colors={colors} id="game-achievements-title" />

                <div className="flex-1 overflow-y-auto min-h-0" style={{ padding: '2px', margin: '-2px' }}>
                    {!current ? (
                        <AchievementsEmptyState colors={colors} kind="loading" text={CHEEVOS_MESSAGE.identifying} />
                    ) : current.kind === 'ok' ? (
                        <AchievementsView colors={colors} summary={current.summary} buckets={current.buckets} hardcore={hardcore} />
                    ) : (
                        <AchievementsEmptyState colors={colors} kind={current.kind} text={current.message} />
                    )}
                </div>

                <ModalFooter colors={colors}>
                    <div>
                        {current?.kind === 'ok' && <RetroAchievementsPageButton gameId={current.gameId} colors={colors} />}
                    </div>
                    <ModalButton onClick={onClose} colors={colors} variant="gradient" gradient={gradient}>
                        Done
                    </ModalButton>
                </ModalFooter>
            </div>
        </Modal>
    );
}
