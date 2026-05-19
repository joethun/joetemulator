'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import type { ThemeColors } from '@/types';
import { NUM_PLAYERS, type InputBindings, type KeyMap } from '@/lib/ra/input';
import { getButtonsForCore } from '@/lib/ra/control-schemes';
import { getMaxPlayers } from '@/lib/ra/cores';
import type { ControllerPort } from '@/lib/ra/controllers';
import { SectionHeader } from '@/components/emulator/shared';
import { BindingRow, BindingChip } from '@/components/emulator/BindingRow';

interface ControlsPanelProps {
    bindings: InputBindings;
    onChange: (next: InputBindings) => void;
    colors: ThemeColors;
    core: string;
    controllerPorts?: readonly ControllerPort[];
    onControllerDeviceChange?: (port: number, deviceId: number) => void;
}

type HotkeyKey = 'fastForwardKey' | 'rewindKey' | 'pauseKey' | 'saveStateKey' | 'loadStateKey';
type HotkeyGamepadKey = 'fastForwardGamepad' | 'rewindGamepad' | 'pauseGamepad' | 'saveStateGamepad' | 'loadStateGamepad';

interface SystemHotkey {
    keyboard: HotkeyKey;
    gamepad: HotkeyGamepadKey;
    label: string;
}

const SYSTEM_HOTKEYS: SystemHotkey[] = [
    { keyboard: 'fastForwardKey', gamepad: 'fastForwardGamepad', label: 'Fast-Forward' },
    { keyboard: 'rewindKey',      gamepad: 'rewindGamepad',      label: 'Rewind' },
    { keyboard: 'pauseKey',       gamepad: 'pauseGamepad',       label: 'Pause / Menu' },
    { keyboard: 'saveStateKey',   gamepad: 'saveStateGamepad',   label: 'Save State' },
    { keyboard: 'loadStateKey',   gamepad: 'loadStateGamepad',   label: 'Load State' },
];

function formatKeyCode(code: string | undefined): string {
    if (!code) return '—';
    if (code.startsWith('Key'))   return code.slice(3);
    if (code.startsWith('Digit')) return code.slice(5);
    if (code.startsWith('Arrow')) return code.slice(5) + ' Arrow';
    return code;
}

function findKeyForButton(keyMap: KeyMap, retroId: number, player: number): string | null {
    for (const [code, bind] of Object.entries(keyMap)) {
        if (bind.player === player && bind.button === retroId) return code;
    }
    return null;
}

function groupForButton(id: number): string {
    if (id >= 4  && id <= 7)  return 'D-Pad';
    if (id >= 10 && id <= 15) return 'Shoulder';
    if (id === 2 || id === 3) return 'System';
    if (id >= 16 && id <= 23) return 'Analog';
    return 'Buttons';
}

function shortenGamepadId(id: string): string {
    const cleaned = id.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
    return cleaned.length > 32 ? cleaned.slice(0, 31) + '…' : cleaned;
}

function gamepadAssignmentLabel(
    assignment: Record<number, number> | undefined,
    player: number,
    pads: (Gamepad | null)[],
): string {
    const explicit = assignment?.[player];
    const pad = pads[explicit ?? player];
    if (pad) {
        const name = shortenGamepadId(pad.id);
        return explicit === undefined ? `Auto · ${name}` : name;
    }
    return explicit === undefined ? 'Auto · None' : 'None';
}

// When user assigns player P to gamepad N, swap any player who currently uses N
// (explicitly or by default) into P's previous slot, so each player owns one pad.
function applyAssignmentSwap(
    current: Record<number, number>,
    player: number,
    newIdx: number,
): Record<number, number> {
    const next = { ...current };
    const previous = current[player] ?? player;
    for (let p = 0; p < NUM_PLAYERS; p++) {
        if (p === player) continue;
        if ((current[p] ?? p) === newIdx) next[p] = previous;
    }
    next[player] = newIdx;
    return next;
}

export const ControlsPanel = memo(({
    bindings, onChange, colors, core, controllerPorts, onControllerDeviceChange,
}: ControlsPanelProps) => {
    const [selectedPlayer, setSelectedPlayer] = useState(0);

    const [gamepads, setGamepads] = useState<(Gamepad | null)[]>([]);
    useEffect(() => {
        const refresh = () => setGamepads(Array.from(navigator.getGamepads?.() ?? []));
        refresh();
        window.addEventListener('gamepadconnected', refresh);
        window.addEventListener('gamepaddisconnected', refresh);
        return () => {
            window.removeEventListener('gamepadconnected', refresh);
            window.removeEventListener('gamepaddisconnected', refresh);
        };
    }, []);

    const [listening, setListening] = useState<
        | { kind: 'pad'; retroId: number; player: number }
        | { kind: 'gamepad'; retroId: number; player: number }
        | { kind: 'hotkey'; key: HotkeyKey }
        | { kind: 'hotkey-gamepad'; key: HotkeyGamepadKey }
        | { kind: 'assign'; player: number }
        | null
    >(null);

    useEffect(() => { setListening(null); }, [selectedPlayer]);

    const maxPlayers = useMemo(() => getMaxPlayers(core), [core]);

    // If the system shrinks below the selected slot (e.g. switching games), snap back to P1.
    useEffect(() => {
        if (selectedPlayer >= maxPlayers) setSelectedPlayer(0);
    }, [maxPlayers, selectedPlayer]);

    const availableButtons = useMemo(() => getButtonsForCore(core), [core]);

    const groups = useMemo(() => {
        const map = new Map<string, typeof availableButtons>();
        for (const item of availableButtons) {
            const key = groupForButton(item.id);
            const arr = map.get(key);
            if (arr) arr.push(item);
            else map.set(key, [item]);
        }
        return Array.from(map.entries());
    }, [availableButtons]);

    const handleClearAssignment = useCallback((player: number) => {
        const nextAssignment = { ...(bindings.gamepadAssignment ?? {}) };
        delete nextAssignment[player];
        onChange({ ...bindings, gamepadAssignment: nextAssignment });
    }, [bindings, onChange]);

    // Keyboard listener — pad / hotkey kinds; Esc cancels (or resets to Auto for 'assign').
    useEffect(() => {
        if (!listening) return;

        const onKey = (e: KeyboardEvent) => {
            const target = listening;
            const code = e.code;

            if (code === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                if (target.kind === 'assign') handleClearAssignment(target.player);
                setListening(null);
                return;
            }
            if (target.kind === 'gamepad' || target.kind === 'assign' || target.kind === 'hotkey-gamepad') return;

            e.preventDefault();
            e.stopPropagation();

            if (target.kind === 'pad') {
                const nextKeyMap = { ...bindings.keyMap };
                for (const [c, bind] of Object.entries(nextKeyMap)) {
                    if (c === code || (bind.player === target.player && bind.button === target.retroId)) {
                        delete nextKeyMap[c];
                    }
                }
                nextKeyMap[code] = { player: target.player, button: target.retroId };
                onChange({ ...bindings, keyMap: nextKeyMap });
            } else {
                onChange({ ...bindings, [target.key]: code });
            }
            setListening(null);
        };

        window.addEventListener('keydown', onKey, { capture: true });
        return () => window.removeEventListener('keydown', onKey, { capture: true });
    }, [listening, bindings, onChange, handleClearAssignment]);

    // Gamepad listener — gamepad / hotkey-gamepad / assign kinds. Per-pad baseline
    // so a held button on a different pad can't poison capture.
    useEffect(() => {
        if (!listening || (listening.kind !== 'gamepad' && listening.kind !== 'hotkey-gamepad' && listening.kind !== 'assign')) return;

        let raf = 0;
        let baseline: boolean[][] | null = null;
        // For 'gamepad' kind: collect every button held during the chord, then
        // commit the whole set on release.
        let chord: { pad: number; buttons: Set<number> } | null = null;

        const tick = () => {
            const pads = navigator.getGamepads?.() ?? [];
            if (!baseline) {
                baseline = Array.from(pads, pad =>
                    pad ? pad.buttons.map(b => b.pressed || b.value > 0.5) : [],
                );
            }

            const target = listening;

            for (let p = 0; p < pads.length; p++) {
                const pad = pads[p];
                if (!pad) continue;
                const base = baseline[p] ?? (baseline[p] = pad.buttons.map(() => false));
                for (let i = 0; i < pad.buttons.length; i++) {
                    const pressed = pad.buttons[i].pressed || pad.buttons[i].value > 0.5;
                    if (pressed && !base[i]) {
                        if (target.kind === 'gamepad') {
                            // Lock to the first pad that produces a press; collect buttons
                            // there until the chord is released.
                            if (!chord) chord = { pad: p, buttons: new Set([i]) };
                            else if (chord.pad === p) chord.buttons.add(i);
                            base[i] = true;
                            continue;
                        }
                        if (target.kind === 'hotkey-gamepad') {
                            onChange({ ...bindings, [target.key]: i });
                        } else if (target.kind === 'assign') {
                            onChange({
                                ...bindings,
                                gamepadAssignment: applyAssignmentSwap(
                                    bindings.gamepadAssignment ?? {}, target.player, p,
                                ),
                            });
                        }
                        setListening(null);
                        return;
                    }
                    if (!pressed && base[i]) base[i] = false;
                }
            }

            // Commit the chord once every button in it has been released.
            if (target.kind === 'gamepad' && chord) {
                const pad = pads[chord.pad];
                const stillHeld = !!pad && Array.from(chord.buttons).some(i => {
                    const btn = pad.buttons[i];
                    return !!btn && (btn.pressed || btn.value > 0.5);
                });
                if (!stillHeld) {
                    const inner = { ...(bindings.gamepadMap?.[target.player] ?? {}) };
                    inner[target.retroId] = Array.from(chord.buttons).sort((a, b) => a - b);
                    onChange({
                        ...bindings,
                        gamepadMap: { ...(bindings.gamepadMap ?? {}), [target.player]: inner },
                    });
                    setListening(null);
                    return;
                }
            }

            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [listening, bindings, onChange]);

    const handleClearPad = useCallback((retroId: number, player: number) => {
        const nextKeyMap = { ...bindings.keyMap };
        for (const [c, bind] of Object.entries(nextKeyMap)) {
            if (bind.player === player && bind.button === retroId) delete nextKeyMap[c];
        }
        onChange({ ...bindings, keyMap: nextKeyMap });
    }, [bindings, onChange]);

    const handleClearGamepad = useCallback((retroId: number, player: number) => {
        const inner = { ...(bindings.gamepadMap?.[player] ?? {}) };
        delete inner[retroId];
        onChange({
            ...bindings,
            gamepadMap: { ...(bindings.gamepadMap ?? {}), [player]: inner },
        });
    }, [bindings, onChange]);

    const handleClearHotkey = useCallback((key: HotkeyKey) => {
        const next = { ...bindings };
        delete next[key];
        onChange(next);
    }, [bindings, onChange]);

    const handleClearHotkeyGamepad = useCallback((key: HotkeyGamepadKey) => {
        onChange({ ...bindings, [key]: -1 });
    }, [bindings, onChange]);

    const assignListening = listening?.kind === 'assign' && listening.player === selectedPlayer;

    const portForPlayer = controllerPorts?.find(p => p.port === selectedPlayer);
    // Mirror the runtime's current device locally so the chip label updates
    // immediately on click — the runtime stores the choice but doesn't push
    // back into React state.
    const [deviceOverride, setDeviceOverride] = useState<Record<number, number>>({});
    useEffect(() => { setDeviceOverride({}); }, [core]);
    const currentDeviceId = portForPlayer
        ? deviceOverride[portForPlayer.port] ?? portForPlayer.currentDevice
        : null;
    const currentDevice = portForPlayer?.devices.find(d => d.id === currentDeviceId);
    const cycleDevice = useCallback((step: 1 | -1) => {
        if (!portForPlayer || !onControllerDeviceChange) return;
        const { devices, port } = portForPlayer;
        if (devices.length < 2) return;
        const curId = deviceOverride[port] ?? portForPlayer.currentDevice;
        const idx = devices.findIndex(d => d.id === curId);
        const nextIdx = ((idx < 0 ? 0 : idx) + step + devices.length) % devices.length;
        const nextId = devices[nextIdx].id;
        onControllerDeviceChange(port, nextId);
        setDeviceOverride(prev => ({ ...prev, [port]: nextId }));
    }, [portForPlayer, onControllerDeviceChange, deviceOverride]);

    return (
        <div className="flex flex-col gap-6 min-w-0">
            {maxPlayers > 1 && (
                <div className="flex items-center gap-2">
                    {Array.from({ length: maxPlayers }, (_, p) => (
                        <button
                            key={p}
                            onClick={() => setSelectedPlayer(p)}
                            aria-pressed={selectedPlayer === p}
                            className="px-4 py-1 rounded-xl h-9 text-sm font-medium flex-1 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                            style={{
                                backgroundColor: selectedPlayer === p ? colors.highlight : colors.midDark,
                                color: selectedPlayer === p ? colors.darkBg : colors.softLight,
                            }}
                        >
                            Player {p + 1}
                        </button>
                    ))}
                </div>
            )}

            <div>
                <SectionHeader title="Controller" colors={colors} />
                <div className="flex flex-col gap-2.5">
                    <BindingRow label="Active Controller" active={assignListening} colors={colors}>
                        <BindingChip
                            label={
                                assignListening
                                    ? 'Press button (Esc to reset)'
                                    : gamepadAssignmentLabel(bindings.gamepadAssignment, selectedPlayer, gamepads)
                            }
                            active={assignListening}
                            colors={colors}
                            onClick={() => setListening({ kind: 'assign', player: selectedPlayer })}
                            onContextMenu={e => { e.preventDefault(); handleClearAssignment(selectedPlayer); }}
                        />
                    </BindingRow>
                    {portForPlayer && portForPlayer.devices.length > 1 && (
                        <BindingRow label="Controller Type" active={false} colors={colors}>
                            <BindingChip
                                label={currentDevice?.name ?? 'Standard'}
                                active={false}
                                colors={colors}
                                onClick={() => cycleDevice(1)}
                                onContextMenu={e => { e.preventDefault(); cycleDevice(-1); }}
                            />
                        </BindingRow>
                    )}
                </div>
            </div>

            {groups.map(([groupName, items]) => (
                <div key={groupName}>
                    <SectionHeader title={groupName} colors={colors} />
                    <div className="flex flex-col gap-2.5">
                        {items.map((item, idx) => {
                            const code  = findKeyForButton(bindings.keyMap, item.id, selectedPlayer);
                            const physBtns = bindings.gamepadMap?.[selectedPlayer]?.[item.id] ?? [];
                            const kbListening = listening?.kind === 'pad'
                                && listening.retroId === item.id
                                && listening.player === selectedPlayer;
                            const gpListening = listening?.kind === 'gamepad'
                                && listening.retroId === item.id
                                && listening.player === selectedPlayer;
                            return (
                                <BindingRow
                                    key={item.id}
                                    label={item.label}
                                    active={kbListening || gpListening}
                                    colors={colors}
                                    idx={idx}
                                >
                                    <BindingChip
                                        label={kbListening ? 'Press key…' : (code ? formatKeyCode(code) : 'Unbound')}
                                        active={kbListening}
                                        colors={colors}
                                        onClick={() => setListening({ kind: 'pad', retroId: item.id, player: selectedPlayer })}
                                        onContextMenu={e => { e.preventDefault(); handleClearPad(item.id, selectedPlayer); }}
                                    />
                                    <span style={{ color: colors.highlight, opacity: 0.6 }}>/</span>
                                    <BindingChip
                                        label={
                                            gpListening
                                                ? 'Press button…'
                                                : (physBtns.length ? `Button ${physBtns.join(' + ')}` : 'Unbound')
                                        }
                                        active={gpListening}
                                        colors={colors}
                                        onClick={() => setListening({ kind: 'gamepad', retroId: item.id, player: selectedPlayer })}
                                        onContextMenu={e => { e.preventDefault(); handleClearGamepad(item.id, selectedPlayer); }}
                                    />
                                </BindingRow>
                            );
                        })}
                    </div>
                </div>
            ))}

            <div>
                <SectionHeader title="Hotkeys" colors={colors} />
                <div className="flex flex-col gap-2.5">
                    {SYSTEM_HOTKEYS.map((hk, idx) => {
                        const kbActive = listening?.kind === 'hotkey' && listening.key === hk.keyboard;
                        const gpActive = listening?.kind === 'hotkey-gamepad' && listening.key === hk.gamepad;
                        const gpBtn = bindings[hk.gamepad];
                        const gpLabel = gpActive
                            ? 'Press button…'
                            : (typeof gpBtn === 'number' && gpBtn >= 0 ? `Button ${gpBtn}` : 'Unbound');
                        const kbLabel = kbActive
                            ? 'Press key…'
                            : (bindings[hk.keyboard] ? formatKeyCode(bindings[hk.keyboard]!) : 'Unbound');
                        return (
                            <BindingRow
                                key={hk.keyboard}
                                label={hk.label}
                                active={kbActive || gpActive}
                                colors={colors}
                                idx={idx}
                            >
                                <BindingChip
                                    label={kbLabel}
                                    active={kbActive}
                                    colors={colors}
                                    onClick={() => setListening({ kind: 'hotkey', key: hk.keyboard })}
                                    onContextMenu={e => { e.preventDefault(); handleClearHotkey(hk.keyboard); }}
                                />
                                <span style={{ color: colors.highlight, opacity: 0.6 }}>/</span>
                                <BindingChip
                                    label={gpLabel}
                                    active={gpActive}
                                    colors={colors}
                                    onClick={() => setListening({ kind: 'hotkey-gamepad', key: hk.gamepad })}
                                    onContextMenu={e => { e.preventDefault(); handleClearHotkeyGamepad(hk.gamepad); }}
                                />
                            </BindingRow>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});

ControlsPanel.displayName = 'ControlsPanel';
