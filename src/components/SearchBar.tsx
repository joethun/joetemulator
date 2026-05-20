'use client';

import { memo } from 'react';
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
    const handleClear = () => onChange('');

    return (
        <TextInput
            colors={colors}
            value={value}
            onChange={onChange}
            onClear={handleClear}
            onKeyDown={e => {
                if (e.key === 'Escape' && value) { e.preventDefault(); handleClear(); }
            }}
            leftIcon={<Search className="w-4 h-4" />}
            size="md"
            placeholder="Search..."
            ariaLabel="Search games"
        />
    );
});

SearchBar.displayName = 'SearchBar';
