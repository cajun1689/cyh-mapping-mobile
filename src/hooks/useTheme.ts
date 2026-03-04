import { useColorScheme, AccessibilityInfo } from 'react-native';
import { useState, useEffect, useMemo, createContext, useContext } from 'react';
import React from 'react';

const lightColors = {
  background: '#F5F6F8',
  surface: '#FFFFFF',
  surfaceSecondary: '#F0F4F8',
  text: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E8E8E8',
  navy: '#1B3A4B',
  gold: '#F2C94C',
  danger: '#E74C3C',
  success: '#27AE60',
  shadow: 'rgba(0,0,0,0.08)',
  mapOverlay: 'rgba(255,255,255,0.95)',
  chipBg: 'rgba(255,255,255,0.95)',
  sheetBg: '#FFFFFF',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E8E8E8',
};

const darkColors = {
  background: '#111111',
  surface: '#1C1C1E',
  surfaceSecondary: '#2C2C2E',
  text: '#F5F5F5',
  textSecondary: '#BBBBBB',
  textTertiary: '#888888',
  border: '#3A3A3C',
  navy: '#4A90D9',
  gold: '#F2C94C',
  danger: '#FF6B6B',
  success: '#4CD964',
  shadow: 'rgba(0,0,0,0.3)',
  mapOverlay: 'rgba(28,28,30,0.95)',
  chipBg: 'rgba(28,28,30,0.95)',
  sheetBg: '#1C1C1E',
  tabBar: '#1C1C1E',
  tabBarBorder: '#3A3A3C',
};

export type ThemeColors = typeof lightColors;

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  reducedMotion: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
  reducedMotion: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const themeColors = isDark ? darkColors : lightColors;

  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotion,
    );
    return () => sub.remove();
  }, []);

  const value = useMemo(
    () => ({ colors: themeColors, isDark, reducedMotion }),
    [themeColors, isDark, reducedMotion],
  );

  return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
