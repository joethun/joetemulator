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

export const SearchBar = memo(({ colors, value, onChange }: SearchBarProps) => (
    <TextInput
        colors={colors}
        value={value}
        onChange={onChange}
        onClear={() => onChange('')}
        onKeyDown={e => {
            if (e.key === 'Escape' && value) { e.preventDefault(); onChange(''); }
        }}
        leftIcon={<Search className="w-4 h-4" />}
        size="md"
        placeholder="Search..."
        ariaLabel="Search games"
    />
));

SearchBar.displayName = 'SearchBar';
