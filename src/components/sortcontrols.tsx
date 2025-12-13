import { memo, useState } from 'react';
import { ArrowUp, ArrowDown, ListFilter } from 'lucide-react';

interface SortControlsProps {
    colors: any;
    sortBy: 'title' | 'system';
    setSortBy: (sort: 'title' | 'system') => void;
    sortOrder: 'asc' | 'desc';
    setSortOrder: (order: 'asc' | 'desc') => void;
}

export const SortControls = memo(({ colors, sortBy, setSortBy, sortOrder, setSortOrder }: SortControlsProps) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative z-40">
            {isOpen && <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative z-40 flex items-center rounded-xl border-[0.125rem] h-12 px-3 transition-all duration-300"
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
                className="absolute top-full mt-2 right-0 z-40 rounded-xl border-[0.125rem] overflow-hidden transition-all duration-300 origin-top"
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
                        <div className="text-[10px] font-bold uppercase tracking-wider mb-1 px-1 opacity-70" style={{ color: colors.softLight }}>Sort By</div>
                        {['title', 'system'].map(opt => (
                            <button
                                key={opt}
                                onClick={() => { setSortBy(opt as 'title' | 'system'); setIsOpen(false); }}
                                className="px-3 py-2 rounded-xl text-sm font-medium capitalize transition-all active:scale-95 text-left"
                                style={{
                                    backgroundColor: sortBy === opt ? colors.highlight : colors.midDark,
                                    color: sortBy === opt ? colors.darkBg : colors.softLight
                                }}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                    <div className="h-px" style={{ backgroundColor: colors.highlight + '30' }} />
                    <div className="flex flex-col gap-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider mb-1 px-1 opacity-70" style={{ color: colors.softLight }}>Order</div>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
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
