'use client';

import { memo, useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { Game, ThemeColors, getGradientStyle } from '@/types';
import { GameContextMenu } from './GameContextMenu';
import { getSystemAspectRatio, SHADOW_CARD } from '@/lib/constants';
import { gameSaveName } from '@/lib/utils';
import { TOUCH_QUERY } from '@/hooks/useIsTouch';

interface GameCardProps {
    game: Game;
    onPlay: (game: Game) => void;
    onEdit: (game: Game) => void;
    onDelete: (game: Game) => void;
    onUploadCover: (gameId: number, data: string) => void;
    onResetCover: (gameId: number) => void;
    onCoverFailed: (gameId: number) => void;
    onSaveStates: (title: string, name: string) => void;
    colors: ThemeColors;
    priority?: boolean;
}

const UploadOverlay = memo(({ progress, isComplete, colors }: { progress?: number; isComplete?: boolean; colors: ThemeColors }) => {
    const pct = Math.round(progress ?? 0);
    return (
        <div className={`absolute inset-x-0 bottom-0 z-10 px-3 py-2.5 transition-opacity duration-300 ${isComplete ? 'opacity-0' : 'opacity-100'}`}
            style={{ backgroundColor: colors.midDark }}>
            <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: colors.highlight }}>
                    Uploading
                </span>
                <span className="text-xs font-extrabold tabular-nums" style={{ color: colors.softLight }}>
                    {pct}%
                </span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: `${colors.highlight}30` }}>
                <div className="h-full rounded-full transition-all duration-200"
                    style={{ width: `${pct}%`, backgroundColor: colors.highlight }} />
            </div>
        </div>
    );
});
UploadOverlay.displayName = 'UploadOverlay';

export const GameCard = memo(({
    game, onPlay, onEdit, onDelete, onUploadCover, onResetCover, onCoverFailed, onSaveStates, colors, priority = false
}: GameCardProps) => {
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const didOpenMenu = useRef(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const isUploading = typeof game.progress === 'number';
    const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileHovered, setMobileHovered] = useState(false);
    const [erroredSrc, setErroredSrc] = useState<string>();
    const imgError = !!game.coverArt && erroredSrc === game.coverArt;

    useEffect(() => () => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }, []);

    useEffect(() => {
        if (!mobileHovered) return;
        const dismiss = (e: Event) => {
            if (!cardRef.current?.contains(e.target as Node)) setMobileHovered(false);
        };
        const events = ['touchstart', 'mousedown'] as const;
        events.forEach(ev => document.addEventListener(ev, dismiss));
        return () => events.forEach(ev => document.removeEventListener(ev, dismiss));
    }, [mobileHovered]);

    const openMenu = (x: number, y: number) => {
        setMenuPos({ x, y });
        setMenuOpen(true);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        didOpenMenu.current = false;
        const { clientX, clientY } = e.touches[0];
        longPressTimer.current = setTimeout(() => {
            openMenu(clientX, clientY);
            didOpenMenu.current = true;
        }, 400);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        if (didOpenMenu.current && e.cancelable) {
            e.preventDefault();
            didOpenMenu.current = false;
        }
    };

    const handleClick = () => {
        if (menuOpen) return;
        const isTouch = window.matchMedia(TOUCH_QUERY).matches;
        if (isTouch && !mobileHovered) { setMobileHovered(true); return; }
        onPlay(game);
    };

    return (
        <div
            ref={cardRef}
            className={`group relative overflow-hidden w-full rounded-xl border-[0.125rem] transition-all duration-300
                ${isUploading ? 'cursor-default pointer-events-none' : 'cursor-pointer'}
                ${mobileHovered ? 'shadow-lg scale-[1.025]' : 'hover:shadow-lg hover:scale-[1.025]'}`}
            style={{ aspectRatio: getSystemAspectRatio(game.genre), backgroundColor: colors.midDark, boxShadow: SHADOW_CARD, borderColor: colors.midDark }}
            onClick={handleClick}
            onContextMenu={e => { e.preventDefault(); openMenu(e.clientX, e.clientY); }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {isUploading && <UploadOverlay progress={game.progress} isComplete={game.isComplete} colors={colors} />}

            <div className="h-full w-full relative flex items-center justify-center transition-transform duration-500 overflow-hidden"
                style={!game.coverLoading && (!game.coverArt || imgError) ? getGradientStyle(colors.gradientFrom, colors.gradientTo) : undefined}>
                {game.coverLoading ? null : game.coverArt && !imgError ? (
                    <Image
                        src={game.coverArt}
                        alt={game.title}
                        fill
                        sizes="320px"
                        loading="eager"
                        priority={priority}
                        draggable={false}
                        onError={() => {
                            setErroredSrc(game.coverArt);
                            onCoverFailed(game.id);
                        }}
                        style={{ objectFit: game.coverArtFit || 'cover', objectPosition: 'center', userSelect: 'none' }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full w-full px-2 sm:px-4" style={{ color: colors.darkBg }}>
                        <span className="block w-full text-lg sm:text-xl md:text-2xl font-bold tracking-wide text-center break-words select-none line-clamp-4 pointer-events-none" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)', hyphens: 'auto' }}>
                            {game.title}
                        </span>
                    </div>
                )}
            </div>

            <GameContextMenu
                isOpen={menuOpen}
                position={menuPos}
                onClose={() => setMenuOpen(false)}
                onEdit={() => onEdit(game)}
                onDelete={() => onDelete(game)}
                onUploadCover={(data) => onUploadCover(game.id, data)}
                onResetCover={() => onResetCover(game.id)}
                onSaveStates={() => onSaveStates(game.title, gameSaveName(game))}
                gameTitle={game.title}
                colors={colors}
                hasCustomCover={!!game.autoCoverArt && !!game.coverArt && game.coverArt !== game.autoCoverArt}
            />
        </div>
    );
});

GameCard.displayName = 'GameCard';
