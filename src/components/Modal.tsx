'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { ThemeColors, GradientStyle } from '@/types';
import { SHADOW_MODAL } from '@/lib/constants';

interface ModalProps {
    isClosing: boolean;
    colors: ThemeColors;
    onClose: () => void;
    children: React.ReactNode;
    /** ARIA label for the dialog. Use this OR labelledBy. */
    ariaLabel?: string;
    labelledBy?: string;
    /** z-index. 50 by default; bump to 60 for menus over the emulator overlay. */
    z?: number;
}

export function Modal({
    isClosing, colors, onClose, children,
    ariaLabel, labelledBy, z = 50,
}: ModalProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => { dialogRef.current?.focus(); }, []);

    const anim = isClosing ? 'fadeOut 0.2s ease-out forwards' : 'fadeIn 0.2s ease-out forwards';

    return createPortal(
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden"
            style={{ animation: anim, fontFamily: 'var(--font-lexend, system-ui)', zIndex: z }}
            onClick={onClose}
        >
            <div
                ref={dialogRef}
                tabIndex={0}
                role="dialog"
                aria-modal="true"
                aria-label={ariaLabel}
                aria-labelledby={labelledBy}
                onClick={e => e.stopPropagation()}
                onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onClose(); } }}
                className="p-8 rounded-2xl max-w-2xl w-full flex flex-col border focus:outline-none"
                style={{
                    backgroundColor: colors.darkBg,
                    borderColor: colors.midDark,
                    boxShadow: SHADOW_MODAL,
                    animation: anim,
                    height: '90vh',
                }}
            >
                {children}
            </div>
        </div>,
        document.body,
    );
}

interface ModalHeaderProps { title: string; subtitle?: string; colors: ThemeColors; id?: string; }
export function ModalHeader({ title, subtitle, colors, id }: ModalHeaderProps) {
    return (
        <div className="mb-6">
            <h3 id={id} className="text-3xl font-bold mb-2" style={{ color: colors.softLight }}>{title}</h3>
            {subtitle && <p className="text-sm opacity-80" style={{ color: colors.highlight }}>{subtitle}</p>}
        </div>
    );
}

interface ModalFooterProps {
    colors: ThemeColors;
    children: React.ReactNode;
    /** When false, render only the right side with the left slot collapsed. */
    align?: 'between' | 'end';
}
export function ModalFooter({ colors, children, align = 'between' }: ModalFooterProps) {
    return (
        <div
            className={`flex items-center mt-8 pt-6 border-t ${align === 'end' ? 'justify-end gap-3' : 'justify-between'}`}
            style={{ borderColor: `${colors.highlight}30` }}
        >
            {children}
        </div>
    );
}

interface ModalButtonProps {
    onClick: (e: React.MouseEvent) => void;
    colors: ThemeColors;
    /** 'solid' fills with the highlight color; 'gradient' uses the theme gradient. */
    variant?: 'solid' | 'gradient';
    gradient?: GradientStyle;
    disabled?: boolean;
    className?: string;
    children: React.ReactNode;
}

/** The standard h-12 footer action button used across all modals. */
export function ModalButton({
    onClick, colors, variant = 'solid', gradient, disabled, className, children,
}: ModalButtonProps) {
    const style = variant === 'gradient' && gradient
        ? { ...gradient, color: colors.darkBg }
        : { backgroundColor: colors.highlight, color: colors.darkBg };
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`h-12 px-8 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer${className ? ` ${className}` : ''}`}
            style={style}
        >
            {children}
        </button>
    );
}
