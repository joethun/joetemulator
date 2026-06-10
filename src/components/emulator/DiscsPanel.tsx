'use client';

import { memo, useState } from 'react';
import type { ThemeColors } from '@/types';
import type { DiscInfo } from '@/lib/ra/runtime';
import { OptionButton, OPTION_GRID_CLASS } from '@/components/emulator/shared';

interface DiscsPanelProps {
    colors: ThemeColors;
    getDiscInfo: () => DiscInfo;
    onSetDisc: (index: number) => void;
}

export const DiscsPanel = memo(({ colors, getDiscInfo, onSetDisc }: DiscsPanelProps) => {
    const [info, setInfo] = useState(getDiscInfo);

    const handleSelect = (index: number) => {
        if (index === info.current) return;
        onSetDisc(index);
        // Show the requested disc as current — the core may apply the swap
        // asynchronously, so reading it back can lag.
        setInfo({ ...getDiscInfo(), current: index });
    };

    return (
        <div className={OPTION_GRID_CLASS}>
            {Array.from({ length: info.count }, (_, i) => (
                <OptionButton
                    key={i}
                    label={`Disc ${i + 1}`}
                    active={i === info.current}
                    idx={i}
                    colors={colors}
                    onClick={() => handleSelect(i)}
                />
            ))}
        </div>
    );
});

DiscsPanel.displayName = 'DiscsPanel';
