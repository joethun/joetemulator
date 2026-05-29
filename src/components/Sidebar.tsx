'use client';

import { memo, ReactNode } from 'react';
import Image from 'next/image';
import { Gamepad2, Palette, Settings, Plus, LucideIcon } from 'lucide-react';
import { ThemeColors, GradientStyle, ViewType } from '@/types';
import { SHADOW_CARD } from '@/lib/constants';

const NAV_ITEMS: { view: ViewType; icon: LucideIcon; label: string }[] = [
    { view: 'library', icon: Gamepad2, label: 'Library' },
    { view: 'themes', icon: Palette, label: 'Themes' },
    { view: 'settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
    activeView: ViewType;
    colors: ThemeColors;
    gradient: GradientStyle;
    onNavClick: (view: ViewType) => void;
    onAddGame: () => void;
}

const Tooltip = memo(({ text, colors }: { text: ReactNode; colors: ThemeColors }) => (
    <div
        className="absolute left-full top-1/2 -translate-y-1/2 ml-6 px-3 py-2 rounded-xl whitespace-nowrap z-[60] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200"
        style={{ backgroundColor: colors.midDark, color: colors.softLight, boxShadow: SHADOW_CARD }}
    >
        {text}
    </div>
));
Tooltip.displayName = 'Tooltip';

const NavBtn = memo(({ icon: Icon, label, isActive, colors, onClick, mobile }: {
    icon: LucideIcon; label: string; isActive: boolean; colors: ThemeColors; onClick: () => void; mobile?: boolean;
}) => {
    const base = isActive
        ? { backgroundColor: colors.highlight, color: colors.darkBg }
        : { backgroundColor: 'transparent', color: colors.softLight };

    if (mobile) return (
        <button onClick={onClick} aria-label={label} aria-current={isActive ? 'page' : undefined}
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            style={base}>
            <Icon className="w-6 h-6" />
        </button>
    );

    return (
        <div className="relative group">
            <button onClick={onClick} aria-label={label} aria-current={isActive ? 'page' : undefined}
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                style={base}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = colors.sidebarHover; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                <Icon className="w-6 h-6" />
            </button>
            <Tooltip text={label} colors={colors} />
        </div>
    );
});
NavBtn.displayName = 'NavBtn';

export const Sidebar = memo(({ activeView, colors, gradient, onNavClick, onAddGame }: SidebarProps) => (
    <>
        <aside className="hidden md:flex w-20 py-6 flex-col fixed inset-y-0 left-0 z-50 select-none"
            style={{ backgroundColor: colors.midDark, boxShadow: '4px 0 12px rgba(0,0,0,0.3)' }}>
            <div className="flex flex-col items-center gap-4 mb-2">
                <div className="relative group">
                    <a href="https://github.com/joethun/joetemulator" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository"
                        className="block transition-all active:scale-95 cursor-pointer">
                        <Image src="/icons/duck.png" alt="Logo" width={48} height={48} className="object-contain opacity-90 pointer-events-none" draggable={false} />
                    </a>
                    <Tooltip text={<span className="inline-flex items-center gap-1.5">Joe T Emulator <svg viewBox="-0.5 16.54 32.13 32.13" fill="currentColor" className="w-[0.85em] h-[0.85em]" aria-hidden="true"><path d="M31.13 32.62Q31.13 39.06 26.57 43.62Q22.02 48.17 15.58 48.17Q9.13 48.17 4.57 43.62Q0 39.06 0 32.62Q0 26.15 4.57 21.59Q9.13 17.04 15.58 17.04Q22.02 17.04 26.57 21.59Q31.13 26.15 31.13 32.62M11.57 29.39Q11.57 28.56 11.00 27.99Q10.42 27.42 9.59 27.42Q8.79 27.42 8.20 27.99Q7.62 28.56 7.62 29.39Q7.62 30.20 8.20 30.79Q8.79 31.37 9.59 31.37Q10.42 31.37 11.00 30.79Q11.57 30.20 11.57 29.39M23.51 29.39Q23.51 28.56 22.94 27.99Q22.36 27.42 21.53 27.42Q20.73 27.42 20.14 27.99Q19.56 28.56 19.56 29.39Q19.56 30.20 20.14 30.79Q20.73 31.37 21.53 31.37Q22.36 31.37 22.94 30.79Q23.51 30.20 23.51 29.39M8.40 37.62Q9.62 39.94 11.40 41.16Q13.18 42.38 15.58 42.38Q17.94 42.38 19.74 41.16Q21.53 39.94 22.75 37.62L21.22 36.74Q19.31 40.26 15.58 40.26Q11.84 40.26 9.91 36.74L8.40 37.62Z" /></svg></span>} colors={colors} />
                </div>
                <div className="w-12 h-px" style={{ backgroundColor: `${colors.highlight}30` }} />
            </div>

            <nav className="flex-1 flex flex-col items-center gap-2 mt-2">
                {NAV_ITEMS.map(({ view, icon, label }) => (
                    <NavBtn key={view} icon={icon} label={label} isActive={activeView === view} colors={colors} onClick={() => onNavClick(view)} />
                ))}
            </nav>

            <div className="flex flex-col items-center">
                <div className="relative group">
                    <button onClick={onAddGame} aria-label="Add game"
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 active:scale-95 cursor-pointer"
                        style={{ ...gradient, color: colors.darkBg }}>
                        <Plus className="w-6 h-6" />
                    </button>
                    <Tooltip text="Add Game" colors={colors} />
                </div>
            </div>
        </aside>

        <aside className="md:hidden fixed inset-x-0 bottom-0 pb-6 flex justify-center z-50 pointer-events-none select-none">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border-[0.125rem] pointer-events-auto backdrop-blur-2xl"
                style={{ backgroundColor: `${colors.darkBg}e6`, borderColor: `${colors.midDark}80`, boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
                <a href="https://github.com/joethun/joetemulator" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository"
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer">
                    <Image src="/icons/duck.png" alt="Logo" width={48} height={48} className="object-contain opacity-90 pointer-events-none" draggable={false} />
                </a>
                <div className="w-px h-10 mx-1" style={{ backgroundColor: `${colors.highlight}30` }} />
                {NAV_ITEMS.map(({ view, icon, label }) => (
                    <NavBtn key={view} icon={icon} label={label} isActive={activeView === view} colors={colors} onClick={() => onNavClick(view)} mobile />
                ))}
                <div className="w-px h-10 mx-1" style={{ backgroundColor: `${colors.highlight}30` }} />
                <button onClick={onAddGame} aria-label="Add game"
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 active:scale-95 cursor-pointer"
                    style={{ ...gradient, color: colors.darkBg }}>
                    <Plus className="w-6 h-6" />
                </button>
            </div>
        </aside>
    </>
));
Sidebar.displayName = 'Sidebar';
