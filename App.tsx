import React from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SavedProvider } from './src/hooks/useSaved';
import { ThemeProvider } from './src/hooks/useTheme';
import AppNavigator from './src/navigation';

export default function App() {
  const scheme = useColorScheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <SavedProvider>
            <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
            <AppNavigator />
          </SavedProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
