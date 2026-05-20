'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import type { ThemeColors } from '@/types';
import type { CoreOption } from '@/lib/ra/core-options';
import { getCoresForSystem } from '@/lib/ra/cores';
import { OptionButton, SectionHeader } from '@/components/emulator/shared';

const CORE_KEY = '__core__';

interface CoreOptionsPanelProps {
    colors: ThemeColors;
    getOptions: () => CoreOption[];
    onChange: (key: string, value: string) => void;
    system: string | null;
    libretroCore: string | null;
    onSwitchCore: (libretroName: string) => void;
    refreshKey: number;
    activeKey: string | null;
    onActiveKeyChange: (key: string | null) => void;
}

interface Entry {
    key: string;
    label: string;
    value: string;
    choices: string[];
    disabled?: boolean;
}

export const CoreOptionsPanel = memo((props: CoreOptionsPanelProps) => {
    const {
        colors, getOptions, onChange, system, libretroCore, onSwitchCore, refreshKey,
        activeKey, onActiveKeyChange,
    } = props;
    const [options, setOptions] = useState<CoreOption[]>(getOptions);

    // refreshKey starts at 0; we only refresh on subsequent bumps.
    useEffect(() => {
        if (refreshKey === 0) return;
        setOptions(getOptions());
    }, [refreshKey, getOptions]);

    const coreEntry = useMemo<Entry | null>(() => {
        const availableCores = system ? getCoresForSystem(system) : [];
        if (!libretroCore || availableCores.length === 0) return null;
        return {
            key: CORE_KEY,
            label: 'Core',
            value: libretroCore,
            choices: availableCores as string[],
            disabled: availableCores.length < 2,
        };
    }, [system, libretroCore]);

    const optionEntries = useMemo<Entry[]>(() =>
        options.map(opt => ({
            key: opt.key, label: opt.label,
            value: opt.current, choices: opt.choices,
        })),
    [options]);

    const active = activeKey
        ? (coreEntry?.key === activeKey ? coreEntry : optionEntries.find(e => e.key === activeKey) ?? null)
        : null;

    useEffect(() => {
        if (!activeKey) return;
        const exists = coreEntry?.key === activeKey || optionEntries.some(e => e.key === activeKey);
        if (!exists) onActiveKeyChange(null);
    }, [coreEntry, optionEntries, activeKey, onActiveKeyChange]);

    const handleSelect = useCallback((entryKey: string, value: string) => {
        if (entryKey === CORE_KEY) {
            onSwitchCore(value);
        } else {
            setOptions(prev => prev.map(o => o.key === entryKey ? { ...o, current: value } : o));
            onChange(entryKey, value);
        }
    }, [onChange, onSwitchCore]);

    if (!coreEntry && optionEntries.length === 0) {
        return (
            <div
                className="px-4 py-6 rounded-xl border-[0.125rem] text-sm text-center"
                style={{
                    backgroundColor: colors.darkBg,
                    borderColor: colors.midDark,
                    color: colors.softLight,
                }}
            >
                This core has no editable options.
            </div>
        );
    }

    if (active) {
        const items = active.choices.includes(active.value)
            ? active.choices
            : [active.value, ...active.choices];
        return (
            <div className="flex flex-col gap-6 min-w-0" style={{ animation: 'fadeIn 0.2s ease-out both' }}>
                <div>
                    <SectionHeader title={active.label} colors={colors} />
                    <div role="listbox" className="grid grid-cols-2 gap-2.5">
                        {items.map((item, idx) => (
                            <OptionButton
                                key={item}
                                label={item}
                                active={item === active.value}
                                colors={colors}
                                idx={idx}
                                onClick={() => handleSelect(active.key, item)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 min-w-0" style={{ animation: 'fadeIn 0.2s ease-out both' }}>
            {coreEntry && (
                <div>
                    <SectionHeader title="Emulation Core" colors={colors} />
                    <OptionRow entry={coreEntry} colors={colors} onOpen={onActiveKeyChange} />
                </div>
            )}
            {optionEntries.length > 0 && (
                <div>
                    <SectionHeader title="Options" colors={colors} />
                    <div className="flex flex-col gap-2.5">
                        {optionEntries.map((entry, idx) => (
                            <OptionRow
                                key={entry.key}
                                entry={entry}
                                idx={idx}
                                colors={colors}
                                onOpen={onActiveKeyChange}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

CoreOptionsPanel.displayName = 'CoreOptionsPanel';

interface OptionRowProps {
    entry: Entry;
    idx?: number;
    colors: ThemeColors;
    onOpen: (key: string) => void;
}

function OptionRow({ entry, idx, colors, onOpen }: OptionRowProps) {
    return (
        <div
            className="h-12 px-4 rounded-xl border-[0.125rem] flex items-center justify-between gap-3"
            style={{
                backgroundColor: colors.darkBg,
                borderColor: colors.midDark,
                color: colors.softLight,
                opacity: entry.disabled ? 0.5 : 1,
                animation: idx !== undefined ? `fadeIn 0.4s ease-out ${idx * 0.02}s both` : undefined,
            }}
        >
            <span
                className="text-sm font-medium truncate pr-2 flex-1 text-left"
            >
                {entry.label}
            </span>
            <button
                type="button"
                disabled={entry.disabled}
                onClick={() => onOpen(entry.key)}
                className="px-2.5 h-8 rounded-lg flex items-center justify-center text-sm font-medium shrink-0 max-w-[14rem] transition-all disabled:cursor-not-allowed enabled:cursor-pointer focus:outline-none"
                style={{ backgroundColor: colors.midDark, color: colors.softLight }}
            >
                <span className="truncate">{entry.value}</span>
            </button>
        </div>
    );
}
