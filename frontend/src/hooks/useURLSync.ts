import { useState, useCallback, useEffect, useRef } from 'react';
import { getSearchParams, setSearchParams } from '../lib/url';

export function useURLSync() {
  const [query, setQueryState] = useState(() => getSearchParams().q);
  const [sort, setSortState] = useState<'asc' | 'desc' | null>(() => getSearchParams().sort as 'asc' | 'desc' | null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const setQuery = useCallback((value: string) => {
    setQueryState(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchParams({ q: value || null, sort });
    }, 300);
  }, [sort]);

  const setSort = useCallback((value: 'asc' | 'desc' | null) => {
    setSortState(value);
    setSearchParams({ q: query || null, sort: value });
  }, [query]);

  useEffect(() => {
    const onPopState = () => {
      const params = getSearchParams();
      setQueryState(params.q);
      setSortState(params.sort as 'asc' | 'desc' | null);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  return { query, sort, setQuery, setSort };
}
