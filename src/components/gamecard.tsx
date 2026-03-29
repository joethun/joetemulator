'use client';

import { memo, useCallback, useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { Trash2, Check } from 'lucide-react';
import { Game, ThemeColors, getGradientStyle } from '@/types';
import { GameContextMenu } from './gamecontextmenu';
import { getSystemAspectRatio } from '@/lib/constants';

interface GameCardProps {
  game: Game;
  onPlay: (game: Game) => void;
  onEdit: (game: Game) => void;
  onDelete: (game: Game) => void;
  onSelect: (gameId: number) => void;
  onUploadCover: (gameId: number, data: string) => void;
  onResetCover: (gameId: number) => void;
  isSelected: boolean;
  isDeleteMode: boolean;
  onEnterDeleteMode: () => void;
  onCoverArtClick?: (game: Game) => void;
  colors: ThemeColors;
}

const UploadOverlay = memo(({ progress, isComplete, colors }: { progress?: number, isComplete?: boolean, colors: ThemeColors }) => (
  <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-500 ${isComplete ? 'opacity-0' : 'opacity-100'}`}>
    <div className="relative w-20 h-20 md:w-24 md:h-24">
      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke={colors.midDark} strokeWidth="10" className="opacity-80" />
        <circle cx="50" cy="50" r="40" fill="none" stroke={colors.highlight} strokeWidth="10" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - (progress ?? 0) / 100)} strokeLinecap="round" className="transition-all duration-200" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-extrabold" style={{ color: colors.softLight }}>{Math.round(progress ?? 0)}%</span>
      </div>
    </div>
    <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] animate-pulse" style={{ color: colors.highlight }}>Uploading</p>
  </div>
));
UploadOverlay.displayName = 'UploadOverlay';

const DeleteOverlay = memo(({ isSelected }: { isSelected: boolean }) => (
  <>
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl pointer-events-none transition-opacity duration-300 bg-red-500/85" style={{ opacity: isSelected ? 1 : 0 }}>
      <Trash2 className="w-12 h-12 md:w-16 md:h-16 text-white drop-shadow-xl" />
    </div>
    <div className="absolute bottom-3 right-3 z-10 scale-110">
      <div className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-all cursor-pointer ${isSelected ? 'bg-white' : 'bg-transparent shadow-inner'}`}>
        {isSelected && <Check className="w-4 h-4 text-red-500 stroke-[3]" />}
      </div>
    </div>
  </>
));
DeleteOverlay.displayName = 'DeleteOverlay';

export const GameCard = memo(({
  game, onPlay, onEdit, onDelete, onSelect, onUploadCover, onResetCover, isSelected,
  isDeleteMode, onEnterDeleteMode, onCoverArtClick, colors
}: GameCardProps) => {
  const contextMenuLongPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUploading = typeof game.progress === 'number';
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [isMobileHovered, setIsMobileHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const didOpenMenuRef = useRef(false);

  useEffect(() => {
    return () => { if (contextMenuLongPressRef.current) clearTimeout(contextMenuLongPressRef.current); };
  }, []);

  useEffect(() => { setImgError(false); }, [game.coverArt]);

  useEffect(() => {
    if (!isMobileHovered) return;
    const handleOutside = (e: Event) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) setIsMobileHovered(false);
    };
    document.addEventListener('touchstart', handleOutside, { passive: true });
    document.addEventListener('mousedown', handleOutside);
    return () => {
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('mousedown', handleOutside);
    };
  }, [isMobileHovered]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!isUploading && !isDeleteMode) {
      setContextMenuPos({ x: e.clientX, y: e.clientY });
      setContextMenuOpen(true);
    }
  }, [isUploading, isDeleteMode]);

  const startContextMenuLongPress = useCallback((e: React.TouchEvent) => {
    didOpenMenuRef.current = false;
    if (isUploading || isDeleteMode) return;
    const { clientX, clientY } = e.touches[0];

    contextMenuLongPressRef.current = setTimeout(() => {
      setContextMenuPos({ x: clientX, y: clientY });
      setContextMenuOpen(true);
      didOpenMenuRef.current = true;
    }, 400);
  }, [isUploading, isDeleteMode]);

  const endContextMenuLongPress = useCallback((e?: React.TouchEvent) => {
    if (contextMenuLongPressRef.current) clearTimeout(contextMenuLongPressRef.current);
    if (didOpenMenuRef.current && e?.cancelable) {
      e.preventDefault();
      didOpenMenuRef.current = false;
    }
  }, []);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if (contextMenuOpen) return;
    if (isDeleteMode && !isUploading) {
      onSelect(game.id);
    } else if (!isDeleteMode && !isUploading) {
      const isTouchScreen = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
      if (isTouchScreen && !isMobileHovered) {
        setIsMobileHovered(true);
        return;
      }
      onPlay(game);
    }
  }, [contextMenuOpen, isDeleteMode, isUploading, onSelect, onPlay, game, isMobileHovered]);

  return (
    <div
      ref={cardRef}
      className={`group relative overflow-hidden w-full rounded-xl border-[0.125rem] transition-all duration-300 cursor-pointer ${isMobileHovered ? 'shadow-lg' : 'hover:shadow-lg'} ${isDeleteMode ? 'animate-shake' : isUploading ? 'cursor-default' : (isMobileHovered ? 'scale-[1.025]' : 'hover:scale-[1.025]')}`}
      style={{ aspectRatio: getSystemAspectRatio(game.genre), backgroundColor: isDeleteMode && isSelected ? '#ef4444' : colors.midDark, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', borderColor: colors.midDark }}
      onClick={handleCardClick}
      onContextMenu={handleContextMenu}
      onTouchStart={startContextMenuLongPress}
      onTouchEnd={endContextMenuLongPress}
    >
      {isDeleteMode && !isUploading && <DeleteOverlay isSelected={isSelected} />}
      {isUploading && <UploadOverlay progress={game.progress} isComplete={game.isComplete} colors={colors} />}

      <div className="h-full w-full relative flex items-center justify-center transition-transform duration-500 overflow-hidden cursor-pointer" 
           style={!game.coverArt || imgError ? getGradientStyle(colors.gradientFrom, colors.gradientTo) : undefined}>
        {game.coverArt && !imgError ? (
          <Image
            src={game.coverArt}
            alt={game.title}
            fill
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
        isOpen={contextMenuOpen}
        position={contextMenuPos}
        onClose={() => setContextMenuOpen(false)}
        onEdit={() => onEdit(game)}
        onDelete={() => onDelete(game)}
        onUploadCover={(data) => onUploadCover(game.id, data)}
        onResetCover={() => onResetCover(game.id)}
        gameTitle={game.title}
        colors={colors}
        hasAutoCover={!!game.autoCoverArt}
      />
    </div>
  );
});

GameCard.displayName = 'GameCard';