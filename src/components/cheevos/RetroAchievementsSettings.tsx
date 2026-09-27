'use client';

import { memo, useEffect, useState } from 'react';
import { Skull, Trophy, User } from 'lucide-react';
import type { GradientStyle, ThemeColors } from '@/types';
import { ChipButton, SettingsCard, SettingItem, SettingRow } from '@/components/SettingsCard';
import { RetroAchievementsLoginModal } from '@/components/cheevos/RetroAchievementsLoginModal';
import { useDelayedUnmount } from '@/hooks/useDelayedUnmount';
import { DANGER_FG } from '@/lib/constants';
import { logoutOfRetroAchievements, resumeLogin } from '@/lib/cheevos/session';
import { loadCredentials, useCheevosSelector } from '@/lib/cheevos/store';

interface Props {
    colors: ThemeColors;
    gradient: GradientStyle;
    enabled: boolean;
    onToggleEnabled: () => void;
    hardcore: boolean;
    onToggleHardcore: () => void;
    /** Fade-in delay, continuing the settings list's stagger. */
    animationDelay: string;
}

const CHIP_CLASS = 'whitespace-nowrap shrink-0';

/** RetroAchievements card: account row (login opens a modal) + Hardcore Mode. */
export const RetroAchievementsSettings = memo(({
    colors, gradient, enabled, onToggleEnabled, hardcore, onToggleHardcore, animationDelay,
}: Props) => {
    const user = useCheevosSelector(s => s.user);
    // Username of a stored login we haven't verified yet this page load.
    const [storedUsername, setStoredUsername] = useState(() => loadCredentials()?.username ?? null);
    const [error, setError] = useState<string | null>(null);
    const [loginOpen, setLoginOpen] = useState(false);
    const login = useDelayedUnmount(loginOpen);

    // Refresh the stored login (display name) once the card is shown.
    useEffect(() => {
        const creds = loadCredentials();
        if (!enabled || !creds) return;
        let cancelled = false;
        resumeLogin(creds)
            .then(u => {
                if (cancelled || u) return;
                setStoredUsername(null);
                setError('Your login expired. Please log in again.');
            })
            // Network errors: keep the stored login and show it unverified.
            .catch(() => {});
        return () => { cancelled = true; };
    }, [enabled]);

    const handleLogout = () => {
        logoutOfRetroAchievements();
        setStoredUsername(null);
        setError(null);
    };

    const handleLoggedIn = (username: string) => {
        setStoredUsername(username);
        setError(null);
        setLoginOpen(false);
    };

    const loggedInName = user?.displayName || storedUsername;

    return (
        <>
            <SettingsCard
                colors={colors} gradient={gradient} icon={Trophy}
                title="RetroAchievements"
                description="Earn achievements while you play with your RetroAchievements account."
                animationDelay={animationDelay}
                checked={enabled} onToggle={onToggleEnabled}
                isExpanded={enabled}
            >
                <div className="space-y-4">
                    <SettingRow colors={colors} icon={User} label={loggedInName ?? 'Not Logged In'}>
                        {loggedInName
                            ? <ChipButton colors={colors} className={CHIP_CLASS} onClick={handleLogout}>Log Out</ChipButton>
                            : <ChipButton colors={colors} className={CHIP_CLASS} onClick={() => setLoginOpen(true)} active>Log In</ChipButton>}
                    </SettingRow>
                    {error && <p className="text-sm font-medium" style={{ color: DANGER_FG }}>{error}</p>}
                    <SettingItem
                        colors={colors} gradient={gradient} icon={Skull} label="Hardcore Mode"
                        checked={hardcore} onToggle={onToggleHardcore}
                    />
                </div>
            </SettingsCard>

            {login.shouldRender && (
                <RetroAchievementsLoginModal
                    isClosing={login.isClosing}
                    colors={colors}
                    gradient={gradient}
                    onClose={() => setLoginOpen(false)}
                    onLoggedIn={handleLoggedIn}
                />
            )}
        </>
    );
});

RetroAchievementsSettings.displayName = 'RetroAchievementsSettings';
