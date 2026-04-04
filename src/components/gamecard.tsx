'use client';

import { memo, useCallback, useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { Game, ThemeColors, getGradientStyle } from '@/types';
import { GameContextMenu } from './gamecontextmenu';
import { getSystemAspectRatio } from '@/lib/constants';
import { stripExt } from '@/lib/utils';

interface GameCardProps {
    game: Game;
    onPlay: (game: Game) => void;
    onEdit: (game: Game) => void;
    onDelete: (game: Game) => void;
    onUploadCover: (gameId: number, data: string) => void;
    onResetCover: (gameId: number) => void;
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
    game, onPlay, onEdit, onDelete, onUploadCover, onResetCover, onSaveStates, colors, priority = false
}: GameCardProps) => {
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const didOpenMenu = useRef(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const isUploading = typeof game.progress === 'number';
    const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileHovered, setMobileHovered] = useState(false);
    const [imgError, setImgError] = useState(false);

    useEffect(() => () => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }, []);
    useEffect(() => { setImgError(false); }, [game.coverArt]);

    useEffect(() => {
        if (!mobileHovered) return;
        const dismiss = (e: Event) => {
            if (!cardRef.current?.contains(e.target as Node)) setMobileHovered(false);
        };
        document.addEventListener('touchstart', dismiss, { passive: true });
        document.addEventListener('mousedown', dismiss);
        return () => {
            document.removeEventListener('touchstart', dismiss);
            document.removeEventListener('mousedown', dismiss);
        };
    }, [mobileHovered]);

    const openMenu = useCallback((x: number, y: number) => {
        setMenuPos({ x, y });
        setMenuOpen(true);
    }, []);

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        openMenu(e.clientX, e.clientY);
    }, [openMenu]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        didOpenMenu.current = false;
        const { clientX, clientY } = e.touches[0];
        longPressTimer.current = setTimeout(() => {
            openMenu(clientX, clientY);
            didOpenMenu.current = true;
        }, 400);
    }, [openMenu]);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        if (didOpenMenu.current && e.cancelable) {
            e.preventDefault();
            didOpenMenu.current = false;
        }
    }, []);

    const handleClick = useCallback(() => {
        if (menuOpen) return;
        const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
        if (isTouch && !mobileHovered) { setMobileHovered(true); return; }
        onPlay(game);
    }, [menuOpen, mobileHovered, onPlay, game]);

    return (
        <div
            ref={cardRef}
            className={`group relative overflow-hidden w-full rounded-xl border-[0.125rem] transition-all duration-300
                ${isUploading ? 'cursor-default pointer-events-none' : 'cursor-pointer'}
                ${mobileHovered ? 'shadow-lg scale-[1.025]' : 'hover:shadow-lg hover:scale-[1.025]'}`}
            style={{ aspectRatio: getSystemAspectRatio(game.genre), backgroundColor: colors.midDark, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', borderColor: colors.midDark }}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {isUploading && <UploadOverlay progress={game.progress} isComplete={game.isComplete} colors={colors} />}

            <div className="h-full w-full relative flex items-center justify-center transition-transform duration-500 overflow-hidden"
                style={!game.coverArt || imgError ? getGradientStyle(colors.gradientFrom, colors.gradientTo) : undefined}>
                {game.coverArt && !imgError ? (
                    <Image
                        src={game.coverArt}
                        alt={game.title}
                        fill
                        sizes="(max-width: 640px) calc(50vw - 2rem), (max-width: 768px) 150px, (max-width: 1280px) calc(25vw - 2rem), 20vw"
                        loading="eager"
                        priority={priority}
                        draggable={false}
                        onError={() => setImgError(true)}
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
                onSaveStates={() => onSaveStates(game.title, stripExt(game.fileName || game.title))}
                gameTitle={game.title}
                colors={colors}
                hasAutoCover={!!game.autoCoverArt}
            />
        </div>
    );
});

GameCard.displayName = 'GameCard';
