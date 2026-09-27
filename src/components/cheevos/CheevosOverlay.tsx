'use client';

import { memo, useEffect, useState } from 'react';
import { Crown, Info, Medal, Trophy, TriangleAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ThemeColors } from '@/types';
import { DANGER_BG, DANGER_FG, SHADOW_CARD } from '@/lib/constants';
import { dismissCheevosToast, useCheevos, type CheevosToast, type ToastKind } from '@/lib/cheevos/store';
import { Badge } from '@/components/cheevos/Badge';
import { Chip } from '@/components/cheevos/AchievementsView';

const VISIBLE_MS: Record<ToastKind, number> = {
    achievement: 5000, mastery: 6000, leaderboard: 3500, info: 4000, error: 5000,
};
const FADE_MS = 300;

const KIND_ICON: Record<ToastKind, LucideIcon> = {
    achievement: Trophy, mastery: Crown, leaderboard: Medal, info: Info, error: TriangleAlert,
};

/**
 * In-game RetroAchievements UI. Toasts reuse the NavCard layout (icon tile,
 * bold title, highlight subtitle) and sit top-right, clear of the save/load
 * tile top-left; challenge/progress/tracker indicators use that same 40px
 * midDark tile, bottom-right.
 */
export const CheevosOverlay = memo(({ colors }: { colors: ThemeColors }) => {
    const { toasts, challenges, progress, trackers } = useCheevos();

    return (
        <>
            <div className="fixed top-4 right-4 z-[58] flex flex-col items-end gap-2 pointer-events-none w-[min(24rem,calc(100vw-2rem))]">
                {toasts.map(t => <Toast key={t.id} toast={t} colors={colors} />)}
            </div>

            <div className="fixed bottom-4 right-4 z-[54] flex flex-col items-end gap-2 pointer-events-none">
                {progress && (
                    <Tile colors={colors}>
                        <Badge url={progress.badgeUrl} size={40} colors={colors} />
                        <span className="pl-2.5 pr-3 text-sm font-medium tabular-nums" style={{ color: colors.softLight }}>
                            {progress.measuredProgress}
                        </span>
                    </Tile>
                )}
                {trackers.map(t => (
                    <Tile key={t.id} colors={colors}>
                        <span className="px-3 text-sm font-medium tabular-nums" style={{ color: colors.softLight }}>{t.display}</span>
                    </Tile>
                ))}
                {challenges.length > 0 && (
                    <div className="flex gap-2">
                        {challenges.map(c => (
                            <Tile key={c.id} colors={colors}>
                                <Badge url={c.badgeUrl} size={40} colors={colors} />
                            </Tile>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
});
CheevosOverlay.displayName = 'CheevosOverlay';

/** Matches EmulatorNotification's save/load tile. */
function Tile({ colors, children }: { colors: ThemeColors; children: React.ReactNode }) {
    return (
        <div
            className="h-10 min-w-10 rounded-xl flex items-center overflow-hidden backdrop-blur-sm shadow-lg"
            style={{ backgroundColor: colors.midDark, animation: 'fadeIn 0.3s ease-out both' }}
        >
            {children}
        </div>
    );
}

// Memoized: tracker updates (up to once a frame) re-render the overlay.
const Toast = memo(function Toast({ toast, colors }: { toast: CheevosToast; colors: ThemeColors }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Double rAF so the opacity:0 frame commits before the fade-in starts.
        let raf2 = 0;
        const raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(() => setVisible(true)); });
        const hide = setTimeout(() => setVisible(false), VISIBLE_MS[toast.kind]);
        const remove = setTimeout(() => dismissCheevosToast(toast.id), VISIBLE_MS[toast.kind] + FADE_MS);
        return () => {
            cancelAnimationFrame(raf1);
            cancelAnimationFrame(raf2);
            clearTimeout(hide);
            clearTimeout(remove);
        };
    }, [toast.id, toast.kind]);

    const Icon = KIND_ICON[toast.kind];
    const isError = toast.kind === 'error';

    return (
        <div
            role="status"
            className="w-full p-3 sm:p-4 rounded-xl border-[0.125rem] flex items-center gap-3 sm:gap-4 transition-opacity duration-300"
            style={{
                backgroundColor: colors.darkBg,
                borderColor: colors.midDark,
                boxShadow: SHADOW_CARD,
                opacity: visible ? 1 : 0,
                fontFamily: 'var(--font-lexend, system-ui)',
            }}
        >
            {toast.badgeUrl ? (
                <Badge url={toast.badgeUrl} size={48} colors={colors} />
            ) : (
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={isError
                        ? { backgroundColor: DANGER_BG, color: DANGER_FG }
                        : { backgroundColor: colors.midDark, color: colors.highlight }}
                >
                    <Icon className="w-6 h-6" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold leading-tight mb-1 break-words" style={{ color: colors.softLight }}>
                    {toast.title}
                </h3>
                {toast.description && (
                    <p className="text-xs sm:text-sm leading-relaxed opacity-80 line-clamp-2" style={{ color: colors.highlight }}>
                        {toast.description}
                    </p>
                )}
            </div>
            {toast.points ? <Chip colors={colors}>{toast.points} pts</Chip> : null}
        </div>
    );
});
