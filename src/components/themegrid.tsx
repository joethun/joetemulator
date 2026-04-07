import { memo } from 'react';
import { CircleCheck } from 'lucide-react';
import { THEMES, getGradientStyle } from '@/types';

interface ThemeGridProps {
    selectedTheme: string;
    onSelectTheme: (theme: string) => void;
}

export const ThemeGrid = memo(({ selectedTheme, onSelectTheme }: ThemeGridProps) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
        {Object.entries(THEMES).map(([name, theme], i) => {
            const selected = selectedTheme === name;
            return (
                <button
                    key={name}
                    onClick={() => onSelectTheme(name)}
                    aria-pressed={selected}
                    aria-label={`${name} theme`}
                    className="p-4 sm:p-6 rounded-xl border-[0.125rem] text-left transition-all cursor-pointer"
                    style={{
                        backgroundColor: theme.darkBg,
                        borderColor: selected ? theme.highlight : theme.midDark,
                        boxShadow: selected ? `0 4px 12px rgba(0,0,0,0.3), 0 0 0 2px ${theme.highlight}30` : '0 4px 12px rgba(0,0,0,0.3)',
                        animation: `fadeIn 0.4s ease-out ${i * 0.03}s both`,
                    }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-base sm:text-lg font-bold capitalize" style={{ color: theme.softLight }}>
                            {name}
                        </span>
                        {selected && <CircleCheck className="w-5 h-5 shrink-0" style={{ color: theme.highlight }} />}
                    </div>

                    {/* Color palette row */}
                    <div className="flex gap-2">
                        {[theme.midDark, theme.highlight].map((color, j) => (
                            <div key={j} className="flex-1 h-10 rounded-xl" style={{ backgroundColor: color }} />
                        ))}
                        <div className="flex-1 h-10 rounded-xl" style={getGradientStyle(theme.gradientFrom, theme.gradientTo)} />
                    </div>
                </button>
            );
        })}
    </div>
));

ThemeGrid.displayName = 'ThemeGrid';
