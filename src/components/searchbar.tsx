'use client';

import { memo } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
    colors: any;
    value: string;
    onChange: (value: string) => void;
    isFocused: boolean;
    onFocus: () => void;
    onBlur: () => void;
    inputRef: React.Ref<HTMLInputElement> | null;
}

export const SearchBar = memo(({ colors, value, onChange, isFocused, onFocus, onBlur, inputRef }: SearchBarProps) => (
    <div
        className="flex items-center rounded-xl border-[0.125rem] transition-all w-full h-12 min-w-0"
        style={{
            backgroundColor: colors.darkBg,
            borderColor: isFocused ? colors.highlight : colors.midDark,
            boxShadow: isFocused ? `0 0 0 2px ${colors.highlight}30` : 'none'
        }}
    >
        <div className="w-12 h-full flex items-center justify-center flex-shrink-0" style={{ color: colors.softLight }}>
            <Search className="w-4 h-4" />
        </div>
        <input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            className="bg-transparent h-full flex-1 focus:outline-none text-sm pr-4 min-w-0"
            style={{ color: colors.softLight }}
        />
    </div>
));

SearchBar.displayName = 'SearchBar';
