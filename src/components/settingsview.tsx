import { memo } from 'react';
import { Clock, Eye, EyeOff, Save, Zap } from 'lucide-react';
import { Switch } from '@/components/switch';

interface SettingsViewProps {
    colors: any;
    gradient: any;
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
    reducedMotion: boolean;
    setReducedMotion: (v: boolean) => void;
}

export const SettingsView = memo(({
    colors, gradient, autoLoadState, setAutoLoadState,
    autoSaveState, setAutoSaveState, autoSaveInterval, setAutoSaveInterval,
    autoSaveIcon, setAutoSaveIcon, autoLoadIcon, setAutoLoadIcon,
    reducedMotion, setReducedMotion
}: SettingsViewProps) => (
    <div className="animate-fade-in w-full grid gap-4">
        <div className="p-4 sm:p-6 rounded-xl border-[0.125rem] flex flex-col" style={{ backgroundColor: colors.darkBg, borderColor: colors.midDark, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', animation: 'fadeIn 0.4s ease-out both' }}>
            <div className="flex items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-5 overflow-hidden">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.midDark, color: colors.highlight }}><Clock className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                    <div className="flex-1 min-w-0"><h3 className="text-base sm:text-lg font-bold leading-tight mb-1" style={{ color: colors.softLight }}>Auto-Save State</h3><p className="text-xs sm:text-sm leading-relaxed opacity-70" style={{ color: colors.softLight }}>Automatically save your game state periodically.</p></div>
                </div>
                <Switch checked={autoSaveState} onChange={() => setAutoSaveState(!autoSaveState)} colors={colors} gradient={gradient} />
            </div>
            <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: autoSaveState ? '300px' : '0px', opacity: autoSaveState ? 1 : 0, marginTop: autoSaveState ? '1.5rem' : '0px', visibility: autoSaveState ? 'visible' : 'hidden' }}>
                <div className="pt-4 border-t space-y-4 pl-0 sm:pl-16" style={{ borderColor: colors.highlight + '30' }}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3"><Clock className="w-4 h-4" style={{ color: colors.highlight }} /><span className="text-sm font-medium" style={{ color: colors.softLight }}>Save Interval</span></div>
                        <div className="flex flex-wrap items-center gap-2">{[15, 30, 45, 60].map(v => (
                            <button key={v} onClick={() => setAutoSaveInterval(v)} className="px-3 py-1 rounded-xl text-sm font-medium h-9 transition-all active:scale-95 flex items-center justify-center flex-1 sm:flex-none" style={{ backgroundColor: autoSaveInterval === v ? colors.highlight : colors.midDark, color: autoSaveInterval === v ? colors.darkBg : colors.softLight }}>{v}s</button>
                        ))}</div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">{autoSaveIcon ? <Eye className="w-4 h-4" style={{ color: colors.highlight }} /> : <EyeOff className="w-4 h-4" style={{ color: colors.highlight }} />}<span className="text-sm font-medium" style={{ color: colors.softLight }}>Show Save Icon</span></div>
                        <Switch checked={autoSaveIcon} onChange={() => setAutoSaveIcon(!autoSaveIcon)} colors={colors} gradient={gradient} />
                    </div>
                </div>
            </div>
        </div>
        <div className="p-4 sm:p-6 rounded-xl border-[0.125rem] flex flex-col" style={{ backgroundColor: colors.darkBg, borderColor: colors.midDark, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', animation: 'fadeIn 0.4s ease-out 0.03s both' }}>
            <div className="flex items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-5 overflow-hidden">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.midDark, color: colors.highlight }}><Save className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                    <div className="flex-1 min-w-0"><h3 className="text-base sm:text-lg font-bold leading-tight mb-1" style={{ color: colors.softLight }}>Auto-Load State</h3><p className="text-xs sm:text-sm leading-relaxed opacity-70" style={{ color: colors.softLight }}>Resume gameplay from your last state automatically.</p></div>
                </div>
                <Switch checked={autoLoadState} onChange={() => setAutoLoadState(!autoLoadState)} colors={colors} gradient={gradient} />
            </div>
            <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: autoLoadState ? '200px' : '0px', opacity: autoLoadState ? 1 : 0, marginTop: autoLoadState ? '1.5rem' : '0px', visibility: autoLoadState ? 'visible' : 'hidden' }}>
                <div className="pt-4 border-t pl-0 sm:pl-16" style={{ borderColor: colors.highlight + '30' }}>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">{autoLoadIcon ? <Eye className="w-4 h-4" style={{ color: colors.highlight }} /> : <EyeOff className="w-4 h-4" style={{ color: colors.highlight }} />}<span className="text-sm font-medium" style={{ color: colors.softLight }}>Show Load Icon</span></div>
                        <Switch checked={autoLoadIcon} onChange={() => setAutoLoadIcon(!autoLoadIcon)} colors={colors} gradient={gradient} />
                    </div>
                </div>
            </div>
        </div>
        <div className="p-4 sm:p-6 rounded-xl border-[0.125rem] flex flex-col" style={{ backgroundColor: colors.darkBg, borderColor: colors.midDark, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', animation: 'fadeIn 0.4s ease-out 0.06s both' }}>
            <div className="flex items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-5 overflow-hidden">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.midDark, color: colors.highlight }}><Zap className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                    <div className="flex-1 min-w-0"><h3 className="text-base sm:text-lg font-bold leading-tight mb-1" style={{ color: colors.softLight }}>Snappy Animations</h3><p className="text-xs sm:text-sm leading-relaxed opacity-70" style={{ color: colors.softLight }}>Speed up animations for a faster experience.</p></div>
                </div>
                <Switch checked={reducedMotion} onChange={() => setReducedMotion(!reducedMotion)} colors={colors} gradient={gradient} />
            </div>
        </div>
    </div>
));

SettingsView.displayName = 'SettingsView';
