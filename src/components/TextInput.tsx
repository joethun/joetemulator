'use client';

import { useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import type { ThemeColors } from '@/types';
import { focusRingStyle } from '@/lib/utils';

interface TextInputProps {
    colors: ThemeColors;
    value: string;
    onChange: (value: string) => void;
    onClear?: () => void;
    leftIcon?: ReactNode;
    placeholder?: string;
    ariaLabel?: string;
    id?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function TextInput({
    colors, value, onChange, onClear, leftIcon,
    placeholder, ariaLabel, id, onKeyDown,
}: TextInputProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div
            className="flex items-center rounded-xl border-[0.125rem] w-full min-w-0 shrink-0 transition-all h-12"
            style={{
                backgroundColor: colors.darkBg,
                ...focusRingStyle(isFocused, colors),
            }}
        >
            {leftIcon && (
                <div
                    className="w-12 h-full flex items-center justify-center shrink-0"
                    style={{ color: colors.softLight }}
                >
                    {leftIcon}
                </div>
            )}
            <input
                id={id}
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={onKeyDown}
                aria-label={ariaLabel}
                className="bg-transparent h-full flex-1 min-w-0 pr-2 focus:outline-none text-sm"
                style={{ color: colors.softLight }}
            />
            {onClear && value && (
                <button
                    type="button"
                    onClick={onClear}
                    className="w-10 h-full flex items-center justify-center shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                    style={{ color: colors.softLight }}
                    aria-label="Clear"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
