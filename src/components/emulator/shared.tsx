'use client';

import { CircleCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ThemeColors } from '@/types';
import { SHADOW_CARD } from '@/lib/constants';

interface SectionHeaderProps {
    title: string;
    colors: ThemeColors;
}

export function SectionHeader({ title, colors }: SectionHeaderProps) {
    return (
        <div className="flex items-center mb-3">
            <h4
                className="text-xs font-bold uppercase tracking-wider pr-3 truncate"
                style={{ color: colors.highlight }}
            >
                {title}
            </h4>
            <div className="flex-1 h-px shrink-0" style={{ backgroundColor: `${colors.highlight}30` }} />
        </div>
    );
}

interface OptionButtonProps {
    label: string;
    active: boolean;
    colors: ThemeColors;
    idx?: number;
    onClick: () => void;
}

interface NavCardProps {
    title: string;
    subtitle: string;
    colors: ThemeColors;
    idx: number;
    trailingIcon: LucideIcon;
    /** Optional leading icon tile (e.g. the settings hub rows). */
    leadingIcon?: LucideIcon;
    /** Render as a button. Mutually exclusive with `href`. */
    onClick?: () => void;
    /** Render as an external link. `null` renders a disabled link. */
    href?: string | null;
}

/** A large list card with a title/subtitle and a trailing chevron/external-link icon.
 *  Renders a `<button>` when `onClick` is given, otherwise an external-link `<a>`. */
export function NavCard({ title, subtitle, colors, idx, trailingIcon: Trailing, leadingIcon: Leading, onClick, href }: NavCardProps) {
    const className = 'p-4 sm:p-6 rounded-xl border-[0.125rem] flex items-center text-left transition-all active:scale-[0.98]';
    const baseStyle = {
        backgroundColor: colors.darkBg,
        borderColor: colors.midDark,
        boxShadow: SHADOW_CARD,
        animation: `fadeIn 0.4s ease-out ${idx * 0.04}s both`,
    };

    const content = (
        <>
            {Leading ? (
                <div className="flex items-center gap-3 sm:gap-5 overflow-hidden flex-1">
                    <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: colors.midDark, color: colors.highlight }}
                    >
                        <Leading className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <NavCardText title={title} subtitle={subtitle} colors={colors} />
                </div>
            ) : (
                <NavCardText title={title} subtitle={subtitle} colors={colors} />
            )}
            <Trailing className="w-5 h-5 shrink-0 opacity-60 ml-3" style={{ color: colors.highlight }} />
        </>
    );

    if (onClick) {
        return (
            <button type="button" onClick={onClick} className={`${className} cursor-pointer`} style={baseStyle}>
                {content}
            </button>
        );
    }

    const enabled = href != null;
    return (
        <a
            href={href ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!enabled}
            onClick={enabled ? undefined : (e) => e.preventDefault()}
            className={className}
            style={{ ...baseStyle, opacity: enabled ? 1 : 0.5, cursor: enabled ? 'pointer' : 'not-allowed' }}
        >
            {content}
        </a>
    );
}

function NavCardText({ title, subtitle, colors }: { title: string; subtitle: string; colors: ThemeColors }) {
    return (
        <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold leading-tight mb-1" style={{ color: colors.softLight }}>{title}</h3>
            <p className="text-xs sm:text-sm leading-relaxed opacity-80 break-words" style={{ color: colors.highlight }}>{subtitle}</p>
        </div>
    );
}

/** Selectable button used in both ShaderPanel grid and CoreOptionsPanel detail view. */
export function OptionButton({ label, active, colors, idx, onClick }: OptionButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="h-12 px-4 rounded-xl text-left border-[0.125rem] flex items-center justify-between transition-all active:scale-95 cursor-pointer focus:outline-none"
            style={{
                backgroundColor: active ? colors.highlight : colors.midDark,
                borderColor: active ? colors.highlight : colors.midDark,
                color: active ? colors.darkBg : colors.softLight,
                animation: idx !== undefined ? `fadeIn 0.4s ease-out ${idx * 0.03}s both` : undefined,
            }}
        >
            <span className="text-sm font-medium truncate pr-2 flex-1">{label}</span>
            {active && <CircleCheck className="w-5 h-5 shrink-0" style={{ color: colors.darkBg }} />}
        </button>
    );
}
