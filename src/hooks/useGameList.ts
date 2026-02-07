import { useMemo } from 'react';
import { Game } from '@/types';
import { getSystemCategory } from '@/lib/constants';

type SortOption = 'title' | 'system';
type SortOrder = 'asc' | 'desc';

/**
 * filters, sorts, and groups games for display
 */
export function useGameList(
    games: Game[],
    uploads: Record<number, Game>,
    searchQuery: string,
    sortBy: SortOption,
    sortOrder: SortOrder
) {
    const sortedGames = useMemo(() => {
        // combine games with in-progress uploads
        const uploadIds = new Set(games.map(g => g.id));
        const allGames = [
            ...games,
            ...Object.values(uploads).filter(u => !uploadIds.has(u.id))
        ];

        // filter by search query
        const query = searchQuery.trim().toLowerCase();
        const filtered = query
            ? allGames.filter(g =>
                g.title.toLowerCase().includes(query) ||
                g.genre.toLowerCase().includes(query) ||
                getSystemCategory(g.core).toLowerCase().includes(query)
            )
            : allGames;

        // sort games
        const direction = sortOrder === 'asc' ? 1 : -1;

        return filtered.sort((a, b) => {
            if (sortBy === 'title') {
                return direction * a.title.localeCompare(b.title);
            }

            // sort by system: category, then genre, then title
            return direction * (
                getSystemCategory(a.core).localeCompare(getSystemCategory(b.core)) ||
                a.genre.localeCompare(b.genre) ||
                a.title.localeCompare(b.title)
            );
        });
    }, [games, uploads, sortBy, sortOrder, searchQuery]);

    // group games by system when sorted by system
    const groupedGames = useMemo(() => {
        if (sortBy !== 'system') return null;

        const groups: Record<string, Game[]> = {};

        for (const game of sortedGames) {
            const category = getSystemCategory(game.core);
            const key = category === 'Other' ? game.genre : `${category} ${game.genre}`;
            (groups[key] ??= []).push(game);
        }

        // sort group keys
        const sortedKeys = Object.keys(groups).sort((a, b) =>
            sortOrder === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
        );

        return sortedKeys.reduce((result, key) => {
            result[key] = groups[key];
            return result;
        }, {} as Record<string, Game[]>);
    }, [sortedGames, sortBy, sortOrder]);

    return { sortedGames, groupedGames };
}