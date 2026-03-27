'use client';

import { memo, useCallback, useRef, useEffect } from 'react';
import { Trash2, Settings, Play } from 'lucide-react';
import { Game, ThemeColors, getGradientStyle } from '@/types';

interface GameCardProps {
  game: Game;
  onPlay: (game: Game) => void;
  onEdit: (game: Game) => void;
  onDelete: (game: Game) => void;
  onSelect: (gameId: number) => void;
  isSelected: boolean;
  isDeleteMode: boolean;
  onEnterDeleteMode: () => void;
  onCoverArtClick?: (game: Game) => void;
  colors: ThemeColors;
}

export const GameCard = memo(({
  game, onPlay, onEdit, onDelete, onSelect, isSelected,
  isDeleteMode, onEnterDeleteMode, onCoverArtClick, colors
}: GameCardProps) => {
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUploading = typeof game.progress === 'number';

  const clearLongPress = useCallback(() => {
    if (longPressRef.current) { clearTimeout(longPressRef.current); longPressRef.current = null; }
  }, []);

  useEffect(() => clearLongPress, [clearLongPress]);

  const handleAction = useCallback((action: (g: Game) => void) => (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!isUploading) action(game);
  }, [isUploading, game]);

  const handleKeyDown = useCallback((action: (g: Game) => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!isUploading) action(game); }
  }, [isUploading, game]);

  const startLongPress = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (isUploading) return;
    clearLongPress();
    longPressRef.current = setTimeout(onEnterDeleteMode, 500);
  }, [isUploading, clearLongPress, onEnterDeleteMode]);

  const coverStyle = game.coverArt
    ? { backgroundImage: `url(${game.coverArt})`, backgroundColor: 'transparent', backgroundSize: game.coverArtFit || 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
    : getGradientStyle(colors.gradientFrom, colors.gradientTo);

  return (
    <div
      className={`group relative overflow-hidden w-full aspect-[4/5] rounded-xl border transition-all duration-300 hover:shadow-lg ${isDeleteMode ? 'animate-shake' : isUploading ? '' : 'hover:scale-[1.02]'}`}
      style={{ backgroundColor: isDeleteMode && isSelected ? '#ef4444' : colors.midDark, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', borderColor: 'rgb(31,41,55)' }}
      onClick={() => isDeleteMode && !isUploading && onSelect(game.id)}
    >
      {isDeleteMode && !isUploading && (
        <>
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl pointer-events-none transition-opacity duration-300 bg-red-500/85" style={{ opacity: isSelected ? 1 : 0 }}>
            <Trash2 className="w-16 h-16 text-white drop-shadow-lg" />
          </div>
          <div className="absolute bottom-3 right-3 z-10">
            <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-all" style={{ backgroundColor: isSelected ? 'white' : 'transparent' }}>
              {isSelected && <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
            </div>
          </div>
        </>
      )}

      {isUploading && (
        <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-500 ${game.isComplete ? 'opacity-0' : 'opacity-100'}`}>
          <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke={colors.midDark} strokeWidth="10" className="opacity-80" />
              <circle cx="50" cy="50" r="40" fill="none" stroke={colors.highlight} strokeWidth="10" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - (game.progress || 0) / 100)} strokeLinecap="round" className="transition-all duration-200" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold" style={{ color: colors.softLight }}>{Math.round(game.progress || 0)}%</span>
            </div>
          </div>
          <p className="mt-4 text-sm font-bold uppercase tracking-widest animate-pulse" style={{ color: colors.highlight }}>Uploading</p>
        </div>
      )}

      <div className="h-full flex items-center justify-center relative" style={coverStyle}>
        {!game.coverArt && (
          <div className="flex items-center justify-center w-full px-2 sm:px-4" style={{ color: colors.darkBg }}>
            <span className="block w-full text-lg sm:text-xl md:text-2xl font-bold tracking-wide text-center break-words select-none line-clamp-4" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)', hyphens: 'auto' }}>
              {game.title}
            </span>
            {onCoverArtClick && !isDeleteMode && !isUploading && (
              <button onClick={handleAction(onCoverArtClick)} onKeyDown={handleKeyDown(onCoverArtClick)} className="absolute inset-0" aria-label={`Add cover art for ${game.title}`}>
                <span className="sr-only">Add cover art</span>
              </button>
            )}
          </div>
        )}
      </div>

      {!isDeleteMode && !isUploading && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-brightness-75 flex flex-col justify-end p-3 sm:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
            <h3 className="text-lg sm:text-xl font-bold truncate mb-1" style={{ color: colors.softLight, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{game.title}</h3>
            <p className="text-xs sm:text-sm mb-2 sm:mb-3" style={{ color: colors.highlight }}>{game.genre}</p>
            <div className="grid gap-2 items-stretch mt-2 sm:mt-3" style={{ gridTemplateColumns: '1fr 44px 44px' }}>
              <button
                className="flex items-center justify-center gap-1.5 sm:gap-2 font-bold py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl text-xs sm:text-sm transition-all hover:shadow-md active:scale-95 w-full"
                style={{ ...getGradientStyle(colors.gradientFrom, colors.gradientTo), color: colors.darkBg }}
                onClick={handleAction(onPlay)} onKeyDown={handleKeyDown(onPlay)} aria-label={`Play ${game.title}`}
              >
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" /> PLAY
              </button>
              <button
                className="rounded-xl flex items-center justify-center w-full h-full transition-all hover:shadow-md active:scale-95"
                style={{ backgroundColor: colors.highlight, color: colors.darkBg }}
                onClick={handleAction(onEdit)} onKeyDown={handleKeyDown(onEdit)} aria-label={`Edit ${game.title}`}
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                className="rounded-xl flex items-center justify-center w-full h-full select-none bg-red-500 text-white transition-all hover:shadow-md active:scale-95"
                onMouseDown={startLongPress} onTouchStart={startLongPress}
                onMouseUp={clearLongPress} onMouseLeave={clearLongPress} onTouchEnd={clearLongPress}
                onClick={handleAction(onDelete)} onKeyDown={handleKeyDown(onDelete)} aria-label={`Delete ${game.title}`}
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

GameCard.displayName = 'GameCard';