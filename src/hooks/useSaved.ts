import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_KEY = '@cyh_saved_guids';

interface UseSavedReturn {
  savedGuids: number[];
  toggleSave: (guid: number) => void;
  isSaved: (guid: number) => boolean;
  clearAll: () => void;
}

export function useSaved(): UseSavedReturn {
  const [savedGuids, setSavedGuids] = useState<number[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(SAVED_KEY).then((raw) => {
      if (raw) {
        try {
          setSavedGuids(JSON.parse(raw));
        } catch {
          // corrupt data, start fresh
        }
      }
    });
  }, []);

  const persist = useCallback((guids: number[]) => {
    AsyncStorage.setItem(SAVED_KEY, JSON.stringify(guids));
  }, []);

  const toggleSave = useCallback(
    (guid: number) => {
      setSavedGuids((prev) => {
        const next = prev.includes(guid)
          ? prev.filter((g) => g !== guid)
          : [...prev, guid];
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const isSaved = useCallback(
    (guid: number) => savedGuids.includes(guid),
    [savedGuids],
  );

  const clearAll = useCallback(() => {
    setSavedGuids([]);
    AsyncStorage.removeItem(SAVED_KEY);
  }, []);

  return { savedGuids, toggleSave, isSaved, clearAll };
}
