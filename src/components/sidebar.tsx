'use client';

import { memo, useCallback } from 'react';
import Image from 'next/image';
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

const Tooltip = memo(({ text, colors, direction = 'right' }: { text: string; colors: ThemeColors; direction?: 'right' | 'up' }) => {
    const positionClass = direction === 'up'
        ? 'absolute bottom-full left-1/2 -translate-x-1/2 mb-4'
        : 'absolute left-full top-1/2 -translate-y-1/2 ml-6';

    return (
        <div
            className={`${positionClass} px-3 py-2 rounded-xl whitespace-nowrap z-[60] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200`}
            style={{ backgroundColor: colors.midDark, color: colors.softLight, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
        >
            {text}
        </div>
    );
});
Tooltip.displayName = 'Tooltip';

const DesktopNavItem = memo(({ Icon, label, isActive, colors, onClick }: { 
    Icon: any, label: string, isActive: boolean, colors: ThemeColors, onClick: () => void 
}) => (
    <div className="relative group">
        <button
            onClick={onClick}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            style={{
                backgroundColor: isActive ? colors.highlight : 'transparent',
                color: isActive ? colors.darkBg : colors.softLight
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = colors.sidebarHover; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
            <Icon className="w-6 h-6 z-10" />
        </button>
        <Tooltip text={label} colors={colors} />
    </div>
));
DesktopNavItem.displayName = 'DesktopNavItem';

const MobileNavItem = memo(({ Icon, label, isActive, colors, onClick }: { 
    Icon: any, label: string, isActive: boolean, colors: ThemeColors, onClick: () => void 
}) => (
    <button
        onClick={onClick}
        aria-label={label}
        aria-current={isActive ? 'page' : undefined}
        className="relative flex items-center justify-center w-[54px] h-[54px] rounded-full transition-all duration-200 overflow-hidden active:scale-95 cursor-pointer"
        style={{
            backgroundColor: isActive ? colors.highlight : 'transparent',
            color: isActive ? colors.darkBg : colors.softLight
        }}
    >
        <Icon className="w-6 h-6 z-10" />
    </button>
));
MobileNavItem.displayName = 'MobileNavItem';

export const Sidebar = memo(({ activeView, colors, gradient, onNavClick, onAddGame }: SidebarProps) => {
    const handleNavClick = useCallback((view: ViewType) => () => onNavClick(view), [onNavClick]);

    return (
        <>
            {/* Desktop */}
            <aside
                className="hidden md:flex w-20 py-6 flex-col fixed inset-y-0 left-0 z-50 select-none"
                style={{ backgroundColor: colors.midDark, boxShadow: '4px 0 12px rgba(0,0,0,0.3)' }}
            >
                <div className="flex flex-col items-center gap-4 mb-2">
                    <div className="relative group">
                        <Image src="/favicon.ico" alt="Logo" width={48} height={48} className="object-contain opacity-90 transition-opacity pointer-events-none" />
                        <Tooltip text="Joe T Emulator" colors={colors} />
                    </div>
                    <div className="w-12 h-px" style={{ backgroundColor: `${colors.highlight}30` }} />
                </div>

                <nav className="flex-1 flex flex-col items-center gap-2 mt-2">
                    {NAV_ITEMS.map(({ view, icon, label }) => (
                        <DesktopNavItem
                            key={view}
                            Icon={icon}
                            label={label}
                            isActive={activeView === view}
                            colors={colors}
                            onClick={handleNavClick(view)}
                        />
                    ))}
                </nav>

                <div className="flex flex-col items-center">
                    <div className="relative group">
                        <button
                            onClick={onAddGame}
                            aria-label="Add game"
                            className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 active:scale-95 cursor-pointer"
                            style={{ ...gradient, color: colors.darkBg }}
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                        <Tooltip text="Add Game" colors={colors} />
                    </div>
                </div>
            </aside>

            {/* Mobile */}
            <aside className="md:hidden fixed inset-x-0 bottom-0 pb-6 flex justify-center z-50 pointer-events-none select-none">
                <div
                    className="flex items-center gap-2 px-3 py-3 rounded-full pointer-events-auto backdrop-blur-2xl shadow-2xl border"
                    style={{
                        backgroundColor: `${colors.darkBg}e6`,
                        borderColor: `${colors.midDark}80`,
                        boxShadow: `0 12px 40px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05)`
                    }}
                >
                    {NAV_ITEMS.map(({ view, icon, label }) => (
                        <MobileNavItem
                            key={view}
                            Icon={icon}
                            label={label}
                            isActive={activeView === view}
                            colors={colors}
                            onClick={handleNavClick(view)}
                        />
                    ))}
                    <div className="w-px h-8 mx-1" style={{ backgroundColor: `${colors.highlight}30` }} />
                    <button
                        onClick={onAddGame}
                        aria-label="Add game"
                        className="w-[54px] h-[54px] rounded-full flex items-center justify-center transition-transform duration-200 active:scale-95 cursor-pointer"
                        style={{ ...gradient, color: colors.darkBg }}
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>
            </aside>
        </>
    );
});
Sidebar.displayName = 'Sidebar';