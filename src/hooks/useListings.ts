import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Listing, Meta, FormattedListing } from '../types';
import { formatListings } from '../utils/filters';
import { API_BASE } from '../config/siteConfig';

const CACHE_KEY_LISTINGS = '@cyh_listings';
const CACHE_KEY_META = '@cyh_meta';
const CACHE_KEY_TS = '@cyh_cache_ts';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

interface UseListingsReturn {
  listings: FormattedListing[];
  rawListings: Listing[];
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useListings(): UseListingsReturn {
  const [rawListings, setRawListings] = useState<Listing[]>([]);
  const [listings, setListings] = useState<FormattedListing[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const loadCached = useCallback(async (): Promise<boolean> => {
    try {
      const [cachedListings, cachedMeta, cachedTs] = await Promise.all([
        AsyncStorage.getItem(CACHE_KEY_LISTINGS),
        AsyncStorage.getItem(CACHE_KEY_META),
        AsyncStorage.getItem(CACHE_KEY_TS),
      ]);
      if (cachedListings && cachedMeta && cachedTs) {
        const ts = parseInt(cachedTs, 10);
        const raw: Listing[] = JSON.parse(cachedListings);
        const metaData: Meta = JSON.parse(cachedMeta);
        if (isMounted.current) {
          setRawListings(raw);
          setListings(formatListings(raw));
          setMeta(metaData);
        }
        return Date.now() - ts < CACHE_TTL;
      }
    } catch {
      // cache miss or corrupt — fetch fresh
    }
    return false;
  }, []);

  const fetchFresh = useCallback(async () => {
    try {
      const [listingsRes, metaRes] = await Promise.all([
        fetch(`${API_BASE}/api/listings`),
        fetch(`${API_BASE}/api/meta`),
      ]);
      if (!listingsRes.ok || !metaRes.ok) {
        throw new Error('Failed to fetch data from server');
      }
      const raw: Listing[] = await listingsRes.json();
      const metaData: Meta = await metaRes.json();

      if (isMounted.current) {
        setRawListings(raw);
        setListings(formatListings(raw));
        setMeta(metaData);
        setError(null);
      }

      await Promise.all([
        AsyncStorage.setItem(CACHE_KEY_LISTINGS, JSON.stringify(raw)),
        AsyncStorage.setItem(CACHE_KEY_META, JSON.stringify(metaData)),
        AsyncStorage.setItem(CACHE_KEY_TS, Date.now().toString()),
      ]);
    } catch (e: any) {
      if (isMounted.current) {
        setError(e.message || 'Failed to load listings');
      }
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    await fetchFresh();
    if (isMounted.current) setLoading(false);
  }, [fetchFresh]);

  useEffect(() => {
    isMounted.current = true;
    (async () => {
      const cacheValid = await loadCached();
      if (isMounted.current) setLoading(!cacheValid && listings.length === 0);
      if (!cacheValid) await fetchFresh();
      if (isMounted.current) setLoading(false);
    })();
    return () => {
      isMounted.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { listings, rawListings, meta, loading, error, refresh };
}
