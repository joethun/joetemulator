'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { ChevronRight, FileText, Gamepad2, Monitor, Settings as SettingsIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ThemeColors, GradientStyle } from '@/types';
import type { EmulatorSession } from '@/hooks/useEmulator';
import { useDelayedUnmount } from '@/hooks/useDelayedUnmount';
import { Modal, ModalHeader, ModalFooter } from '@/components/Modal';
import { SHADOW_CARD } from '@/lib/constants';
import { ControlsPanel } from '@/components/emulator/ControlsPanel';
import { CoreOptionsPanel } from '@/components/emulator/CoreOptionsPanel';
import { LicensePanel } from '@/components/emulator/LicensePanel';
import { ShaderPanel } from '@/components/emulator/ShaderPanel';
import { SaveStatesPanel } from '@/components/emulator/SaveStatesPanel';
import type { EmulatorPanel } from '@/components/emulator/EmulatorControlsBar';

type SettingsTab = 'controls' | 'options' | 'shader' | 'license';

interface EmulatorMenuProps {
    section: EmulatorPanel | null;
    onClose: () => void;
    colors: ThemeColors;
    gradient: GradientStyle;
    session: EmulatorSession;
    onDuplicateError: (msg: string) => void;
    onLoadState: (key: string) => void;
}

const TAB_META: Record<SettingsTab, { title: string; subtitle: string; icon: LucideIcon }> = {
    controls: { title: 'Controls',     subtitle: 'Click a binding to change it. Right-click to clear.',     icon: Gamepad2 },
    options:  { title: 'Core Options', subtitle: 'RetroArch core settings — some may need a restart to apply.', icon: SettingsIcon },
    shader:   { title: 'Shader',       subtitle: 'Apply a visual filter to the game output.',               icon: Monitor },
    license:  { title: 'Licenses',     subtitle: 'View licenses for the services used by the emulator.', icon: FileText },
};

export const EmulatorMenu = memo(function EmulatorMenu({
    section, onClose, colors, gradient, session, onDuplicateError, onLoadState,
}: EmulatorMenuProps) {
    const { shouldRender, isClosing } = useDelayedUnmount(section !== null);
    const [displaySection, setDisplaySection] = useState<EmulatorPanel | null>(section);
    const [tab, setTab] = useState<SettingsTab | null>(null);
    const [optionsVersion, setOptionsVersion] = useState(0);
    const [optionsActiveKey, setOptionsActiveKey] = useState<string | null>(null);
    const saveImportRef = useRef<HTMLInputElement>(null);

    if (section && section !== displaySection) setDisplaySection(section);

    // Reset the settings sub-tab whenever the menu is re-opened from the bar.
    useEffect(() => { if (section === 'settings') setTab(null); }, [section]);

    if (!shouldRender || !displaySection) return null;

    const handleBack = () => {
        if (tab === 'options' && optionsActiveKey) { setOptionsActiveKey(null); return; }
        if (displaySection === 'settings' && tab) { setTab(null); return; }
        onClose();
    };

    return (
        <Modal isClosing={isClosing} colors={colors} onClose={onClose} height="tall" z={60} ariaLabel="Emulator menu">
            <div className="flex flex-col flex-1 min-h-0">
                {displaySection === 'saves' ? (
                    <ModalHeader title="Manage States" subtitle={session.currentGame ?? 'Game'} colors={colors} />
                ) : !tab ? (
                    <ModalHeader title="Game Settings" subtitle={session.currentGame ?? undefined} colors={colors} />
                ) : (
                    <ModalHeader title={TAB_META[tab].title} subtitle={TAB_META[tab].subtitle} colors={colors} />
                )}

                <div className="flex-1 overflow-y-auto min-h-0" style={{ padding: '2px', margin: '-2px' }}>
                    {displaySection === 'saves' && session.currentGame && (
                        <SaveStatesPanel
                            colors={colors}
                            gameName={session.currentGame}
                            gameTitle={session.currentGame}
                            onDuplicateError={onDuplicateError}
                            importRef={saveImportRef}
                            onLoad={onLoadState}
                        />
                    )}
                    {displaySection === 'settings' && !tab && (
                        <SettingsHub colors={colors} onPick={setTab} />
                    )}
                    {displaySection === 'settings' && tab === 'controls' && (
                        <ControlsPanel
                            bindings={session.bindings}
                            onChange={session.actions.setBindings}
                            colors={colors}
                            core={session.currentCore ?? ''}
                        />
                    )}
                    {displaySection === 'settings' && tab === 'options' && (
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
                    {displaySection === 'settings' && tab === 'shader' && (
                        <ShaderPanel
                            colors={colors}
                            libretroCore={session.currentLibretroCore}
                            onShaderChange={session.actions.setShader}
                        />
                    )}
                    {displaySection === 'settings' && tab === 'license' && (
                        <LicensePanel
                            colors={colors}
                            libretroCore={session.currentLibretroCore}
                        />
                    )}
                </div>

                <ModalFooter colors={colors}>
                    {displaySection === 'saves' ? (
                        <button onClick={() => saveImportRef.current?.click()}
                            className="h-12 px-8 rounded-xl font-bold transition-all active:scale-95 cursor-pointer"
                            style={{ backgroundColor: colors.highlight, color: colors.darkBg }}>
                            Import
                        </button>
                    ) : tab === 'controls' ? (
                        <button onClick={session.actions.resetBindings}
                            className="h-12 px-8 rounded-xl font-bold transition-all active:scale-95 cursor-pointer"
                            style={{ backgroundColor: colors.highlight, color: colors.darkBg }}>
                            Reset
                        </button>
                    ) : tab === 'options' ? (
                        <button onClick={() => { session.actions.resetCoreOptions(); setOptionsVersion(v => v + 1); }}
                            className="h-12 px-8 rounded-xl font-bold transition-all active:scale-95 cursor-pointer"
                            style={{ backgroundColor: colors.highlight, color: colors.darkBg }}>
                            Reset
                        </button>
                    ) : <div />}
                    <button onClick={handleBack}
                        className="h-12 px-8 rounded-xl font-bold transition-all active:scale-95 cursor-pointer"
                        style={{ ...gradient, color: colors.darkBg }}>
                        Back
                    </button>
                </ModalFooter>
            </div>
        </Modal>
    );
});

function SettingsHub({ colors, onPick }: { colors: ThemeColors; onPick: (tab: SettingsTab) => void }) {
    const tabs: SettingsTab[] = ['controls', 'options', 'shader', 'license'];
    return (
        <div className="grid gap-4">
            {tabs.map((key, idx) => {
                const { title, subtitle, icon: Icon } = TAB_META[key];
                return (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onPick(key)}
                        className="p-4 sm:p-6 rounded-xl border-[0.125rem] flex items-center text-left transition-all active:scale-[0.98] cursor-pointer"
                        style={{
                            backgroundColor: colors.darkBg,
                            borderColor: colors.midDark,
                            boxShadow: SHADOW_CARD,
                            animation: `fadeIn 0.4s ease-out ${idx * 0.04}s both`,
                        }}
                    >
                        <div className="flex items-center gap-3 sm:gap-5 overflow-hidden flex-1">
                            <div
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: colors.midDark, color: colors.highlight }}
                            >
                                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base sm:text-lg font-bold leading-tight mb-1" style={{ color: colors.softLight }}>{title}</h3>
                                <p className="text-xs sm:text-sm leading-relaxed opacity-80" style={{ color: colors.highlight }}>{subtitle}</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 shrink-0 opacity-60 ml-3" style={{ color: colors.highlight }} />
                    </button>
                );
            })}
        </div>
    );
}
