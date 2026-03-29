'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, Settings, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { ThemeColors } from '@/types';

interface GameContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUploadCover: (data: string) => void;
  onResetCover: () => void;
  gameTitle: string;
  colors: ThemeColors;
  hasAutoCover: boolean;
}

export const GameContextMenu = memo(({
  isOpen, position, onClose, onEdit, onDelete, onUploadCover, onResetCover, gameTitle, colors, hasAutoCover
}: GameContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [render, setRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      setIsClosing(false);
    } else if (render) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setRender(false);
        setIsClosing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, render]);

  useEffect(() => {
    if (!render || isClosing) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside as EventListener);
    document.addEventListener('touchstart', handleClickOutside as EventListener);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside as EventListener);
      document.removeEventListener('touchstart', handleClickOutside as EventListener);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [render, isClosing, onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          onUploadCover(result);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!render) return null;

  const adjustedPos = {
    x: Math.min(position.x, window.innerWidth - 180),
    y: Math.min(position.y, window.innerHeight - 250)
  };

  return createPortal(
    <div
      ref={menuRef}
      className={`fixed z-50 rounded-xl border-[0.125rem] overflow-hidden shadow-lg ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      style={{
        backgroundColor: colors.darkBg,
        borderColor: colors.midDark,
        width: '180px',
        left: `${adjustedPos.x}px`,
        top: `${adjustedPos.y}px`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        fontFamily: 'var(--font-lexend, system-ui)'
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      <div className="p-3">
        <div className="text-[10px] font-bold uppercase tracking-wider mb-2 px-1 opacity-80 truncate select-none" style={{ color: colors.highlight }}>
          {gameTitle}
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => { fileInputRef.current?.click(); }}
            className="w-full px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-medium text-left transition-all active:scale-95 hover:bg-white/5 cursor-pointer"
            style={{ backgroundColor: colors.midDark, color: colors.softLight }}
          >
            <ImageIcon className="w-4 h-4 shrink-0" />
            <span className="truncate">Upload Cover</span>
          </button>

          {hasAutoCover && (
            <button
              onClick={() => { onResetCover(); onClose(); }}
              className="w-full px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-medium text-left transition-all active:scale-95 hover:bg-white/5 cursor-pointer"
              style={{ backgroundColor: colors.midDark, color: colors.softLight }}
            >
              <RefreshCw className="w-4 h-4 shrink-0" />
              <span className="truncate">Auto Cover</span>
            </button>
          )}

          <div className="h-px w-full my-1" style={{ backgroundColor: `${colors.highlight}20` }} />

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); requestAnimationFrame(() => onEdit()); }}
            className="w-full px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-medium text-left transition-all active:scale-95 hover:bg-white/5 cursor-pointer"
            style={{ backgroundColor: colors.midDark, color: colors.softLight }}
            aria-label={`Settings for ${gameTitle}`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span className="truncate">System</span>
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); requestAnimationFrame(() => onDelete()); }}
            className="w-full px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-medium text-left transition-all active:scale-95 cursor-pointer"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'rgb(248, 113, 113)' }}
            aria-label={`Delete ${gameTitle}`}
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span className="truncate">Delete</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
});

GameContextMenu.displayName = 'GameContextMenu';
