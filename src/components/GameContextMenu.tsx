'use client';

import { memo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, Settings, Image as ImageIcon, RefreshCw, Folder } from 'lucide-react';
import { ThemeColors } from '@/types';
import { DANGER_BG, DANGER_FG, SHADOW_CARD } from '@/lib/constants';
import { useDelayedUnmount } from '@/hooks/useDelayedUnmount';

interface GameContextMenuProps {
    isOpen: boolean;
    position: { x: number; y: number };
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onUploadCover: (data: string) => void;
    onResetCover: () => void;
    onSaveStates: () => void;
    gameTitle: string;
    colors: ThemeColors;
    hasAutoCover: boolean;
}

const MENU_W = 190;
const MENU_H = 250;

interface MenuButtonProps {
    onClick: () => void;
    label: string;
    Icon: React.ElementType;
    colors: ThemeColors;
    style?: React.CSSProperties;
}

const MenuButton = memo(function MenuButton({ onClick, label, Icon, colors, style }: MenuButtonProps) {
    return (
        <button
            onClick={onClick}
            className="w-full px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-medium text-left transition-all active:scale-95 hover:bg-white/5 cursor-pointer"
            style={{ backgroundColor: colors.midDark, color: colors.softLight, ...style }}
        >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{label}</span>
        </button>
    );
});

export function GameContextMenu({
    isOpen, position, onClose, onEdit, onDelete, onUploadCover, onResetCover, onSaveStates,
    gameTitle, colors, hasAutoCover,
}: GameContextMenuProps) {
    const { shouldRender, isClosing } = useDelayedUnmount(isOpen, 300);
    const menuRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!shouldRender || isClosing) return;
        const onOutside = (e: Event) => {
            if (!menuRef.current?.contains(e.target as Node)) onClose();
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('mousedown', onOutside);
        document.addEventListener('touchstart', onOutside);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onOutside);
            document.removeEventListener('touchstart', onOutside);
            document.removeEventListener('keydown', onKey);
        };
    }, [shouldRender, isClosing, onClose]);

    if (!shouldRender) return null;

    const x = Math.min(position.x, window.innerWidth - MENU_W);
    const y = Math.min(position.y, window.innerHeight - MENU_H);

    return createPortal(
        <div
            ref={menuRef}
            className={`fixed z-50 rounded-xl border-[0.125rem] overflow-hidden shadow-lg ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
            style={{ backgroundColor: colors.darkBg, borderColor: colors.midDark, width: MENU_W, left: x, top: y, boxShadow: SHADOW_CARD, fontFamily: 'var(--font-lexend, system-ui)' }}
            onPointerDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
        >
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => {
                        if (typeof ev.target?.result === 'string') { onUploadCover(ev.target.result); onClose(); }
                    };
                    reader.readAsDataURL(file);
                }}
            />
            <div className="p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider mb-2 px-1 opacity-80 truncate" style={{ color: colors.highlight }}>
                    {gameTitle}
                </div>
                <div className="flex flex-col gap-1">
                    <MenuButton onClick={() => fileInputRef.current?.click()} label="Upload Cover" Icon={ImageIcon} colors={colors} />
                    {hasAutoCover && <MenuButton onClick={() => { onResetCover(); onClose(); }} label="Auto Cover" Icon={RefreshCw} colors={colors} />}
                    <div className="h-px w-full my-1" style={{ backgroundColor: `${colors.highlight}20` }} />
                    <MenuButton onClick={() => { onClose(); requestAnimationFrame(onSaveStates); }} label="Manage States" Icon={Folder} colors={colors} />
                    <MenuButton onClick={() => { onClose(); requestAnimationFrame(onEdit); }} label="System" Icon={Settings} colors={colors} />
                    <MenuButton onClick={() => { onClose(); requestAnimationFrame(onDelete); }} label="Delete" Icon={Trash2} colors={colors} style={{ backgroundColor: DANGER_BG, color: DANGER_FG }} />
                </div>
            </div>
        </div>,
        document.body
    );
}
