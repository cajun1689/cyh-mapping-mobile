import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SavedProvider } from './src/hooks/useSaved';
import AppNavigator from './src/navigation';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SavedProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </SavedProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
