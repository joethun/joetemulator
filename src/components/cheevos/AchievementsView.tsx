'use client';

import { Trophy } from 'lucide-react';
import type { ThemeColors } from '@/types';
import { SHADOW_CARD } from '@/lib/constants';
import { RA_BUCKET, type AchievementsSummary, type RAAchievement, type RAAchievementBucket } from '@/lib/cheevos/types';
import { Badge } from '@/components/cheevos/Badge';
import { EmptyState, SectionHeader } from '@/components/emulator/shared';

/**
 * Game summary card plus the Unlocked / Locked / Unsupported sections.
 * Shared by the in-game Achievements tab and the library's Achievements modal.
 */
export function AchievementsView({ colors, summary, buckets }: {
    colors: ThemeColors;
    summary: AchievementsSummary;
    buckets: RAAchievementBucket[];
}) {
    const { title, badgeUrl, unlocked, total, pointsUnlocked, pointsTotal } = summary;
    const pct = total ? Math.round((unlocked / total) * 100) : 0;

    return (
        <div className="flex flex-col gap-6 min-w-0">
            <div
                className="p-4 sm:p-6 rounded-xl border-[0.125rem] flex items-center gap-3 sm:gap-5"
                style={{
                    backgroundColor: colors.darkBg,
                    borderColor: colors.midDark,
                    boxShadow: SHADOW_CARD,
                    animation: 'fadeIn 0.4s ease-out both',
                }}
            >
                <Badge url={badgeUrl} size={48} colors={colors} />
                <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold leading-tight mb-1 break-words" style={{ color: colors.softLight }}>
                        {title}
                    </h3>
                    <p className="text-xs sm:text-sm leading-relaxed opacity-80 break-words" style={{ color: colors.highlight }}>
                        {unlocked} of {total} unlocked · {pointsUnlocked} of {pointsTotal} points
                    </p>
                    <div className="h-1 mt-3 rounded-full overflow-hidden" style={{ backgroundColor: `${colors.highlight}30` }}>
                        <div className="h-full rounded-full transition-all duration-200" style={{ width: `${pct}%`, backgroundColor: colors.highlight }} />
                    </div>
                </div>
            </div>

            {buckets.map(bucket => bucket.achievements.length > 0 && (
                <div key={`${bucket.bucketType}-${bucket.subsetId}-${bucket.label}`}>
                    <SectionHeader title={bucket.label} colors={colors} />
                    <div className="flex flex-col gap-2.5">
                        {bucket.achievements.map((a, idx) => (
                            <AchievementRow key={a.id} achievement={a} bucketType={bucket.bucketType} colors={colors} idx={idx} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export type AchievementsEmptyKind = 'logged-out' | 'loading' | 'unsupported' | 'unknown-game' | 'no-achievements' | 'error';

const EMPTY_TITLE: Record<AchievementsEmptyKind, string> = {
    'logged-out': 'Not logged in',
    loading: 'Loading achievements…',
    unsupported: 'Achievements unavailable',
    'unknown-game': 'Game not recognized',
    'no-achievements': 'No achievements yet',
    error: "Couldn't load achievements",
};

export function AchievementsEmptyState({ colors, kind, text }: { colors: ThemeColors; kind: AchievementsEmptyKind; text: string }) {
    return (
        <div className="flex flex-col min-w-0 h-full" style={{ minHeight: '320px' }}>
            <EmptyState icon={Trophy} title={EMPTY_TITLE[kind]} text={text} colors={colors} className="flex-1 px-4" />
        </div>
    );
}

/** Same chip as the Controls panel's key bindings. */
export function Chip({ colors, children }: { colors: ThemeColors; children: React.ReactNode }) {
    return (
        <span
            className="px-2.5 h-8 rounded-lg flex items-center justify-center text-sm font-medium tabular-nums shrink-0"
            style={{ backgroundColor: colors.midDark, color: colors.softLight }}
        >
            {children}
        </span>
    );
}

/** Row styled like the Controls panel's binding rows, with chips trailing. */
function AchievementRow({ achievement: a, bucketType, colors, idx }: {
    achievement: RAAchievement; bucketType: number; colors: ThemeColors; idx: number;
}) {
    const isUnlocked = a.unlocked !== 0 || bucketType === RA_BUCKET.UNLOCKED;
    const unsupported = bucketType === RA_BUCKET.UNSUPPORTED;
    const progress = !isUnlocked && a.measuredPercent > 0 ? a.measuredProgress : null;

    return (
        <div
            className="p-3 rounded-xl border-[0.125rem] flex items-center gap-3"
            style={{
                backgroundColor: colors.darkBg,
                borderColor: colors.midDark,
                opacity: unsupported ? 0.5 : 1,
                animation: `fadeIn 0.4s ease-out ${Math.min(idx, 15) * 0.03}s both`,
            }}
        >
            {/* RA serves a greyscale "_lock" variant for locked achievements. */}
            <Badge url={isUnlocked ? a.badgeUrl : (a.badgeLockedUrl ?? a.badgeUrl)} size={48} colors={colors} rounded="rounded-lg" />
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: colors.softLight }}>{a.title}</div>
                <p className="text-xs leading-relaxed opacity-80 line-clamp-2" style={{ color: colors.highlight }}>
                    {unsupported ? 'Not supported by this core.' : a.description}
                </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
                {progress && <Chip colors={colors}>{progress}</Chip>}
                <Chip colors={colors}>{a.points} pts</Chip>
            </div>
        </div>
    );
}
