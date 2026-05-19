'use client';

import { memo, useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import type { ThemeColors } from '@/types';
import { SHADOW_CARD } from '@/lib/constants';
import { getCoreDisplayName } from '@/lib/ra/cores';
import { getCachedCoreInfo } from '@/lib/ra/loader';

interface LicensePanelProps {
    colors: ThemeColors;
    libretroCore: string | null;
}

const EMULATORJS_SOURCE = 'https://github.com/EmulatorJS/EmulatorJS';
const RETROARCH_SOURCE  = 'https://github.com/EmulatorJS/RetroArch';

export const LicensePanel = memo(({ colors, libretroCore }: LicensePanelProps) => {
    // CoreInfo is populated by the loader at boot, so by the time this panel is
    // visible the cache has the repo URL for the running core.
    const coreSourceUrl = useMemo(() => {
        if (!libretroCore) return null;
        const info = getCachedCoreInfo(libretroCore);
        if (!info?.repo) return null;
        return info.repo.replace(/\/+$/, '');
    }, [libretroCore]);

    const entries: { label: string; description: string; href: string | null }[] = [
        {
            label: 'Emulation Core',
            description: libretroCore
                ? `Source for the ${getCoreDisplayName(libretroCore)} libretro core.`
                : 'No core is currently loaded.',
            href: coreSourceUrl,
        },
        {
            label: 'RetroArch',
            description: 'Source for RetroArch.',
            href: RETROARCH_SOURCE,
        },
        {
            label: 'EmulatorJS',
            description: 'Source for EmulatorJS.',
            href: EMULATORJS_SOURCE,
        },
    ];

    return (
        <div className="grid gap-4">
            {entries.map((entry, idx) => {
                const enabled = entry.href !== null;
                return (
                    <a
                        key={entry.label}
                        href={entry.href ?? undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-disabled={!enabled}
                        onClick={enabled ? undefined : (e) => e.preventDefault()}
                        className="p-4 sm:p-6 rounded-xl border-[0.125rem] flex items-center text-left transition-all active:scale-[0.98]"
                        style={{
                            backgroundColor: colors.darkBg,
                            borderColor: colors.midDark,
                            boxShadow: SHADOW_CARD,
                            animation: `fadeIn 0.4s ease-out ${idx * 0.04}s both`,
                            opacity: enabled ? 1 : 0.5,
                            cursor: enabled ? 'pointer' : 'not-allowed',
                        }}
                    >
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-bold leading-tight mb-1" style={{ color: colors.softLight }}>{entry.label}</h3>
                            <p className="text-xs sm:text-sm leading-relaxed opacity-80 break-words" style={{ color: colors.highlight }}>{entry.description}</p>
                        </div>
                        <ExternalLink className="w-5 h-5 shrink-0 opacity-60 ml-3" style={{ color: colors.highlight }} />
                    </a>
                );
            })}
        </div>
    );
});

LicensePanel.displayName = 'LicensePanel';
