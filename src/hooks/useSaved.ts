import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_KEY = '@cyh_saved_guids';

interface SavedContextValue {
  savedGuids: number[];
  toggleSave: (guid: number) => void;
  isSaved: (guid: number) => boolean;
  clearAll: () => void;
}

const SavedContext = createContext<SavedContextValue>({
  savedGuids: [],
  toggleSave: () => {},
  isSaved: () => false,
  clearAll: () => {},
});

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [savedGuids, setSavedGuids] = useState<number[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(SAVED_KEY).then((raw) => {
      if (raw) {
        try {
          setSavedGuids(JSON.parse(raw));
        } catch {}
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

  const value = { savedGuids, toggleSave, isSaved, clearAll };

  return React.createElement(SavedContext.Provider, { value }, children);
}

export function useSaved(): SavedContextValue {
  return useContext(SavedContext);
}
