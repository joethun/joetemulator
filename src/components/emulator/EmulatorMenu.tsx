'use client';

import { memo, useState } from 'react';
import { ChevronRight, Code2, Disc3, GamepadDirectional, Monitor, Settings2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ThemeColors, GradientStyle } from '@/types';
import type { EmulatorSession } from '@/hooks/useEmulator';
import type { DiscInfo } from '@/lib/ra/runtime';
import { useDelayedUnmount } from '@/hooks/useDelayedUnmount';
import { Modal, ModalHeader, ModalFooter, ModalButton } from '@/components/Modal';
import { NavCard } from '@/components/emulator/shared';
import { ControlsPanel } from '@/components/emulator/ControlsPanel';
import { CoreOptionsPanel } from '@/components/emulator/CoreOptionsPanel';
import { DiscsPanel } from '@/components/emulator/DiscsPanel';
import { LicensePanel } from '@/components/emulator/LicensePanel';
import { ShaderPanel } from '@/components/emulator/ShaderPanel';

type SettingsTab = 'discs' | 'controls' | 'options' | 'shader' | 'license';

interface EmulatorMenuProps {
    open: boolean;
    onClose: () => void;
    colors: ThemeColors;
    gradient: GradientStyle;
    session: EmulatorSession;
}

const TAB_META: Record<SettingsTab, { title: string; subtitle: string; icon: LucideIcon }> = {
    discs:    { title: 'Discs',        subtitle: 'Swap which disc is in the drive.',                        icon: Disc3 },
    controls: { title: 'Controls',     subtitle: 'Click a binding to change it. Right-click to clear.',     icon: GamepadDirectional },
    options:  { title: 'Core Options', subtitle: 'RetroArch core settings. Some may need a restart to apply.', icon: Settings2 },
    shader:   { title: 'Shader',       subtitle: 'Apply a visual filter to the game output.',               icon: Monitor },
    license:  { title: 'Credits',      subtitle: 'Repos for the emulation core, RetroArch, and EmulatorJS.', icon: Code2 },
};

export const EmulatorMenu = memo(function EmulatorMenu({
    open, onClose, colors, gradient, session,
}: EmulatorMenuProps) {
    const { shouldRender, isClosing } = useDelayedUnmount(open);
    const [tab, setTab] = useState<SettingsTab | null>(null);
    const [optionsVersion, setOptionsVersion] = useState(0);
    const [optionsActiveKey, setOptionsActiveKey] = useState<string | null>(null);
    // why: useDelayedUnmount keeps the panel mounted across the close animation, so
    // local state survives a round-trip — we reset `tab` on every open transition so
    // the user lands on the hub instead of restoring the last sub-tab they navigated to.
    const [prevOpen, setPrevOpen] = useState(open);
    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) setTab(null);
    }

    if (!shouldRender) return null;

    const handleBack = () => {
        if (tab === 'options' && optionsActiveKey) { setOptionsActiveKey(null); return; }
        if (tab) { setTab(null); return; }
        onClose();
    };

    // Per-tab reset action for the footer; null when the hub is showing.
    const resetActions: Partial<Record<SettingsTab, () => void>> = {
        controls: session.actions.resetBindings,
        options: () => { session.actions.resetCoreOptions(); setOptionsVersion(v => v + 1); },
    };
    const onReset = tab ? resetActions[tab] : undefined;

    return (
        <Modal isClosing={isClosing} colors={colors} onClose={onClose} z={60} ariaLabel="Emulator menu">
            <div className="flex flex-col flex-1 min-h-0">
                {!tab ? (
                    <ModalHeader title="Game Settings" subtitle={session.currentTitle ?? undefined} colors={colors} />
                ) : (
                    <ModalHeader title={TAB_META[tab].title} subtitle={TAB_META[tab].subtitle} colors={colors} />
                )}

                <div className="flex-1 overflow-y-auto min-h-0" style={{ padding: '2px', margin: '-2px' }}>
                    {!tab && (
                        <SettingsHub colors={colors} onPick={setTab} getDiscInfo={session.actions.getDiscInfo} />
                    )}
                    {tab === 'discs' && (
                        <DiscsPanel
                            colors={colors}
                            getDiscInfo={session.actions.getDiscInfo}
                            onSetDisc={session.actions.setDisc}
                        />
                    )}
                    {tab === 'controls' && (
                        <ControlsPanel
                            bindings={session.bindings}
                            onChange={session.actions.setBindings}
                            colors={colors}
                            core={session.currentCore ?? ''}
                            controllerPorts={session.actions.getControllerPorts()}
                            onControllerDeviceChange={session.actions.setControllerDevice}
                        />
                    )}
                    {tab === 'options' && (
                        <CoreOptionsPanel
                            key={session.currentLibretroCore ?? 'none'}
                            colors={colors}
                            getOptions={session.actions.getCoreOptions}
                            onChange={session.actions.setCoreOption}
                            system={session.currentCore}
                            libretroCore={session.currentLibretroCore}
                            onSwitchCore={session.actions.switchCore}
                            refreshKey={optionsVersion}
                            activeKey={optionsActiveKey}
                            onActiveKeyChange={setOptionsActiveKey}
                        />
                    )}
                    {tab === 'shader' && (
                        <ShaderPanel
                            colors={colors}
                            libretroCore={session.currentLibretroCore}
                            onShaderChange={session.actions.setShader}
                        />
                    )}
                    {tab === 'license' && (
                        <LicensePanel
                            colors={colors}
                            libretroCore={session.currentLibretroCore}
                        />
                    )}
                </div>

                <ModalFooter colors={colors}>
                    {onReset && <ModalButton onClick={onReset} colors={colors}>Reset</ModalButton>}
                    <ModalButton onClick={handleBack} colors={colors} variant="gradient" gradient={gradient}>
                        Back
                    </ModalButton>
                </ModalFooter>
            </div>
        </Modal>
    );
});

const SETTINGS_TABS: SettingsTab[] = ['controls', 'options', 'shader', 'license'];

function SettingsHub({ colors, onPick, getDiscInfo }: { colors: ThemeColors; onPick: (tab: SettingsTab) => void; getDiscInfo: () => DiscInfo }) {
    // The disc count is fixed for the session — read it once per mount instead
    // of calling into the running core on every render.
    const [discCount] = useState(() => getDiscInfo().count);
    const tabs: SettingsTab[] = discCount > 1 ? ['discs', ...SETTINGS_TABS] : SETTINGS_TABS;
    return (
        <div className="grid gap-4">
            {tabs.map((key, idx) => {
                const { title, subtitle, icon } = TAB_META[key];
                return (
                    <NavCard
                        key={key}
                        title={title}
                        subtitle={subtitle}
                        colors={colors}
                        idx={idx}
                        leadingIcon={icon}
                        trailingIcon={ChevronRight}
                        onClick={() => onPick(key)}
                    />
                );
            })}
        </div>
    );
}
