import { memo, ReactNode } from 'react';
import { ThemeColors, GradientStyle } from '@/types';
import { Switch } from '@/components/Switch';
import { LucideIcon } from 'lucide-react';
import { SHADOW_CARD } from '@/lib/constants';

interface SettingsCardProps {
    colors: ThemeColors;
    gradient: GradientStyle;
    icon: LucideIcon;
    title: string;
    description: string;
    animationDelay?: string;
    checked?: boolean;
    onToggle?: () => void;
    children?: ReactNode;
    isExpanded?: boolean;
}

export const SettingsCard = memo(({
    colors, gradient, icon: Icon, title, description,
    animationDelay = '0s', checked, onToggle, children, isExpanded = false,
}: SettingsCardProps) => (
    <div
        className="p-4 sm:p-6 rounded-xl border-[0.125rem] flex flex-col"
        style={{
            backgroundColor: colors.darkBg,
            borderColor: colors.midDark,
            boxShadow: SHADOW_CARD,
            animation: `fadeIn 0.4s ease-out ${animationDelay} both`
        }}
    >
        <div className="flex items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-5 overflow-hidden">
                <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: colors.midDark, color: colors.highlight }}
                >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold leading-tight mb-1" style={{ color: colors.softLight }}>{title}</h3>
                    <p className="text-xs sm:text-sm leading-relaxed opacity-80" style={{ color: colors.highlight }}>{description}</p>
                </div>
            </div>

            {onToggle && (
                <Switch checked={checked ?? false} onChange={onToggle} colors={colors} gradient={gradient} />
            )}
        </div>

        {children && (
            <div
                className="overflow-hidden transition-all duration-300"
                style={{
                    maxHeight: isExpanded ? '400px' : '0px',
                    opacity: isExpanded ? 1 : 0,
                    marginTop: isExpanded ? '1.5rem' : '0px',
                    visibility: isExpanded ? 'visible' : 'hidden'
                }}
            >
                <div className="pt-4 border-t pl-0 sm:pl-16" style={{ borderColor: `${colors.highlight}30` }}>
                    {children}
                </div>
            </div>
        )}
    </div>
));

SettingsCard.displayName = 'SettingsCard';

interface SettingRowProps {
    colors: ThemeColors;
    icon: LucideIcon;
    label: string;
    children: ReactNode;
}

/** An icon + label row inside an expanded SettingsCard, with a trailing control. */
export function SettingRow({ colors, icon: Icon, label, children }: SettingRowProps) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
                <Icon className="w-4 h-4 shrink-0" style={{ color: colors.highlight }} />
                <span className="text-sm font-medium truncate" style={{ color: colors.softLight }}>{label}</span>
            </div>
            {children}
        </div>
    );
}

interface SettingItemProps {
    colors: ThemeColors;
    gradient: GradientStyle;
    icon: LucideIcon;
    label: string;
    checked: boolean;
    onToggle: () => void;
}

/** A toggle row inside an expanded SettingsCard (e.g. "Show Save Icon"). */
export function SettingItem({ gradient, checked, onToggle, ...row }: SettingItemProps) {
    return (
        <SettingRow {...row}>
            <Switch checked={checked} onChange={onToggle} colors={row.colors} gradient={gradient} />
        </SettingRow>
    );
}

interface ChipButtonProps {
    colors: ThemeColors;
    onClick: () => void;
    /** Highlighted (the selected option, or the primary action). */
    active?: boolean;
    /** Set for toggle-style choices (the Save Interval options). */
    'aria-pressed'?: boolean;
    /** Extra layout classes. */
    className?: string;
    children: ReactNode;
}

/** Small pill button used in expanded settings (Save Interval, Log In/Out). */
export function ChipButton({ colors, onClick, active = false, className = '', children, ...aria }: ChipButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            {...aria}
            className={`px-3 py-1 rounded-xl h-9 text-sm font-medium flex items-center justify-center transition-all active:scale-95 cursor-pointer ${className}`}
            style={{
                backgroundColor: active ? colors.highlight : colors.midDark,
                color: active ? colors.darkBg : colors.softLight,
            }}
        >
            {children}
        </button>
    );
}
