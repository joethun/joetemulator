'use client';

import { useState } from 'react';
import { KeyRound, User } from 'lucide-react';
import type { GradientStyle, ThemeColors } from '@/types';
import { Modal, ModalButton, ModalFooter, ModalHeader } from '@/components/Modal';
import { TextInput } from '@/components/TextInput';
import { SectionHeader } from '@/components/emulator/shared';
import { DANGER_FG } from '@/lib/constants';
import { CheevosError } from '@/lib/cheevos/client';
import { loginToRetroAchievements } from '@/lib/cheevos/session';
import { RC_INVALID_CREDENTIALS } from '@/lib/cheevos/types';

interface Props {
    isClosing: boolean;
    colors: ThemeColors;
    gradient: GradientStyle;
    onClose: () => void;
    /** Called with the account name once the login succeeded and was saved. */
    onLoggedIn: (username: string) => void;
}

const SIGN_UP_URL = 'https://retroachievements.org/createaccount';

/** RetroAchievements login, laid out like the site's other modals. */
export function RetroAchievementsLoginModal({ isClosing, colors, gradient, onClose, onLoggedIn }: Props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        if (busy) return;
        if (!username.trim() || !password) {
            setError('Enter your username and password.');
            return;
        }
        setBusy(true);
        setError(null);
        try {
            // Only the returned token is kept; the password never leaves this form's state.
            const u = await loginToRetroAchievements(username.trim(), password);
            setPassword('');
            onLoggedIn(u.username);
        } catch (e) {
            setError(e instanceof CheevosError && e.code === RC_INVALID_CREDENTIALS
                ? 'Incorrect username or password.'
                : e instanceof Error ? e.message : 'Login failed.');
        } finally {
            setBusy(false);
        }
    };

    const submitOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') { e.preventDefault(); void handleLogin(); }
    };

    return (
        <Modal isClosing={isClosing} colors={colors} onClose={onClose} labelledBy="ra-login-title" fit>
            <div className="flex flex-col flex-1 min-h-0">
                <ModalHeader title="Log In" subtitle="Log in with your RetroAchievements account." colors={colors} id="ra-login-title" />

                <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-6" style={{ padding: '2px', margin: '-2px' }}>
                    <div>
                        <SectionHeader title="Account" colors={colors} />
                        <div className="flex flex-col gap-2.5">
                            <TextInput
                                colors={colors} value={username} onChange={setUsername} onKeyDown={submitOnEnter}
                                placeholder="Username" ariaLabel="RetroAchievements username" autoComplete="username"
                                leftIcon={<User className="w-4 h-4" />}
                            />
                            <TextInput
                                colors={colors} value={password} onChange={setPassword} onKeyDown={submitOnEnter} type="password"
                                placeholder="Password" ariaLabel="RetroAchievements password" autoComplete="current-password"
                                leftIcon={<KeyRound className="w-4 h-4" />}
                            />
                            {error && <p className="text-sm font-medium" style={{ color: DANGER_FG }}>{error}</p>}
                        </div>
                    </div>
                </div>

                <ModalFooter colors={colors}>
                    <ModalButton onClick={() => window.open(SIGN_UP_URL, '_blank', 'noopener,noreferrer')} disabled={isClosing} colors={colors}>
                        Create Account
                    </ModalButton>
                    <ModalButton onClick={() => void handleLogin()} disabled={isClosing || busy} colors={colors} variant="gradient" gradient={gradient}>
                        {busy ? 'Logging In…' : 'Log In'}
                    </ModalButton>
                </ModalFooter>
            </div>
        </Modal>
    );
}
