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

const CIRCUMFERENCE = 2 * Math.PI * 40; // r=40

const UploadOverlay = memo(({ progress, isComplete, colors }: { progress?: number; isComplete?: boolean; colors: ThemeColors }) => (
    <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-500 ${isComplete ? 'opacity-0' : 'opacity-100'}`}>
        <div className="relative w-20 h-20 md:w-24 md:h-24">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke={colors.midDark} strokeWidth="10" className="opacity-80" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={colors.highlight} strokeWidth="10"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={CIRCUMFERENCE * (1 - (progress ?? 0) / 100)}
                    strokeLinecap="round" className="transition-all duration-200" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-extrabold" style={{ color: colors.softLight }}>{Math.round(progress ?? 0)}%</span>
            </div>
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] animate-pulse" style={{ color: colors.highlight }}>Uploading</p>
    </div>
));
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
