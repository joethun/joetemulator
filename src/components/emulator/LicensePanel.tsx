'use client';

import { memo, useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import type { ThemeColors } from '@/types';
import { getCoreDisplayName } from '@/lib/ra/cores';
import { getCachedCoreInfo } from '@/lib/ra/loader';
import { NavCard } from '@/components/emulator/shared';

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
            {entries.map((entry, idx) => (
                <NavCard
                    key={entry.label}
                    title={entry.label}
                    subtitle={entry.description}
                    colors={colors}
                    idx={idx}
                    trailingIcon={ExternalLink}
                    href={entry.href}
                />
            ))}
        </div>
    );
});

LicensePanel.displayName = 'LicensePanel';
