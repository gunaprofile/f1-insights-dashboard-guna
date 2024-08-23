import { useMemo } from 'react';
import { useFetch } from './useFetch';

export const useSeasons = () => {
    const { data: rawSeasons, loading: loadingSeasons, error: errorSeasons } = useFetch('http://localhost/api/seasons?limit=100&offset=8');
    
    const seasons = useMemo(() => {
        return rawSeasons.map((season) => ({ value: season, label: season }));
    }, [rawSeasons]);

    return { seasons, loadingSeasons, errorSeasons };
};
