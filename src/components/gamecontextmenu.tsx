'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, Settings, Image as ImageIcon, RefreshCw, Save } from 'lucide-react';
import { ThemeColors } from '@/types';

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

const MENU_W = 180;
const MENU_H = 250;

export const GameContextMenu = memo(({
    isOpen, position, onClose, onEdit, onDelete, onUploadCover, onResetCover, onSaveStates, gameTitle, colors, hasAutoCover
}: GameContextMenuProps) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [visible, setVisible] = useState(false);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        if (isOpen) { setVisible(true); setClosing(false); return; }
        if (!visible) return;
        setClosing(true);
        const t = setTimeout(() => { setVisible(false); setClosing(false); }, 200);
        return () => clearTimeout(t);
    }, [isOpen]);

    useEffect(() => {
        if (!visible || closing) return;
        const onOutside = (e: MouseEvent | TouchEvent) => {
            if (!menuRef.current?.contains(e.target as Node)) onClose();
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('mousedown', onOutside as EventListener);
        document.addEventListener('touchstart', onOutside as EventListener);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onOutside as EventListener);
            document.removeEventListener('touchstart', onOutside as EventListener);
            document.removeEventListener('keydown', onKey);
        };
    }, [visible, closing, onClose]);

    const handleUploadClick = useCallback(() => fileInputRef.current?.click(), []);

    if (!visible) return null;

    const x = Math.min(position.x, window.innerWidth - MENU_W);
    const y = Math.min(position.y, window.innerHeight - MENU_H);

    const menuBtn = (onClick: () => void, label: string, Icon: React.ElementType, style?: React.CSSProperties) => (
        <button
            onClick={onClick}
            className="w-full px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-medium text-left transition-all active:scale-95 hover:bg-white/5 cursor-pointer"
            style={{ backgroundColor: colors.midDark, color: colors.softLight, ...style }}
        >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{label}</span>
        </button>
    );

    return createPortal(
        <div
            ref={menuRef}
            className={`fixed z-50 rounded-xl border-[0.125rem] overflow-hidden shadow-lg ${closing ? 'animate-fade-out' : 'animate-fade-in'}`}
            style={{ backgroundColor: colors.darkBg, borderColor: colors.midDark, width: MENU_W, left: x, top: y, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', fontFamily: 'var(--font-lexend, system-ui)' }}
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
                    {menuBtn(handleUploadClick, 'Upload Cover', ImageIcon)}
                    {hasAutoCover && menuBtn(() => { onResetCover(); onClose(); }, 'Auto Cover', RefreshCw)}
                    <div className="h-px w-full my-1" style={{ backgroundColor: `${colors.highlight}20` }} />
                    {menuBtn(() => { onClose(); requestAnimationFrame(onSaveStates); }, 'Save States', Save)}
                    {menuBtn(() => { onClose(); requestAnimationFrame(onEdit); }, 'System', Settings)}
                    {menuBtn(() => { onClose(); requestAnimationFrame(onDelete); }, 'Delete', Trash2, { backgroundColor: 'rgba(239,68,68,0.15)', color: 'rgb(248,113,113)' })}
                </div>
            </div>
        </div>,
        document.body
    );
});

GameContextMenu.displayName = 'GameContextMenu';
