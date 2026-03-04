import { useState, useMemo, useCallback } from 'react';
import { Filters, FormattedListing } from '../types';
import { filterListings } from '../utils/filters';

const DEFAULT_FILTERS: Filters = {
  search: '',
  city: '',
  tag: '',
  costKeyword: '',
  age: '',
  ageGroup: 'all',
  hideFaithBased: false,
  category: '',
};

interface UseFiltersReturn {
  filters: Filters;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  clearFilters: () => void;
  activeCount: number;
  filtered: FormattedListing[];
}

export function useFilters(listings: FormattedListing[]): UseFiltersReturn {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const setFilter = useCallback(
    <K extends keyof Filters>(key: K, value: Filters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const activeCount = useMemo(() => {
    let count = 0;
    if (filters.city) count++;
    if (filters.tag) count++;
    if (filters.costKeyword) count++;
    if (filters.age) count++;
    if (filters.ageGroup !== 'all') count++;
    if (filters.hideFaithBased) count++;
    if (filters.category) count++;
    return count;
  }, [filters]);

  const filtered = useMemo(
    () => filterListings(listings, filters),
    [listings, filters],
  );

  return { filters, setFilter, clearFilters, activeCount, filtered };
}
