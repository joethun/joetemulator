'use client';

import { memo, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { ThemeColors } from '@/types';

interface SearchBarProps {
    colors: ThemeColors;
    value: string;
    onChange: (value: string) => void;
    isFocused: boolean;
    onFocus: () => void;
    onBlur: () => void;
    inputRef: React.Ref<HTMLInputElement> | null;
}

// search input with focus styling
export const SearchBar = memo(({
    colors,
    value,
    onChange,
    isFocused,
    onFocus,
    onBlur,
    inputRef
}: SearchBarProps) => {
    const handleClear = useCallback(() => {
        onChange('');
    }, [onChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape' && value) {
            e.preventDefault();
            handleClear();
        }
    }, [value, handleClear]);

    return (
        <div
            className="flex items-center rounded-xl border-[0.125rem] transition-all w-full h-12 min-w-0"
            style={{
                backgroundColor: colors.darkBg,
                borderColor: isFocused ? colors.highlight : colors.midDark,
                boxShadow: isFocused ? `0 0 0 2px ${colors.highlight}30` : 'none'
            }}
        >
            <div
                className="w-12 h-full flex items-center justify-center flex-shrink-0"
                style={{ color: colors.softLight }}
            >
                <Search className="w-4 h-4" />
            </div>
            <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={value}
                onChange={e => onChange(e.target.value)}
                onFocus={onFocus}
                onBlur={onBlur}
                onKeyDown={handleKeyDown}
                aria-label="Search games"
                className="bg-transparent h-full flex-1 focus:outline-none text-sm pr-2 min-w-0"
                style={{ color: colors.softLight }}
            />
            {value && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="w-10 h-full flex items-center justify-center flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                    style={{ color: colors.softLight }}
                    aria-label="Clear search"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
});

SearchBar.displayName = 'SearchBar';
