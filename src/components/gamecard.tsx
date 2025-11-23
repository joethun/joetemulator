'use client';

import { memo, useCallback, useMemo, useRef } from 'react';
import { Trash2, Settings, Play } from 'lucide-react';
import { Game, THEMES, getGradientStyle } from '@/types';

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
  colors: typeof THEMES.default;
}

const GameCardComponent = ({
  game, onPlay, onEdit, onDelete, onSelect, isSelected,
  isDeleteMode, onEnterDeleteMode, onCoverArtClick, colors
}: GameCardProps) => {
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // dynamic card styles based on selection/mode
  const cardStyle = useMemo(() => ({
    backgroundColor: isDeleteMode && isSelected ? '#ef4444' : colors.midDark,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    borderColor: 'rgb(31, 41, 55)',
  }), [isDeleteMode, isSelected, colors.midDark]);

  const coverStyle = useMemo(() => (
    game.coverArt
      ? {
        backgroundImage: `url(${game.coverArt})`,
        backgroundColor: 'transparent',
        backgroundSize: game.coverArtFit || 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
      : getGradientStyle(colors.gradientFrom, colors.gradientTo)
  ), [game.coverArt, game.coverArtFit, colors.gradientFrom, colors.gradientTo]);

  // helper for stop propagation
  const handleAction = useCallback((action: (game: Game) => void, g: Game) => (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    action(g);
  }, []);

  const handleStartLongPress = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(onEnterDeleteMode, 500);
  }, [onEnterDeleteMode]);

  const handleEndLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // cleanup on unmount
  useMemo(() => {
    return () => {
        if(longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    }
  }, []);

  return (
    <div
      className={`group relative overflow-hidden w-full aspect-[4/5] rounded-xl transition-all duration-300 ease-in-out hover:shadow-lg hover:z-10 border ${
        isDeleteMode ? 'animate-shake' : 'hover:scale-[1.02]'
      }`}
      style={cardStyle}
      onClick={() => isDeleteMode && onSelect(game.id)}
    >
      {/* delete mode overlay */}
      {isDeleteMode && (
        <>
          <div
            className="absolute inset-0 z-20 flex items-center justify-center rounded-xl pointer-events-none transition-opacity duration-300 bg-red-500/85"
            style={{ opacity: isSelected ? 1 : 0 }}
          >
            <Trash2 className="w-16 h-16 text-white drop-shadow-lg" />
          </div>
          <div className="absolute bottom-3 right-3 z-20">
            <div
              className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-all"
              style={{ backgroundColor: isSelected ? 'white' : 'transparent' }}
            >
              {isSelected && (
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        </>
      )}

      {/* cover art area */}
      <div className="h-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative" style={coverStyle}>
        {!game.coverArt && (
          <div className="flex items-center justify-center w-full px-4" style={{ color: colors.darkBg }}>
            <span
              className="block w-full max-w-full text-4xl font-bold tracking-wide text-center break-words whitespace-normal select-none"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)', hyphens: 'auto' }}
            >
              {game.title}
            </span>
            {onCoverArtClick && !isDeleteMode && (
              <button onClick={handleAction(onCoverArtClick, game)} className="absolute inset-0">
                <span className="sr-only">Add cover art</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* hover overlay */}
      {!isDeleteMode && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-brightness-75 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-out">
            <h3 className="text-xl font-bold truncate mb-1.5" style={{ color: colors.softLight, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {game.title}
            </h3>
            <p className="text-sm mb-3" style={{ color: colors.highlight }}>
              {game.genre}
            </p>

            <div className="flex gap-2.5 items-stretch mt-3">
              <button
                className="flex-1 flex items-center justify-center gap-2 w-full font-bold py-2.5 px-4 rounded-lg transition-all text-sm hover:shadow-md active:scale-[0.98]"
                style={{ ...getGradientStyle(colors.gradientFrom, colors.gradientTo), color: colors.darkBg }}
                onClick={handleAction(onPlay, game)}
              >
                <Play className="w-4 h-4 fill-current" />
                PLAY
              </button>
              <button
                className="px-3 py-2.5 rounded-lg transition-all hover:shadow-md active:scale-95 flex items-center justify-center"
                style={{ backgroundColor: colors.highlight, color: colors.darkBg }}
                onClick={handleAction(onEdit, game)}
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                className="px-3 py-2.5 rounded-lg transition-all hover:shadow-md active:scale-95 flex items-center justify-center select-none bg-red-500 text-white"
                onMouseDown={handleStartLongPress}
                onTouchStart={handleStartLongPress}
                onMouseUp={handleEndLongPress}
                onMouseLeave={handleEndLongPress}
                onTouchEnd={handleEndLongPress}
                onClick={handleAction(onDelete, game)}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const GameCard = memo(GameCardComponent);