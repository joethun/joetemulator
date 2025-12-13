import { memo } from 'react';
import { CircleCheck } from 'lucide-react';
import { THEMES } from '@/types';

interface ThemeGridProps {
    colors: any;
    selectedTheme: string;
    onSelectTheme: (theme: string) => void;
    animKey: number;
}

export const ThemeGrid = memo(({ colors, selectedTheme, onSelectTheme, animKey }: ThemeGridProps) => (
    <div key={animKey} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(THEMES).map(([name, t]: [string, any], idx) => (
            <button
                key={name}
                onClick={() => onSelectTheme(name)}
                className="p-6 rounded-xl border-[0.125rem] relative overflow-hidden text-left transition-all hover:shadow-lg"
                style={{
                    backgroundColor: t.midDark,
                    borderColor: selectedTheme === name ? t.play : t.highlight + '40',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    animation: `fadeIn 0.4s ease-out ${idx * 0.03}s both`
                }}
            >
                <div className="flex justify-between mb-4">
                    <h3 className="text-xl font-bold capitalize" style={{ color: t.softLight }}>{name}</h3>
                    {selectedTheme === name && <CircleCheck className="w-6 h-6" style={{ color: t.play }} />}
                </div>
                <div className="flex gap-2">
                    {[t.darkBg, t.midDark, t.play, t.highlight].map((c: string, i: number) => (
                        <div key={i} className="flex-1 h-12 rounded-xl" style={{ backgroundColor: c }} />
                    ))}
                </div>
            </button>
        ))}
    </div>
));

ThemeGrid.displayName = 'ThemeGrid';
