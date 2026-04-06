import { memo, useCallback } from 'react';
import { Clock, Eye, EyeOff, Save, Upload, LucideIcon } from 'lucide-react';
import { SettingsCard } from '@/components/settingscard';
import { Switch } from '@/components/switch';
import { ThemeColors, GradientStyle } from '@/types';

interface SettingItemProps {
    colors: ThemeColors;
    gradient: GradientStyle;
    icon: LucideIcon;
    label: string;
    checked: boolean;
    onToggle: () => void;
}

const SettingItem = memo(({ colors, gradient, icon: Icon, label, checked, onToggle }: SettingItemProps) => (
    <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <Icon className="w-4 h-4" style={{ color: colors.highlight }} />
            <span className="text-sm font-medium" style={{ color: colors.softLight }}>{label}</span>
        </div>
        <Switch checked={checked} onChange={onToggle} colors={colors} gradient={gradient} />
    </div>
));
SettingItem.displayName = 'SettingItem';

interface SettingsViewProps {
    colors: ThemeColors;
    gradient: GradientStyle;
    autoLoadState: boolean;
    setAutoLoadState: (v: boolean) => void;
    autoSaveState: boolean;
    setAutoSaveState: (v: boolean) => void;
    autoSaveInterval: number;
    setAutoSaveInterval: (v: number) => void;
    autoSaveIcon: boolean;
    setAutoSaveIcon: (v: boolean) => void;
    autoLoadIcon: boolean;
    setAutoLoadIcon: (v: boolean) => void;
}

export const SettingsView = memo(({
    colors, gradient, autoLoadState, setAutoLoadState,
    autoSaveState, setAutoSaveState, autoSaveInterval, setAutoSaveInterval,
    autoSaveIcon, setAutoSaveIcon, autoLoadIcon, setAutoLoadIcon
}: SettingsViewProps) => {
    const handleIntervalClick = useCallback((v: number) => () => setAutoSaveInterval(v), [setAutoSaveInterval]);

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
                            {[30, 60, 120, 300, 600].map(v => (
                                <button
                                    key={v}
                                    onClick={handleIntervalClick(v)}
                                    aria-pressed={autoSaveInterval === v}
                                    className="px-3 py-1 rounded-xl h-9 text-sm font-medium flex-1 sm:flex-none flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                                    style={{
                                        backgroundColor: autoSaveInterval === v ? colors.highlight : colors.midDark,
                                        color: autoSaveInterval === v ? colors.darkBg : colors.softLight,
                                    }}
                                >
                                    {v >= 60 ? `${v / 60}m` : `${v}s`}
                                </button>
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
        </div>
    );
});

SettingsView.displayName = 'SettingsView';
