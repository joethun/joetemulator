'use client';

import type { ThemeColors } from '@/types';
import { focusRingStyle } from '@/lib/utils';

interface BindingRowProps {
    label: string;
    active: boolean;
    colors: ThemeColors;
    idx?: number;
    children: React.ReactNode;
}

export function BindingRow({ label, active, colors, idx, children }: BindingRowProps) {
    return (
        <div
            className="h-12 px-4 rounded-xl border-[0.125rem] flex items-center justify-between gap-3"
            style={{
                backgroundColor: colors.darkBg,
                ...focusRingStyle(active, colors),
                animation: idx !== undefined ? `fadeIn 0.4s ease-out ${idx * 0.03}s both` : undefined,
            }}
        >
            <span className="text-sm font-medium truncate pr-2 flex-1" style={{ color: colors.softLight }}>
                {label}
            </span>
            <div className="flex items-center gap-1.5 shrink-0 text-sm font-medium">{children}</div>
        </div>
    );
}

interface BindingChipProps {
    label: string;
    active: boolean;
    colors: ThemeColors;
    onClick: () => void;
    onContextMenu: (e: React.MouseEvent) => void;
}

export function BindingChip({ label, active, colors, onClick, onContextMenu }: BindingChipProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            onContextMenu={onContextMenu}
            className="px-2.5 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            style={{
                backgroundColor: active ? colors.highlight : colors.midDark,
                color: active ? colors.darkBg : colors.softLight,
            }}
        >
            {label}
        </button>
    );
}
