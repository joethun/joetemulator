import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { ArrowUp, ArrowDown, ListFilter } from 'lucide-react';
import { ThemeColors } from '@/types';

const SORT_OPTIONS = ['title', 'system'] as const;
type SortOption = (typeof SORT_OPTIONS)[number];
type SortOrder = 'asc' | 'desc';

interface SortControlsProps {
    colors: ThemeColors;
    sortBy: SortOption;
    setSortBy: (sort: SortOption) => void;
    sortOrder: SortOrder;
    setSortOrder: (order: SortOrder) => void;
}

export const SortControls = memo(({ colors, sortBy, setSortBy, sortOrder, setSortOrder }: SortControlsProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleOrder = useCallback(() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'), [sortOrder, setSortOrder]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') { e.preventDefault(); setIsOpen(false); }
    }, []);

    const handleSortSelect = useCallback((option: SortOption) => {
        setSortBy(option);
        setIsOpen(false);
    }, [setSortBy]);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative z-40" ref={dropdownRef} onKeyDown={handleKeyDown}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="menu"
                aria-label="Sort options"
                className="flex items-center rounded-xl border-[0.125rem] h-12 px-3 transition-all"
                style={{
                    backgroundColor: colors.darkBg,
                    borderColor: isOpen ? colors.highlight : colors.midDark,
                    color: isOpen ? colors.highlight : colors.softLight,
                    boxShadow: isOpen ? `0 0 0 2px ${colors.highlight}30` : 'none'
                }}
            >
                <ListFilter className="w-5 h-5" />
            </button>

            <div
                className="absolute top-full mt-2 right-0 rounded-xl border-[0.125rem] overflow-hidden transition-all duration-300 origin-top"
                style={{
                    backgroundColor: colors.darkBg,
                    borderColor: colors.midDark,
                    maxHeight: isOpen ? '200px' : '0px',
                    opacity: isOpen ? 1 : 0,
                    visibility: isOpen ? 'visible' : 'hidden',
                    boxShadow: isOpen ? '0 4px 12px rgba(0,0,0,0.3)' : 'none'
                }}
            >
                <div className="p-3 space-y-2 min-w-[160px]">
                    <div className="flex flex-col gap-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider mb-1 px-1 opacity-80" style={{ color: colors.highlight }}>Sort By</div>
                        {SORT_OPTIONS.map(option => (
                            <button
                                key={option}
                                onClick={() => handleSortSelect(option)}
                                aria-pressed={sortBy === option}
                                className="px-3 py-2 rounded-xl text-sm font-medium capitalize text-left transition-all active:scale-95"
                                style={{
                                    backgroundColor: sortBy === option ? colors.highlight : colors.midDark,
                                    color: sortBy === option ? colors.darkBg : colors.softLight
                                }}
                            >
                                {option}
                            </button>
                        ))}
                    </div>

                    <div className="h-px" style={{ backgroundColor: colors.highlight + '30' }} />

                    <div className="flex flex-col gap-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider mb-1 px-1 opacity-80" style={{ color: colors.highlight }}>Order</div>
                        <button
                            onClick={toggleOrder}
                            className="px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all active:scale-95"
                            style={{ backgroundColor: colors.midDark, color: colors.softLight }}
                        >
                            {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

SortControls.displayName = 'SortControls';
