'use client';

import { memo, useEffect, useState } from 'react';
import { Crown, Info, Medal, Trophy, TriangleAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ThemeColors } from '@/types';
import type { RAAchievement } from '@/lib/cheevos/types';
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
 * tile top-left. The progress indicator is a compact card below them;
 * challenge/tracker indicators use the save/load tile's 40px midDark tile,
 * bottom-right.
 */
export const CheevosOverlay = memo(({ colors, onOpenAchievement }: {
    colors: ThemeColors;
    /** Opens the Achievements tab scrolled to (and highlighting) this achievement. */
    onOpenAchievement?: (id: number) => void;
}) => {
    const { toasts, challenges, progress, trackers } = useCheevos();

    return (
        <>
            <div className="fixed top-4 right-4 z-[58] flex flex-col items-end gap-2 pointer-events-none w-[min(24rem,calc(100vw-2rem))]">
                {toasts.map(t => <Toast key={t.id} toast={t} colors={colors} onOpenAchievement={onOpenAchievement} />)}
                <ProgressToast progress={progress} colors={colors} onOpenAchievement={onOpenAchievement} />
            </div>

            <div className="fixed bottom-4 right-4 z-[54] flex flex-col items-end gap-2 pointer-events-none">
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
const Toast = memo(function Toast({ toast, colors, onOpenAchievement }: {
    toast: CheevosToast;
    colors: ThemeColors;
    onOpenAchievement?: (id: number) => void;
}) {
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

    return (
        <ToastCard
            colors={colors}
            visible={visible}
            kind={toast.kind}
            title={toast.title}
            description={toast.description}
            badgeUrl={toast.badgeUrl}
            chip={toast.points ? `${toast.points} pts` : null}
            onClick={onOpenAchievement && toast.achievementId != null
                ? () => onOpenAchievement(toast.achievementId!) : undefined}
        />
    );
});

/** The achievement's progress ("3/10") as a toast; lingers through its fade-out
 *  after the session clears it. */
function ProgressToast({ progress, colors, onOpenAchievement }: {
    progress: RAAchievement | null;
    colors: ThemeColors;
    onOpenAchievement?: (id: number) => void;
}) {
    const [shown, setShown] = useState(progress);
    const [entered, setEntered] = useState(false);
    if (progress && progress !== shown) setShown(progress);
    const active = progress !== null;

    useEffect(() => {
        if (active) {
            // Double rAF so the opacity:0 frame commits before the fade-in starts.
            let raf2 = 0;
            const raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(() => setEntered(true)); });
            return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
        }
        const remove = setTimeout(() => { setEntered(false); setShown(null); }, FADE_MS);
        return () => clearTimeout(remove);
    }, [active]);

    if (!shown) return null;
    return (
        <div className="w-[min(18rem,calc(100vw-2rem))]">
            <ToastCard
                compact
                colors={colors}
                visible={active && entered}
                kind="achievement"
                title={shown.title}
                description={shown.description}
                badgeUrl={shown.badgeUrl}
                chip={shown.measuredProgress}
                onClick={onOpenAchievement ? () => onOpenAchievement(shown.id) : undefined}
            />
        </div>
    );
}

function ToastCard({ compact = false, colors, visible, kind, title, description, badgeUrl, chip, onClick }: {
    /** Smaller card for the progress indicator. */
    compact?: boolean;
    colors: ThemeColors;
    visible: boolean;
    kind: ToastKind;
    title: string;
    description?: string;
    badgeUrl?: string | null;
    chip?: React.ReactNode;
    onClick?: () => void;
}) {
    const Icon = KIND_ICON[kind];
    const isError = kind === 'error';

    // The overlay ignores the pointer; clickable cards opt back in while shown.
    const Root = onClick ? 'button' : 'div';
    return (
        <Root
            role={onClick ? undefined : 'status'}
            aria-live="polite"
            type={onClick ? 'button' : undefined}
            onClick={onClick}
            className={`w-full rounded-xl border-[0.125rem] flex items-center text-left transition-opacity duration-300 ${compact ? 'p-2 gap-2.5' : 'p-3 sm:p-4 gap-3 sm:gap-4'} ${onClick && visible ? 'pointer-events-auto cursor-pointer' : ''}`}
            style={{
                backgroundColor: colors.darkBg,
                borderColor: colors.midDark,
                boxShadow: SHADOW_CARD,
                opacity: visible ? 1 : 0,
                fontFamily: 'var(--font-lexend, system-ui)',
            }}
        >
            {badgeUrl ? (
                <Badge url={badgeUrl} size={compact ? 36 : 48} colors={colors} />
            ) : (
                <div
                    className={`${compact ? 'w-9 h-9' : 'w-12 h-12'} rounded-xl flex items-center justify-center shrink-0`}
                    style={isError
                        ? { backgroundColor: DANGER_BG, color: DANGER_FG }
                        : { backgroundColor: colors.midDark, color: colors.highlight }}
                >
                    <Icon className="w-6 h-6" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <h3
                    className={`font-bold leading-tight ${compact ? 'text-sm truncate' : 'text-base mb-1 break-words'}`}
                    style={{ color: colors.softLight }}
                >
                    {title}
                </h3>
                {description && !compact && (
                    <p className="text-xs sm:text-sm leading-relaxed opacity-80 truncate" style={{ color: colors.highlight }}>
                        {description}
                    </p>
                )}
            </div>
            {chip ? <Chip colors={colors}>{chip}</Chip> : null}
        </Root>
    );
}
