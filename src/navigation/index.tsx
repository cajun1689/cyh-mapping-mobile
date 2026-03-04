import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import MapScreen from '../screens/MapScreen';
import DetailScreen from '../screens/DetailScreen';
import SavedScreen from '../screens/SavedScreen';
import MoreMenuScreen from '../screens/MoreScreen';
import AboutScreen from '../screens/AboutScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import { useTheme } from '../hooks/useTheme';

const MapStack = createNativeStackNavigator();
const SavedStack = createNativeStackNavigator();
const MoreStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MapStackScreen() {
  const { colors } = useTheme();
  return (
    <MapStack.Navigator>
      <MapStack.Screen
        name="MapMain"
        component={MapScreen}
        options={{ headerShown: false }}
      />
      <MapStack.Screen
        name="Detail"
        component={DetailScreen}
        options={({ route }: any) => ({
          title: route.params?.listing?.full_name || 'Details',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.navy,
          headerTitleStyle: { fontWeight: '600', fontSize: 16 },
          headerBackTitle: 'Map',
        })}
      />
    </MapStack.Navigator>
  );
}

function SavedStackScreen() {
  const { colors } = useTheme();
  return (
    <SavedStack.Navigator>
      <SavedStack.Screen
        name="SavedMain"
        component={SavedScreen}
        options={{ headerShown: false }}
      />
      <SavedStack.Screen
        name="Detail"
        component={DetailScreen}
        options={({ route }: any) => ({
          title: route.params?.listing?.full_name || 'Details',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.navy,
          headerTitleStyle: { fontWeight: '600', fontSize: 16 },
          headerBackTitle: 'Saved',
        })}
      />
    </SavedStack.Navigator>
  );
}

function MoreStackScreen() {
  const { colors } = useTheme();
  return (
    <MoreStack.Navigator>
      <MoreStack.Screen
        name="MoreMenu"
        component={MoreMenuScreen}
        options={{ headerShown: false }}
      />
      <MoreStack.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: 'About',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.navy,
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      <MoreStack.Screen
        name="Resources"
        component={ResourcesScreen}
        options={{
          title: 'More Resources',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.navy,
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
    </MoreStack.Navigator>
  );
}

const TAB_ICONS: Record<string, { focused: string; unfocused: string }> = {
  Map: { focused: 'map', unfocused: 'map-outline' },
  Saved: { focused: 'heart', unfocused: 'heart-outline' },
  More: { focused: 'ellipsis-horizontal', unfocused: 'ellipsis-horizontal-outline' },
};

export default function AppNavigator() {
  const { colors, isDark } = useTheme();
  const navTheme = isDark
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: colors.background, card: colors.surface, text: colors.text, border: colors.border, primary: colors.navy } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.background, card: colors.surface, text: colors.text, border: colors.border, primary: colors.navy } };

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            const icons = TAB_ICONS[route.name];
            const iconName = focused ? icons.focused : icons.unfocused;
            return <Ionicons name={iconName as any} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.navy,
          tabBarInactiveTintColor: colors.textTertiary,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.tabBarBorder,
            borderTopWidth: 1,
            paddingBottom: 4,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          tabBarAccessibilityLabel: route.name,
        })}
      >
        <Tab.Screen
          name="Map"
          component={MapStackScreen}
          options={{ tabBarAccessibilityLabel: 'Map tab. Find resources on the map.' }}
        />
        <Tab.Screen
          name="Saved"
          component={SavedStackScreen}
          options={{ tabBarAccessibilityLabel: 'Saved tab. View your saved resources.' }}
        />
        <Tab.Screen
          name="More"
          component={MoreStackScreen}
          options={{ tabBarAccessibilityLabel: 'More tab. About, feedback, and settings.' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
