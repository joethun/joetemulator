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
    // merge and filter games
    const sortedGames = useMemo(() => {
        const activeUploads = Object.values(uploads).filter(u => !games.some(g => g.id === u.id));
        let filtered = [...games, ...activeUploads];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(g =>
                g.title.toLowerCase().includes(q) ||
                g.genre.toLowerCase().includes(q) ||
                getSystemCategory(g.core).toLowerCase().includes(q)
            );
        }

        return filtered.sort((a, b) => {
            let cmp = sortBy === 'title'
                ? a.title.localeCompare(b.title)
                : getSystemCategory(a.core).localeCompare(getSystemCategory(b.core)) ||
                a.genre.localeCompare(b.genre) ||
                a.title.localeCompare(b.title);
            return sortOrder === 'asc' ? cmp : -cmp;
        });
    }, [games, uploads, sortBy, sortOrder, searchQuery]);

    // group by system if needed
    const groupedGames = useMemo(() => {
        if (sortBy !== 'system') return null;

        const groups = sortedGames.reduce((acc, g) => {
            const mfg = getSystemCategory(g.core);
            const cat = mfg === 'Other' ? g.genre : `${mfg} ${g.genre}`;
            (acc[cat] ||= []).push(g);
            return acc;
        }, {} as Record<string, Game[]>);

        return Object.keys(groups)
            .sort((a, b) => sortOrder === 'asc' ? a.localeCompare(b) : b.localeCompare(a))
            .reduce((res, cat) => { res[cat] = groups[cat]; return res; }, {} as Record<string, Game[]>);
    }, [sortedGames, sortBy, sortOrder]);

    return { sortedGames, groupedGames };
}