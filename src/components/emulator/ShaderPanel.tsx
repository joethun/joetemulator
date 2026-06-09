'use client';

import { memo, useCallback, useEffect, useState } from 'react';
import type { ThemeColors } from '@/types';
import {
    getShaderOptions, getStoredShader, SHADER_DISABLED,
    type ShaderCategory,
} from '@/lib/ra/shaders';
import { OptionButton, SectionHeader, OPTION_GRID_CLASS } from '@/components/emulator/shared';
import { groupBy } from '@/lib/utils';

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

const SHADER_GROUPING = (() => {
    const opts = getShaderOptions();
    return {
        off: opts.find(o => o.category === null),
        byGroup: groupBy(opts.filter(o => o.category !== null), o => o.category!),
    };
})();

export const ShaderPanel = memo(({ colors, libretroCore, onShaderChange }: ShaderPanelProps) => {
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

    const { off, byGroup } = SHADER_GROUPING;

    return (
        <div className="flex flex-col gap-6 min-w-0">
            {off && (
                <div className={OPTION_GRID_CLASS}>
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
                        <div className={OPTION_GRID_CLASS}>
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
