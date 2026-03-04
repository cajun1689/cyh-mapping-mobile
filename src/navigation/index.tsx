import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import MapScreen from '../screens/MapScreen';
import DetailScreen from '../screens/DetailScreen';
import SavedScreen from '../screens/SavedScreen';
import MoreMenuScreen from '../screens/MoreScreen';
import AboutScreen from '../screens/AboutScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import { colors } from '../config/siteConfig';

const MapStack = createNativeStackNavigator();
const SavedStack = createNativeStackNavigator();
const MoreStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MapStackScreen() {
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
          headerStyle: { backgroundColor: colors.white },
          headerTintColor: colors.navy,
          headerTitleStyle: { fontWeight: '600', fontSize: 16 },
          headerBackTitle: 'Map',
        })}
      />
    </MapStack.Navigator>
  );
}

function SavedStackScreen() {
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
          headerStyle: { backgroundColor: colors.white },
          headerTintColor: colors.navy,
          headerTitleStyle: { fontWeight: '600', fontSize: 16 },
          headerBackTitle: 'Saved',
        })}
      />
    </SavedStack.Navigator>
  );
}

function MoreStackScreen() {
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
          headerStyle: { backgroundColor: colors.white },
          headerTintColor: colors.navy,
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      <MoreStack.Screen
        name="Resources"
        component={ResourcesScreen}
        options={{
          title: 'More Resources',
          headerStyle: { backgroundColor: colors.white },
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
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            const icons = TAB_ICONS[route.name];
            const iconName = focused ? icons.focused : icons.unfocused;
            return <Ionicons name={iconName as any} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.navy,
          tabBarInactiveTintColor: colors.mediumGray,
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopColor: colors.lightGray,
            borderTopWidth: 1,
            paddingBottom: 4,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        })}
      >
        <Tab.Screen name="Map" component={MapStackScreen} />
        <Tab.Screen name="Saved" component={SavedStackScreen} />
        <Tab.Screen name="More" component={MoreStackScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
