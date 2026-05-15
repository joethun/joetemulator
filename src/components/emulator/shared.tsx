'use client';

import { CircleCheck } from 'lucide-react';
import type { ThemeColors } from '@/types';

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

/** Selectable button used in both ShaderPanel grid and CoreOptionsPanel detail view. */
export function OptionButton({ label, active, colors, idx, onClick }: OptionButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="h-12 px-4 rounded-xl text-left border-[0.125rem] flex items-center justify-between transition-all cursor-pointer focus:outline-none"
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
