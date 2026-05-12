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
    const options = useMemo(() => getShaderOptions(), []);
    const [selected, setSelected] = useState<string>(
        () => libretroCore ? getStoredShader(libretroCore) : SHADER_DISABLED,
    );

    useEffect(() => {
        setSelected(libretroCore ? getStoredShader(libretroCore) : SHADER_DISABLED);
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
