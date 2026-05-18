'use client';

import { memo } from 'react';
import { Game, ThemeColors, GradientStyle, ViewType } from '@/types';
import { GameCard } from '@/components/GameCard';
import { ThemeGrid } from '@/components/ThemeGrid';
import { SettingsView } from '@/components/SettingsView';
import { SectionHeader } from '@/components/emulator/shared';
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
    saveOnExit: boolean; setSaveOnExit: (v: boolean) => void;
    currentColors: ThemeColors;
    gradientStyle: GradientStyle;
    selectedTheme: string;
    setSelectedTheme: (theme: string) => void;
}

interface MainContentProps {
    activeView: ViewType;
    games: Game[];
    uploads: Record<number, Game>;
    count: number;
    groupedGames: Record<string, Game[]>;
    gameSearchQuery: string;
    libraryAnimationKey: number;
    handlers: GameCardHandlers;
    settings: SettingsProps;
}

export const MainContent = memo(function MainContent({
    activeView, games, uploads, count, groupedGames,
    gameSearchQuery, libraryAnimationKey, handlers, settings,
}: MainContentProps) {
    const { currentColors: colors } = settings;

    if (activeView === 'themes')
        return <ThemeGrid selectedTheme={settings.selectedTheme} onSelectTheme={settings.setSelectedTheme} />;

    if (activeView === 'settings')
        return (
            <SettingsView
                colors={colors} gradient={settings.gradientStyle}
                autoLoadState={settings.autoLoadState} setAutoLoadState={settings.setAutoLoadState}
                autoSaveState={settings.autoSaveState} setAutoSaveState={settings.setAutoSaveState}
                autoSaveInterval={settings.autoSaveInterval} setAutoSaveInterval={settings.setAutoSaveInterval}
                autoSaveIcon={settings.autoSaveIcon} setAutoSaveIcon={settings.setAutoSaveIcon}
                autoLoadIcon={settings.autoLoadIcon} setAutoLoadIcon={settings.setAutoLoadIcon}
                saveOnExit={settings.saveOnExit} setSaveOnExit={settings.setSaveOnExit}
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

    if (!count)
        return (
            <div className="text-center py-20 opacity-60">
                <p style={{ color: colors.softLight }}>No games found matching &quot;{gameSearchQuery}&quot;</p>
            </div>
        );

    const groupEntries = Object.entries(groupedGames);
    let offset = 0;
    const groupOffsets = groupEntries.map(([, catGames]) => {
        const start = offset;
        offset += catGames.length;
        return start;
    });

    return (
        <div key={libraryAnimationKey}>
            {groupEntries.map(([cat, catGames], gi) => (
                <div key={cat} className="mb-8 last:mb-0 animate-fade-in">
                    <SectionHeader title={cat} colors={colors} />
                    <div className={GRID_CLASS}>
                        {catGames.map((g, localIdx) => {
                            const idx = groupOffsets[gi] + localIdx;
                            return (
                                <div key={g.id} style={{ animation: `fadeIn 0.4s ease-out ${idx * 0.03}s both` }}>
                                    <GameCard
                                        game={g}
                                        onPlay={handlers.onPlay}
                                        onDelete={handlers.onDelete}
                                        onUploadCover={handlers.onUploadCover}
                                        onResetCover={handlers.onResetCover}
                                        colors={colors}
                                        onEdit={handlers.onEdit}
                                        onSaveStates={handlers.onSaveStates}
                                        priority={idx < 6}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
});
