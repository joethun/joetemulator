import Image from 'next/image';
import { Trophy } from 'lucide-react';
import type { ThemeColors } from '@/types';

interface BadgeProps {
    url: string | null | undefined;
    size: number;
    colors: Pick<ThemeColors, 'midDark' | 'highlight'>;
    rounded?: string;
}

/**
 * RA badge art, shaped like the site's icon tiles. Falls back to a trophy
 * tile. media.retroachievements.org sends CORS headers but no
 * Cross-Origin-Resource-Policy, so under this site's COEP: require-corp the
 * image must be fetched in CORS mode (crossOrigin="anonymous") to load.
 */
export function Badge({ url, size, colors, rounded = 'rounded-xl' }: BadgeProps) {
    if (!url) {
        return (
            <div
                className={`${rounded} flex items-center justify-center shrink-0`}
                style={{ width: size, height: size, backgroundColor: colors.midDark, color: colors.highlight }}
            >
                <Trophy style={{ width: size / 2, height: size / 2 }} />
            </div>
        );
    }
    return (
        <Image
            src={url}
            alt=""
            width={size}
            height={size}
            unoptimized
            crossOrigin="anonymous"
            draggable={false}
            className={`${rounded} shrink-0 select-none`}
            style={{ width: size, height: size, backgroundColor: colors.midDark }}
        />
    );
}
