import { Trash2, Settings } from 'lucide-react';
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

export const getSystemDisplayName = (core?: string): string => {
  if (!core) return 'Unknown';
  const systemMap: Record<string, string> = {
    'nes': 'NES', 'gb': 'GB', 'gbc': 'GBC', 'gba': 'GBA', 'snes': 'SNES', 'vb': 'VB', 'n64': 'N64', 'nds': 'DS',
    'segaMS': 'MS', 'segaMD': 'MD', 'segaGG': 'GG', 'segaCD': 'CD', 'sega32x': '32X', 'segaSaturn': 'Saturn',
    'psx': 'PS1', 'psp': 'PSP', 'atari2600': '2600', 'atari5200': '5200', 'atari7800': '7800', 'lynx': 'Lynx',
    'jaguar': 'Jaguar', 'opera': '3DO', 'arcade': 'Arcade', 'mame2003_plus': 'MAME', 'dosbox_pure': 'DOS',
    'vice_xpet': 'PET', 'vice_xvic': 'VIC20', 'amiga': 'Amiga', 'vice_x64': 'C64', 'vice_x128': 'C128',
    'vice_xplus4': 'Plus/4', 'coleco': 'Coleco', 'pce': 'TG16', 'pcfx': 'PC-FX', 'ngp': 'NGP', 'ws': 'WS',
  };
  return systemMap[core] || core.toUpperCase();
};

export function GameCard({ game, onPlay, onEdit, onDelete, onSelect, isSelected, isDeleteMode, onEnterDeleteMode, onCoverArtClick, colors }: GameCardProps) {
  const baseCoverClass = "h-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative";
  const cardClass = `group relative overflow-hidden w-64 h-80 rounded-xl transition-all duration-300 ease-in-out hover:shadow-lg hover:z-10 border animate-border-breathe ${isDeleteMode ? 'animate-shake' : 'hover:scale-[1.02]'}`;
  const overlayClass = "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-brightness-75 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300";
  const contentClass = "transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-out";
  const buttonClass = "w-full font-bold py-2.5 px-4 rounded-lg transition-all text-sm hover:shadow-md active:scale-[0.98]";

  return (
    <div
      className={cardClass}
      style={{
        backgroundColor: isDeleteMode && isSelected ? '#ef4444' : colors.midDark,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        borderColor: colors.highlight,
      }}
      onClick={() => isDeleteMode && onSelect(game.id)}
    >
      {isDeleteMode && isSelected && (
        <div className="absolute inset-0 bg-red-500/40 z-20 flex items-center justify-center rounded-xl">
          <Trash2 className="w-16 h-16 text-white drop-shadow-lg" />
        </div>
      )}
      {isDeleteMode && (
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
      )}
      <div
        className={baseCoverClass}
        style={game.coverArt ? {
          backgroundImage: `url(${game.coverArt})`,
          backgroundColor: 'transparent',
          backgroundSize: game.coverArtFit || 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : {
          ...getGradientStyle(colors.gradientFrom, colors.gradientTo)
        }}
      >
        {!game.coverArt && (
          <div className="flex items-center justify-center" style={{ color: colors.darkBg }}>
            <span className="text-4xl font-bold tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
              {getSystemDisplayName(game.core)}
            </span>
            {onCoverArtClick && !isDeleteMode && (
              <button
                onClick={(e) => { e.stopPropagation(); onCoverArtClick(game); }}
                className="absolute inset-0"
              >
                <span className="sr-only">Add cover art</span>
              </button>
            )}
          </div>
        )}
      </div>
      {!isDeleteMode && (
        <div className={overlayClass}>
          <div className={contentClass}>
            <h3 className="text-xl font-bold truncate mb-1.5" style={{ color: colors.softLight, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{game.title}</h3>
            <p className="text-sm mb-3" style={{ color: colors.highlight }}>
              {game.genre}
            </p>
          <div className="flex gap-2.5 items-stretch mt-3">
            <button
              className={buttonClass + " flex-1"}
              style={{ ...getGradientStyle(colors.gradientFrom, colors.gradientTo), color: colors.darkBg }}
              onClick={(e) => { e.stopPropagation(); onPlay(game); }}
            >
              PLAY
            </button>
            <button
              className="px-3 py-2.5 rounded-lg transition-all hover:shadow-md active:scale-95 flex items-center justify-center"
              style={{ backgroundColor: colors.highlight, color: colors.darkBg }}
              onClick={(e) => { e.stopPropagation(); onEdit(game); }}
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              className="px-3 py-2.5 rounded-lg transition-all hover:shadow-md active:scale-95 flex items-center justify-center select-none"
              style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
              onMouseDown={(e) => {
                e.stopPropagation();
                const timeout = setTimeout(() => {
                  onEnterDeleteMode();
                }, 500);
                const cleanup = () => clearTimeout(timeout);
                e.currentTarget.addEventListener('mouseup', cleanup, { once: true });
                e.currentTarget.addEventListener('mouseleave', cleanup, { once: true });
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                const timeout = setTimeout(() => {
                  onEnterDeleteMode();
                }, 500);
                const cleanup = () => clearTimeout(timeout);
                e.currentTarget.addEventListener('touchend', cleanup, { once: true });
              }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(game);
              }}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
