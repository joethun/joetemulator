import { useMemo } from 'react';
import { Game } from '@/types';
import { getSystemCategory } from '@/lib/constants';

type SortOrder = 'asc' | 'desc';

export function useGameList(
    games: Game[],
    uploads: Record<number, Game>,
    searchQuery: string,
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

        return filtered
            .map(g => ({ g, cat: getSystemCategory(g.core) }))
            .sort((a, b) =>
                dir * (
                    a.cat.localeCompare(b.cat) ||
                    a.g.genre.localeCompare(b.g.genre) ||
                    a.g.title.localeCompare(b.g.title)
                )
            )
            .map(({ g }) => g);
    }, [games, uploads, sortOrder, searchQuery]);

    const groupedGames = useMemo(() => {
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
    }, [sortedGames, sortOrder]);

    return { sortedGames, groupedGames };
}