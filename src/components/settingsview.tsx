import { memo, useCallback } from 'react';
import { Clock, Eye, EyeOff, Save, Upload } from 'lucide-react';
import { SettingsCard } from '@/components/settingscard';
import { Switch } from '@/components/switch';
import { ThemeColors, GradientStyle } from '@/types';

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
        <div className="animate-fade-in w-full grid gap-4">
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
                            {[15, 30, 45, 60].map(v => (
                                <button
                                    key={v}
                                    onClick={handleIntervalClick(v)}
                                    aria-pressed={autoSaveInterval === v}
                                    className="px-3 py-1 rounded-xl h-9 text-sm font-medium flex-1 sm:flex-none flex items-center justify-center transition-all active:scale-95"
                                    style={{ backgroundColor: autoSaveInterval === v ? colors.highlight : colors.midDark, color: autoSaveInterval === v ? colors.darkBg : colors.softLight }}
                                >
                                    {v}s
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {autoSaveIcon ? <Eye className="w-4 h-4" style={{ color: colors.highlight }} /> : <EyeOff className="w-4 h-4" style={{ color: colors.highlight }} />}
                            <span className="text-sm font-medium" style={{ color: colors.softLight }}>Show Save Icon</span>
                        </div>
                        <Switch checked={autoSaveIcon} onChange={() => setAutoSaveIcon(!autoSaveIcon)} colors={colors} gradient={gradient} />
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard
                colors={colors} gradient={gradient} icon={Upload}
                title="Auto-Load State" description="Resume gameplay from your last state automatically."
                animationDelay="0.06s"
                checked={autoLoadState} onToggle={() => setAutoLoadState(!autoLoadState)}
                isExpanded={autoLoadState}
            >
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {autoLoadIcon ? <Eye className="w-4 h-4" style={{ color: colors.highlight }} /> : <EyeOff className="w-4 h-4" style={{ color: colors.highlight }} />}
                        <span className="text-sm font-medium" style={{ color: colors.softLight }}>Show Load Icon</span>
                    </div>
                    <Switch checked={autoLoadIcon} onChange={() => setAutoLoadIcon(!autoLoadIcon)} colors={colors} gradient={gradient} />
                </div>
            </SettingsCard>
        </div>
    );
});

SettingsView.displayName = 'SettingsView';
