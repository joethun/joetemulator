import { memo } from 'react';
import { Clock, Eye, EyeOff, Save, Upload, LogOut } from 'lucide-react';
import { ChipButton, SettingsCard, SettingItem } from '@/components/SettingsCard';
import type { AppSettings } from '@/hooks/useAppSettings';
import { RetroAchievementsSettings } from '@/components/cheevos/RetroAchievementsSettings';

const SAVE_INTERVALS = [30, 60, 120, 300, 600] as const;

export const SettingsView = memo(({ settings }: { settings: AppSettings }) => {
    const {
        currentColors: colors, gradientStyle: gradient,
        autoLoadState, setAutoLoadState,
        autoSaveState, setAutoSaveState, autoSaveInterval, setAutoSaveInterval,
        autoSaveIcon, setAutoSaveIcon, autoLoadIcon, setAutoLoadIcon,
        saveOnExit, setSaveOnExit,
        raEnabled, setRaEnabled, raHardcore, setRaHardcore,
    } = settings;

    return (
    <div className="animate-fade-in w-full grid gap-4 pb-8">
            <SettingsCard
                colors={colors} gradient={gradient} icon={Save}
                title="Auto-Save State" description="Automatically save your game state periodically."
                animationDelay="0.03s"
                checked={autoSaveState} onToggle={() => setAutoSaveState(!autoSaveState)}
                isExpanded={autoSaveState}
            >
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4" style={{ color: colors.highlight }} />
                            <span className="text-sm font-medium" style={{ color: colors.softLight }}>Save Interval</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {SAVE_INTERVALS.map(v => (
                                <ChipButton
                                    key={v} colors={colors} className="flex-1 sm:flex-none"
                                    onClick={() => setAutoSaveInterval(v)}
                                    active={autoSaveInterval === v} aria-pressed={autoSaveInterval === v}
                                >
                                    {v >= 60 ? `${v / 60}m` : `${v}s`}
                                </ChipButton>
                            ))}
                        </div>
                    </div>
                    <SettingItem
                        colors={colors} gradient={gradient} label="Show Save Icon" icon={autoSaveIcon ? Eye : EyeOff}
                        checked={autoSaveIcon} onToggle={() => setAutoSaveIcon(!autoSaveIcon)}
                    />
                </div>
            </SettingsCard>

            <SettingsCard
                colors={colors} gradient={gradient} icon={Upload}
                title="Auto-Load State" description="Resume gameplay from your last state automatically."
                animationDelay="0.06s"
                checked={autoLoadState} onToggle={() => setAutoLoadState(!autoLoadState)}
                isExpanded={autoLoadState}
            >
                <SettingItem
                    colors={colors} gradient={gradient} label="Show Load Icon" icon={autoLoadIcon ? Eye : EyeOff}
                    checked={autoLoadIcon} onToggle={() => setAutoLoadIcon(!autoLoadIcon)}
                />
            </SettingsCard>

            <SettingsCard
                colors={colors} gradient={gradient} icon={LogOut}
                title="Save on Exit" description="Save your game state when you close a game."
                animationDelay="0.09s"
                checked={saveOnExit} onToggle={() => setSaveOnExit(!saveOnExit)}
            />

            <RetroAchievementsSettings
                colors={colors} gradient={gradient}
                animationDelay="0.12s"
                enabled={raEnabled} onToggleEnabled={() => setRaEnabled(!raEnabled)}
                hardcore={raHardcore} onToggleHardcore={() => setRaHardcore(!raHardcore)}
            />
    </div>
    );
});

SettingsView.displayName = 'SettingsView';
