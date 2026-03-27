import { useMemo } from 'react';
import { Game } from '@/types';
import { getSystemCategory } from '@/lib/constants';

type SortOption = 'title' | 'system';
type SortOrder = 'asc' | 'desc';

export function useGameList(
    games: Game[],
    uploads: Record<number, Game>,
    searchQuery: string,
    sortBy: SortOption,
    sortOrder: SortOrder
) {
    const sortedGames = useMemo(() => {
        const gameIds = new Set(games.map(g => g.id));
        const allGames = [
            ...games,
            ...Object.values(uploads).filter(u => !gameIds.has(u.id))
        ];

        const query = searchQuery.trim().toLowerCase();
        const filtered = query
            ? allGames.filter(g =>
                g.title.toLowerCase().includes(query) ||
                g.genre.toLowerCase().includes(query) ||
                getSystemCategory(g.core).toLowerCase().includes(query)
            )
            : allGames;

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
        for (const game of sortedGames) {
            const cat = getSystemCategory(game.core);
            const key = cat === 'Other' ? game.genre : `${cat} ${game.genre}`;
            (groups[key] ??= []).push(game);
        }

        const sortedKeys = Object.keys(groups).sort((a, b) =>
            sortOrder === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
        );

        return Object.fromEntries(sortedKeys.map(k => [k, groups[k]]));
    }, [sortedGames, sortBy, sortOrder]);

    return { sortedGames, groupedGames };
}