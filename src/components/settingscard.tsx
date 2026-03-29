import { memo, ReactNode } from 'react';
import { ThemeColors, GradientStyle } from '@/types';
import { Switch } from '@/components/switch';
import { LucideIcon } from 'lucide-react';

interface SettingsCardProps {
    colors: ThemeColors;
    gradient: GradientStyle;
    icon: LucideIcon;
    title: string;
    description: string;
    animationDelay?: string;
    control?: ReactNode;
    checked?: boolean;
    onToggle?: () => void;
    children?: ReactNode;
    isExpanded?: boolean;
}

export const SettingsCard = memo(({
    colors, gradient, icon: Icon, title, description,
    animationDelay = '0s', control, checked, onToggle, children, isExpanded = false,
}: SettingsCardProps) => (
    <div
        className="p-4 sm:p-6 rounded-xl border-[0.125rem] flex flex-col"
        style={{
            backgroundColor: colors.darkBg,
            borderColor: colors.midDark,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            animation: `fadeIn 0.4s ease-out ${animationDelay} both`
        }}
    >
        <div 
            className={`flex items-center justify-between gap-4 sm:gap-6 ${onToggle ? 'cursor-pointer' : ''}`}
            onClick={onToggle}
        >
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

            {control ? control : onToggle && (
                <div onClick={e => e.stopPropagation()}>
                    <Switch checked={checked ?? false} onChange={onToggle} colors={colors} gradient={gradient} />
                </div>
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
