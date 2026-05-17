'use client';

import { memo } from 'react';
import { ImageOff } from 'lucide-react';
import type { ThemeColors } from '@/types';
import { DEFAULT_COVER_ASPECT } from '@/lib/savestates';

interface SaveStateCoverProps {
    src: string | null;
    /** Used for the loading placeholder when `src` is missing. */
    fallbackAspect?: number;
    colors: ThemeColors;
    onAspectKnown?: (aspect: number) => void;
    /** Show a no-image icon when `src` is missing (not while a thumbnail is still generating). */
    showNoImage?: boolean;
}

/** Width-fills the card; height follows the image (or fallback aspect). */
export const SaveStateCover = memo(({
    src, fallbackAspect = DEFAULT_COVER_ASPECT, colors, onAspectKnown, showNoImage = false,
}: SaveStateCoverProps) => {
    if (!src) {
        return (
            <div
                className="w-full min-w-0 flex items-center justify-center"
                style={{ aspectRatio: fallbackAspect, backgroundColor: colors.midDark }}
            >
                {showNoImage && (
                    <ImageOff
                        className="w-8 h-8 opacity-40"
                        style={{ color: colors.highlight }}
                        aria-hidden
                    />
                )}
            </div>
        );
    }

    return (
        <div className="w-full min-w-0" style={{ backgroundColor: colors.midDark }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={src}
                alt=""
                decoding="async"
                draggable={false}
                className="block w-full h-auto max-w-full select-none"
                style={{ imageRendering: 'pixelated' }}
                onLoad={e => {
                    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
                    if (w > 0 && h > 0) onAspectKnown?.(w / h);
                }}
            />
        </div>
    );
});

SaveStateCover.displayName = 'SaveStateCover';
