import type { ThemeColors } from '@/types';
import { ModalButton } from '@/components/Modal';
import { raGamePageUrl } from '@/lib/cheevos/types';

/** Footer button opening the game's page on retroachievements.org. */
export function RetroAchievementsPageButton({ gameId, colors }: { gameId: number; colors: ThemeColors }) {
    return (
        <ModalButton
            onClick={() => window.open(raGamePageUrl(gameId), '_blank', 'noopener,noreferrer')}
            colors={colors}
        >
            Game Page
        </ModalButton>
    );
}
