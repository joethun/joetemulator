'use client';

import { memo, useState } from 'react';
import { Gamepad2, Palette, Settings, Plus } from 'lucide-react';

const NAV_ITEMS = [
    { view: 'library' as const, icon: Gamepad2, label: 'Library' },
    { view: 'themes' as const, icon: Palette, label: 'Themes' },
    { view: 'settings' as const, icon: Settings, label: 'Settings' }
] as const;

interface SidebarProps {
    activeView: 'library' | 'themes' | 'settings';
    colors: any;
    gradient: any;
    onNavClick: (view: 'library' | 'themes' | 'settings') => void;
    onAddGame: () => void;
}

export const Sidebar = memo(({ activeView, colors, gradient, onNavClick, onAddGame }: SidebarProps) => {
    const [hoveredView, setHoveredView] = useState<string | null>(null);

    return (
        <aside
            className="w-20 py-6 flex flex-col shadow-xl fixed inset-y-0 left-0 z-50"
            style={{ backgroundColor: colors.midDark, boxShadow: '4px 0 12px rgba(0,0,0,0.3)' }}
        >
            {/* logo & separator */}
            <div className="flex flex-col items-center gap-3 mb-2">
                <img
                    src="/favicon.ico"
                    alt="Logo"
                    className="w-12 h-12 object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
                />
                <div
                    className="w-12 h-px rounded-full"
                    style={{ backgroundColor: colors.highlight, opacity: 0.2 }}
                />
            </div>

            <nav className="flex-1 flex flex-col items-center gap-2 mt-2">
                {NAV_ITEMS.map(({ view, icon: Icon, label }) => {
                    const isActive = activeView === view;
                    const isHovered = hoveredView === view;
                    return (
                        <div key={view} className="relative group" onMouseEnter={() => setHoveredView(view)} onMouseLeave={() => setHoveredView(null)}>
                            <button
                                onClick={() => onNavClick(view)}
                                className="w-12 h-12 rounded-xl transition-all flex items-center justify-center"
                                style={{
                                    backgroundColor: isActive ? colors.highlight : (isHovered ? colors.sidebarHover : 'transparent'),
                                    color: isActive ? colors.darkBg : colors.softLight
                                }}
                            >
                                <Icon className="w-6 h-6" />
                            </button>
                            <div
                                className="absolute left-full ml-6 px-3 py-2 rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-[60] top-1/2 -translate-y-1/2"
                                style={{
                                    backgroundColor: colors.midDark,
                                    color: colors.softLight,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                }}
                            >
                                {label}
                            </div>
                        </div>
                    );
                })}
            </nav>

            <div className="flex flex-col items-center">
                <div className="relative group">
                    <button
                        onClick={onAddGame}
                        className="w-12 h-12 rounded-xl transition-all flex items-center justify-center"
                        style={{
                            ...gradient,
                            color: colors.darkBg
                        }}
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                    <div
                        className="absolute left-full ml-6 px-3 py-2 rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-[60] top-1/2 -translate-y-1/2"
                        style={{
                            backgroundColor: colors.midDark,
                            color: colors.softLight,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}
                    >
                        Add Game
                    </div>
                </div>
            </div>
        </aside>
    );
});

Sidebar.displayName = 'Sidebar';