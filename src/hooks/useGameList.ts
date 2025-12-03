import { useMemo } from 'react';
import { Game } from '@/types';
import { getSystemCategory } from '@/lib/constants';

function compareGames(a: Game, b: Game, sortBy: 'title' | 'system', sortOrder: 'asc' | 'desc') {
    let cmp = 0;
    if (sortBy === 'title') {
        cmp = a.title.localeCompare(b.title);
    } else {
        cmp = getSystemCategory(a.core).localeCompare(getSystemCategory(b.core)) ||
            a.genre.localeCompare(b.genre) ||
            a.title.localeCompare(b.title);
    }
    return sortOrder === 'asc' ? cmp : -cmp;
}

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
            return compareGames(a, b, sortBy, sortOrder);
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