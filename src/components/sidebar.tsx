'use client';

import { memo, useCallback } from 'react';
import { Gamepad2, Palette, Settings, Plus } from 'lucide-react';
import { ThemeColors, GradientStyle, ViewType } from '@/types';

const NAV_ITEMS = [
    { view: 'library' as const, icon: Gamepad2, label: 'Library' },
    { view: 'themes' as const, icon: Palette, label: 'Themes' },
    { view: 'settings' as const, icon: Settings, label: 'Settings' }
] as const;

interface SidebarProps {
    activeView: ViewType;
    colors: ThemeColors;
    gradient: GradientStyle;
    onNavClick: (view: ViewType) => void;
    onAddGame: () => void;
}

const Tooltip = memo(({ text, colors }: { text: string; colors: ThemeColors }) => (
    <div
        className="absolute left-full top-1/2 -translate-y-1/2 ml-6 px-3 py-2 rounded-xl whitespace-nowrap z-[60] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200"
        style={{ backgroundColor: colors.midDark, color: colors.softLight, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
    >
        {text}
    </div>
));
Tooltip.displayName = 'Tooltip';

export const Sidebar = memo(({ activeView, colors, gradient, onNavClick, onAddGame }: SidebarProps) => {
    const handleNavClick = useCallback((view: ViewType) => () => onNavClick(view), [onNavClick]);

    return (
        <aside
            className="w-20 py-6 flex flex-col fixed inset-y-0 left-0 z-50"
            style={{ backgroundColor: colors.midDark, boxShadow: '4px 0 12px rgba(0,0,0,0.3)' }}
        >
            <div className="flex flex-col items-center gap-4 mb-2">
                <div className="relative group">
                    <img src="/favicon.ico" alt="Logo" className="w-12 h-12 object-contain opacity-90 hover:opacity-100 transition-opacity pointer-events-none" />
                    <Tooltip text="Joe T Emulator" colors={colors} />
                </div>
                <div className="w-12 h-px" style={{ backgroundColor: colors.highlight + '30' }} />
            </div>

            <nav className="flex-1 flex flex-col items-center gap-2 mt-2">
                {NAV_ITEMS.map(({ view, icon: Icon, label }) => {
                    const isActive = activeView === view;
                    return (
                        <div key={view} className="relative group">
                            <button
                                onClick={handleNavClick(view)}
                                aria-label={label}
                                aria-current={isActive ? 'page' : undefined}
                                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all"
                                style={{
                                    backgroundColor: isActive ? colors.highlight : 'transparent',
                                    color: isActive ? colors.darkBg : colors.softLight
                                }}
                                onMouseEnter={e => { if (!isActive) (e.target as HTMLElement).style.backgroundColor = colors.sidebarHover; }}
                                onMouseLeave={e => { if (!isActive) (e.target as HTMLElement).style.backgroundColor = 'transparent'; }}
                            >
                                <Icon className="w-6 h-6" />
                            </button>
                            <Tooltip text={label} colors={colors} />
                        </div>
                    );
                })}
            </nav>

            <div className="flex flex-col items-center">
                <div className="relative group">
                    <button
                        onClick={onAddGame}
                        aria-label="Add game"
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all"
                        style={{ ...gradient, color: colors.darkBg }}
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                    <Tooltip text="Add Game" colors={colors} />
                </div>
            </div>
        </aside>
    );
});

Sidebar.displayName = 'Sidebar';