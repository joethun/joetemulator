import { useMemo } from 'react';
import { Game } from '@/types';
import { getSystemCategory } from '@/lib/constants';

export function useGameList(
    games: Game[],
    uploads: Record<number, Game>,
    searchQuery: string
) {
    return useMemo(() => {
        const ids = new Set(games.map(g => g.id));
        const all = [
            ...games,
            ...Object.values(uploads).filter(u => !ids.has(u.id)),
        ].map(g => ({ g, cat: getSystemCategory(g.core) }));

        const q = searchQuery.trim().toLowerCase();
        const filtered = q
            ? all.filter(({ g, cat }) =>
                g.title.toLowerCase().includes(q) ||
                g.genre.toLowerCase().includes(q) ||
                cat.toLowerCase().includes(q))
            : all;

        filtered.sort((a, b) =>
            a.cat.localeCompare(b.cat) ||
            a.g.genre.localeCompare(b.g.genre) ||
            a.g.title.localeCompare(b.g.title)
        );

        const groups: Record<string, Game[]> = {};
        for (const { g, cat } of filtered) {
            const key = cat === 'Other' ? g.genre : `${cat} ${g.genre}`;
            (groups[key] ??= []).push(g);
        }

        return { count: filtered.length, groupedGames: groups };
    }, [games, uploads, searchQuery]);
}
