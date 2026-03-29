export const delay = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

export const ANIM_DELAY = 350;
export const PROGRESS_THROTTLE_MS = 100;

export const STORAGE_KEYS = {
    GAMES: 'games',
    GAMES_MIGRATED: 'games_migrated_v1',
} as const;

export const stripExt = (name: string) => name.replace(/\.[^/.]+$/, '');

export function fuzzyMatchTitle(inputStr: string, titles: string[]): string | null {
    const lowerInput = inputStr.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!lowerInput || lowerInput.length < 2) return null;

    let bestMatch = null;
    let bestScore = 0;

    for (const title of titles) {
        const baseTitle = title.split('(')[0].trim().toLowerCase();
        const lowerTitle = baseTitle.replace(/[^a-z0-9]/g, '');

        let score = 0;
        if (lowerTitle === lowerInput) {
            score = 1.0;
        } else {
            if (lowerTitle.includes(lowerInput)) {
                score = lowerInput.length / lowerTitle.length;
                if (score > 0.8) score = 0.8;
            }

            const spacedInput = inputStr.replace(/([a-z])([A-Z0-9])/g, '$1 $2').toLowerCase();
            const inTokens = spacedInput.split(/[^a-z0-9]+/).filter(t => t);
            const tTokens = baseTitle.split(/[^a-z0-9]+/).filter(t => t);

            if (inTokens.length === 1 && inTokens[0].length >= 3) {
                const singleTok = inTokens[0];
                if (tTokens.includes(singleTok)) score = Math.max(score, 0.75);
                else if (tTokens.some(t => t.startsWith(singleTok))) score = Math.max(score, 0.7);
            }

            const acronym = baseTitle.replace(/'s\b/g, '').split(/[^a-z0-9]+/).filter(w => w.length > 0).map(w => w[0]).join('');
            if (acronym === lowerInput) score = Math.max(score, 0.95);
            else if (acronym.length > 2 && acronym.startsWith(lowerInput)) score = Math.max(score, 0.7);

            if (inTokens.length > 1) {
                let matched = 0;
                let currentTitleIdx = 0;
                for (let iTok of inTokens) {
                    let foundTok = false;
                    for (let tIdx = currentTitleIdx; tIdx < tTokens.length; tIdx++) {
                        const tTok = tTokens[tIdx];
                        if (tTok === iTok || tTok.startsWith(iTok)) {
                            currentTitleIdx = tIdx + 1;
                            foundTok = true;
                            break;
                        }
                    }
                    if (foundTok) {
                        matched++;
                    } else {
                        const remTitleTokens = tTokens.slice(currentTitleIdx);
                        if (remTitleTokens.length > 0) {
                            const remAcronym = remTitleTokens.map(t => t[0]).join('');
                            if (remAcronym === iTok || remAcronym.startsWith(iTok)) {
                                matched++;
                                currentTitleIdx += iTok.length;
                            }
                        }
                    }
                }
                if (matched === inTokens.length) score = Math.max(score, 0.85);
            }
        }

        if (score > 0) {
            let regionBonus = 0;
            if (title.includes('(USA)')) regionBonus = 0.005;
            else if (title.includes('(World)')) regionBonus = 0.004;
            else if (title.includes('(En')) regionBonus = 0.003;
            else if (title.includes('(Europe)')) regionBonus = 0.002;
            else if (title.includes('(Japan)')) regionBonus = 0.001;

            score += regionBonus;
            if (score > bestScore) {
                bestScore = score;
                bestMatch = title;
            }
        }
    }
    return bestScore >= 0.7 ? bestMatch : null;
}
