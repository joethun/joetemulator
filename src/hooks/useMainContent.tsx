'use client';

import { useCallback, useMemo } from 'react';
import { Game, ThemeColors, GradientStyle, ViewType } from '@/types';
import { GameCard } from '@/components/gamecard';
import { ThemeGrid } from '@/components/themegrid';
import { SettingsView } from '@/components/settingsview';
import { Gamepad2 } from 'lucide-react';

const GRID_CLASS = "grid gap-4 md:gap-6 w-full grid-cols-[repeat(auto-fill,minmax(min(150px,100%),1fr))] md:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]";

interface GameCardHandlers {
    onPlay: (game: Game) => void;
    onDelete: (game: Game) => void;
    onUploadCover: (id: number, data: string) => void;
    onResetCover: (id: number) => void;
    onEdit: (game: Game) => void;
    onSaveStates: (title: string, name: string) => void;
}

interface SettingsProps {
    autoLoadState: boolean; setAutoLoadState: (v: boolean) => void;
    autoSaveState: boolean; setAutoSaveState: (v: boolean) => void;
    autoSaveInterval: number; setAutoSaveInterval: (v: number) => void;
    autoSaveIcon: boolean; setAutoSaveIcon: (v: boolean) => void;
    autoLoadIcon: boolean; setAutoLoadIcon: (v: boolean) => void;
}

interface UseMainContentProps {
    activeView: ViewType;
    colors: ThemeColors;
    gradient: GradientStyle;
    selectedTheme: string;
    onSelectTheme: (theme: string) => void;
    games: Game[];
    uploads: Record<number, Game>;
    sortedGames: Game[];
    groupedGames: Record<string, Game[]>;
    gameSearchQuery: string;
    libraryAnimationKey: number;
    handlers: GameCardHandlers;
    settings: SettingsProps;
}

export function useMainContent({
    activeView, colors, gradient, selectedTheme, onSelectTheme,
    games, uploads, sortedGames, groupedGames,
    gameSearchQuery, libraryAnimationKey,
    handlers, settings,
}: UseMainContentProps) {
    const renderGameCard = useCallback((g: Game, i: number) => (
        <div key={g.id} style={{ animation: `fadeIn 0.4s ease-out ${i * 0.03}s both` }}>
            <GameCard
                game={g}
                onPlay={handlers.onPlay}
                onDelete={handlers.onDelete}
                onUploadCover={handlers.onUploadCover}
                onResetCover={handlers.onResetCover}
                colors={colors}
                onEdit={handlers.onEdit}
                onSaveStates={handlers.onSaveStates}
                priority={i < 6}
            />
        </div>
    ), [handlers, colors]);

    const mainContent = useMemo(() => {
        if (activeView === 'themes')
            return <ThemeGrid selectedTheme={selectedTheme} onSelectTheme={onSelectTheme} />;

        if (activeView === 'settings')
            return (
                <SettingsView
                    colors={colors} gradient={gradient}
                    autoLoadState={settings.autoLoadState} setAutoLoadState={settings.setAutoLoadState}
                    autoSaveState={settings.autoSaveState} setAutoSaveState={settings.setAutoSaveState}
                    autoSaveInterval={settings.autoSaveInterval} setAutoSaveInterval={settings.setAutoSaveInterval}
                    autoSaveIcon={settings.autoSaveIcon} setAutoSaveIcon={settings.setAutoSaveIcon}
                    autoLoadIcon={settings.autoLoadIcon} setAutoLoadIcon={settings.setAutoLoadIcon}
                />
            );

        if (!games.length && !Object.keys(uploads).length)
            return (
                <div className="flex flex-col items-center justify-center py-20 animate-fade-in text-center">
                    <div className="w-20 h-20 rounded-xl mb-6 flex items-center justify-center shadow-lg" style={{ backgroundColor: colors.midDark, color: colors.highlight }}>
                        <Gamepad2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: colors.softLight }}>No games found</h3>
                    <p className="mb-8 opacity-70" style={{ color: colors.highlight }}>Add your ROMs by clicking the + button in the sidebar</p>
                </div>
            );

        if (!sortedGames.length)
            return (
                <div className="text-center py-20 opacity-60">
                    <p style={{ color: colors.softLight }}>No games found matching &quot;{gameSearchQuery}&quot;</p>
                </div>
            );

        let globalIndex = 0;
        return (
            <div key={libraryAnimationKey}>
                {Object.entries(groupedGames).map(([cat, catGames]) => (
                    <div key={cat} className="mb-8 last:mb-0 animate-fade-in">
                        <div className="flex items-center mb-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider pr-3" style={{ color: colors.highlight }}>{cat}</h4>
                            <div className="flex-1 h-px" style={{ backgroundColor: `${colors.highlight}30` }} />
                        </div>
                        <div className={GRID_CLASS}>{catGames.map((g) => renderGameCard(g, globalIndex++))}</div>
                    </div>
                ))}
            </div>
        );
    }, [activeView, colors, gradient, selectedTheme, onSelectTheme, settings,
        games, uploads, sortedGames, groupedGames,
        gameSearchQuery, libraryAnimationKey, renderGameCard]);

    return mainContent;
}
