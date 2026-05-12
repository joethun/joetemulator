'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import type { ThemeColors } from '@/types';
import {
    getShaderOptions, getStoredShader, SHADER_DISABLED,
    type ShaderOption, type ShaderCategory,
} from '@/lib/ra/shaders';
import { OptionButton, SectionHeader } from '@/components/emulator/shared';

interface ShaderPanelProps {
    colors: ThemeColors;
    libretroCore: string | null;
    onShaderChange: (name: string) => void;
}

const GROUPS: { key: ShaderCategory; title: string }[] = [
    { key: 'crt',     title: 'CRT' },
    { key: 'scaling', title: 'Scaling' },
    { key: 'effects', title: 'Effects' },
];

export const ShaderPanel = memo(({ colors, libretroCore, onShaderChange }: ShaderPanelProps) => {
    const [options, setOptions] = useState<ShaderOption[]>([]);
    const [selected, setSelected] = useState<string>(SHADER_DISABLED);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        getShaderOptions()
            .then(opts => {
                setOptions(opts);
                setSelected(libretroCore ? getStoredShader(libretroCore) : SHADER_DISABLED);
            })
            .catch(err => setError(err instanceof Error ? err.message : 'Failed to load shaders'))
            .finally(() => setLoading(false));
    }, [libretroCore]);

    const handleSelect = useCallback((key: string) => {
        if (key === selected) return;
        setSelected(key);
        onShaderChange(key);
    }, [onShaderChange, selected]);

    const { off, byGroup } = useMemo(() => {
        const byGroup = new Map<ShaderCategory, ShaderOption[]>();
        let off: ShaderOption | undefined;
        for (const opt of options) {
            if (opt.category === null) { off = opt; continue; }
            const arr = byGroup.get(opt.category);
            if (arr) arr.push(opt);
            else byGroup.set(opt.category, [opt]);
        }
        return { off, byGroup };
    }, [options]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-sm font-medium opacity-60" style={{ color: colors.softLight }}>
                    Loading shaders…
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="py-3 px-4 rounded-xl border-[0.125rem] flex items-center"
                style={{ backgroundColor: colors.darkBg, borderColor: colors.midDark }}
            >
                <span className="text-sm font-medium" style={{ color: 'rgb(248,113,113)' }}>
                    {error}
                </span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 min-w-0">
            {off && (
                <div className="grid grid-cols-2 gap-2.5">
                    <OptionButton
                        label="Disabled"
                        active={selected === off.key}
                        idx={0}
                        colors={colors}
                        onClick={() => handleSelect(off.key)}
                    />
                </div>
            )}

            {GROUPS.map(({ key, title }) => {
                const items = byGroup.get(key);
                if (!items?.length) return null;
                return (
                    <div key={key}>
                        <SectionHeader title={title} colors={colors} />
                        <div className="grid grid-cols-2 gap-2.5">
                            {items.map((opt, idx) => (
                                <OptionButton
                                    key={opt.key}
                                    label={opt.label}
                                    active={selected === opt.key}
                                    idx={idx}
                                    colors={colors}
                                    onClick={() => handleSelect(opt.key)}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

ShaderPanel.displayName = 'ShaderPanel';
