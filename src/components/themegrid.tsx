import { memo } from 'react';
import { CircleCheck } from 'lucide-react';
import { THEMES, getGradientStyle } from '@/types';

interface ThemeGridProps {
    selectedTheme: string;
    onSelectTheme: (theme: string) => void;
    animKey: number;
}

export const ThemeGrid = memo(({ selectedTheme, onSelectTheme, animKey }: ThemeGridProps) => (
        <div key={animKey} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(THEMES).map(([name, theme], i) => {
                const selected = selectedTheme === name;
                return (
                    <button
                        key={name}
                        onClick={() => onSelectTheme(name)}
                        aria-pressed={selected}
                        aria-label={`${name} theme`}
                        className="p-6 rounded-xl border-[0.125rem] relative overflow-hidden text-left transition-all hover:shadow-lg cursor-pointer"
                        style={{
                            backgroundColor: theme.midDark,
                            borderColor: selected ? theme.gradientFrom : `${theme.highlight}40`,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            animation: `fadeIn 0.4s ease-out ${i * 0.03}s both`
                        }}
                    >
                        <div className="flex justify-between mb-4">
                            <h3 className="text-xl font-bold capitalize" style={{ color: theme.softLight }}>{name}</h3>
                            {selected && <CircleCheck className="w-6 h-6" style={{ color: theme.gradientFrom }} />}
                        </div>
                        <div className="flex gap-2">
                            {[theme.darkBg, theme.midDark, 'gradient', theme.highlight].map((color, j) => (
                                <div
                                    key={j}
                                    className="flex-1 h-12 rounded-xl"
                                    style={color === 'gradient' ? getGradientStyle(theme.gradientFrom, theme.gradientTo) : { backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </button>
                );
            })}
        </div>
));

ThemeGrid.displayName = 'ThemeGrid';