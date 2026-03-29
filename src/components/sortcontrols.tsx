import { memo, useCallback } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { ThemeColors } from '@/types';

type SortOrder = 'asc' | 'desc';

interface SortControlsProps {
    colors: ThemeColors;
    sortOrder: SortOrder;
    setSortOrder: (order: SortOrder) => void;
}

export const SortControls = memo(({ colors, sortOrder, setSortOrder }: SortControlsProps) => {
    const toggleOrder = useCallback(() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'), [sortOrder, setSortOrder]);

    return (
        <button
            onClick={toggleOrder}
            aria-label={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            className="flex items-center rounded-xl border-[0.125rem] h-12 px-3 transition-all active:scale-95 shadow-sm cursor-pointer"
            style={{
                backgroundColor: colors.darkBg,
                borderColor: colors.midDark,
                color: colors.softLight,
            }}
        >
            {sortOrder === 'asc' ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
        </button>
    );
});

SortControls.displayName = 'SortControls';
