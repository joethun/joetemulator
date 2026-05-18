'use client';

import { memo, useCallback } from 'react';
import { Search } from 'lucide-react';
import { ThemeColors } from '@/types';
import { TextInput } from '@/components/TextInput';

interface SearchBarProps {
    colors: ThemeColors;
    value: string;
    onChange: (value: string) => void;
}

export const SearchBar = memo(({
    colors, value, onChange
}: SearchBarProps) => {
    const handleClear = useCallback(() => onChange(''), [onChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape' && value) { e.preventDefault(); handleClear(); }
    }, [value, handleClear]);

    return (
        <TextInput
            colors={colors}
            value={value}
            onChange={onChange}
            onClear={handleClear}
            onKeyDown={handleKeyDown}
            leftIcon={<Search className="w-4 h-4" />}
            size="md"
            placeholder="Search..."
            ariaLabel="Search games"
        />
    );
});

SearchBar.displayName = 'SearchBar';
