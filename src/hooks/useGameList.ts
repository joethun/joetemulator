import { useMemo } from 'react';
import { Game } from '@/types';
import { getSystemCategory } from '@/lib/constants';

export function useGameList(
    games: Game[],
    uploads: Record<number, Game>,
    searchQuery: string,
    sortBy: 'title' | 'system',
    sortOrder: 'asc' | 'desc'
) {
    const sortedGames = useMemo(() => {
        const uploadIds = new Set(games.map(g => g.id));
        const all = [...games, ...Object.values(uploads).filter(u => !uploadIds.has(u.id))];
        const q = searchQuery.trim().toLowerCase();

        const filtered = q
            ? all.filter(g => g.title.toLowerCase().includes(q) || g.genre.toLowerCase().includes(q) || getSystemCategory(g.core).toLowerCase().includes(q))
            : all;

        const dir = sortOrder === 'asc' ? 1 : -1;
        return filtered.sort((a, b) => {
            if (sortBy === 'title') return dir * a.title.localeCompare(b.title);
            return dir * (
                getSystemCategory(a.core).localeCompare(getSystemCategory(b.core)) ||
                a.genre.localeCompare(b.genre) ||
                a.title.localeCompare(b.title)
            );
        });
    }, [games, uploads, sortBy, sortOrder, searchQuery]);

    const groupedGames = useMemo(() => {
        if (sortBy !== 'system') return null;

        const groups: Record<string, Game[]> = {};
        for (const g of sortedGames) {
            const mfg = getSystemCategory(g.core);
            const key = mfg === 'Other' ? g.genre : `${mfg} ${g.genre}`;
            (groups[key] ||= []).push(g);
        }

        return Object.keys(groups)
            .sort((a, b) => sortOrder === 'asc' ? a.localeCompare(b) : b.localeCompare(a))
            .reduce((r, k) => { r[k] = groups[k]; return r; }, {} as Record<string, Game[]>);
    }, [sortedGames, sortBy, sortOrder]);

    return { sortedGames, groupedGames };
}