'use client';

import { memo, useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import type { ThemeColors } from '@/types';
import { SHADOW_CARD } from '@/lib/constants';
import { getCoreDisplayName } from '@/lib/ra/cores';
import { pickVariant } from '@/lib/ra/loader';

interface LicensePanelProps {
    colors: ThemeColors;
    libretroCore: string | null;
}

const EMULATORJS_LICENSE = 'https://github.com/EmulatorJS/EmulatorJS/blob/HEAD/LICENSE';
const RETROARCH_LICENSE  = 'https://github.com/EmulatorJS/RetroArch/blob/HEAD/COPYING';

async function fetchCoreLicenseUrl(libretroCore: string, signal: AbortSignal): Promise<string | null> {
    const variant = pickVariant(libretroCore);
    const res = await fetch(`/cores/${libretroCore}/${variant}/core.json`, { signal });
    if (!res.ok) return null;
    const data = await res.json() as { repo?: string; license?: string };
    if (!data.repo || !data.license) return null;
    return `${data.repo.replace(/\/+$/, '')}/blob/HEAD/${data.license}`;
}

export const LicensePanel = memo(({ colors, libretroCore }: LicensePanelProps) => {
    const [coreLicenseUrl, setCoreLicenseUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!libretroCore) { setCoreLicenseUrl(null); return; }
        const ctl = new AbortController();
        fetchCoreLicenseUrl(libretroCore, ctl.signal)
            .then(setCoreLicenseUrl)
            .catch(e => { if ((e as Error).name !== 'AbortError') setCoreLicenseUrl(null); });
        return () => ctl.abort();
    }, [libretroCore]);

    const entries: { label: string; description: string; href: string | null }[] = [
        {
            label: 'Emulation Core',
            description: libretroCore
                ? `License for the ${getCoreDisplayName(libretroCore)} libretro core.`
                : 'No core is currently loaded.',
            href: coreLicenseUrl,
        },
        {
            label: 'RetroArch',
            description: 'License for the RetroArch frontend.',
            href: RETROARCH_LICENSE,
        },
        {
            label: 'EmulatorJS',
            description: 'License for the EmulatorJS runtime.',
            href: EMULATORJS_LICENSE,
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
