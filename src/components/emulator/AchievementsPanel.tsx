'use client';

import { memo, useState } from 'react';
import type { ThemeColors } from '@/types';
import { cheevos } from '@/lib/cheevos/client';
import { CHEEVOS_MESSAGE, useCheevosSelector, type CheevosStatus } from '@/lib/cheevos/store';
import type { RAAchievementBucket } from '@/lib/cheevos/types';
import {
    AchievementsEmptyState, AchievementsView, type AchievementsEmptyKind,
} from '@/components/cheevos/AchievementsView';

const readBuckets = (active: boolean): RAAchievementBucket[] => active ? cheevos.getAchievements() : [];

const EMPTY_KIND: Partial<Record<CheevosStatus, AchievementsEmptyKind>> = {
    idle: 'logged-out',
    loading: 'loading',
    'no-achievements': 'no-achievements',
    'unknown-game': 'unknown-game',
    unsupported: 'unsupported',
    error: 'error',
};

const EMPTY_TEXT: Partial<Record<CheevosStatus, string>> = {
    idle: 'Log in to RetroAchievements from Settings to earn achievements.',
    loading: CHEEVOS_MESSAGE.identifying,
    'no-achievements': CHEEVOS_MESSAGE.noAchievements,
};

export const AchievementsPanel = memo(({ colors }: { colors: ThemeColors }) => {
    const status = useCheevosSelector(s => s.status);
    const message = useCheevosSelector(s => s.message);
    const game = useCheevosSelector(s => s.game);
    const listVersion = useCheevosSelector(s => s.listVersion);
    const active = status === 'active';
    // The game is paused while this panel is open, so rc_client's list only
    // changes with the session status or an unlock (listVersion). Re-read it
    // then, during render rather than in an effect.
    const [snapshot, setSnapshot] = useState(() => ({ active, listVersion, buckets: readBuckets(active) }));
    if (snapshot.active !== active || snapshot.listVersion !== listVersion) {
        setSnapshot({ active, listVersion, buckets: readBuckets(active) });
    }

    if (!active || !game) {
        return (
            <AchievementsEmptyState
                colors={colors}
                kind={EMPTY_KIND[status] ?? 'unsupported'}
                text={EMPTY_TEXT[status] ?? message ?? 'Achievements are unavailable for this game.'}
            />
        );
    }

    const s = game.summary;
    return (
        <AchievementsView
            colors={colors}
            buckets={snapshot.buckets}
            summary={{
                title: game.title,
                badgeUrl: game.badgeUrl,
                unlocked: s.numUnlockedAchievements,
                total: s.numCoreAchievements,
                pointsUnlocked: s.pointsUnlocked,
                pointsTotal: s.pointsCore,
            }}
        />
    );
});
AchievementsPanel.displayName = 'AchievementsPanel';
