import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';

import { colors, siteConfig } from '../config/siteConfig';

type MoreStackParamList = {
  MoreMenu: undefined;
  About: undefined;
  Resources: undefined;
};

const menuItems = [
  {
    id: 'about',
    icon: 'information-circle-outline',
    label: 'About',
    description: 'Learn about the Wyoming Youth Resource Map',
    screen: 'About' as const,
  },
  {
    id: 'resources',
    icon: 'link-outline',
    label: 'More Resources',
    description: 'Additional helpful links and resources',
    screen: 'Resources' as const,
  },
  {
    id: 'feedback',
    icon: 'chatbubble-outline',
    label: 'Give Feedback',
    description: 'Report issues or share your thoughts',
    url: siteConfig.forms.feedback,
  },
  {
    id: 'provider',
    icon: 'add-circle-outline',
    label: 'Provider Submission Form',
    description: 'Are you a provider that wants your organization or resource listed?',
    url: siteConfig.forms.provider,
  },
];

export default function MoreMenuScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<MoreStackParamList>>();

  const handlePress = useCallback(
    (item: (typeof menuItems)[number]) => {
      if (item.screen) {
        navigation.navigate(item.screen);
      } else if (item.url) {
        WebBrowser.openBrowserAsync(item.url);
      }
    },
    [navigation],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>More</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            activeOpacity={0.6}
            onPress={() => handlePress(item)}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={item.icon as any} size={24} color={colors.navy} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuDesc}>{item.description}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.lightGray}
            />
          </TouchableOpacity>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerOrg}>{siteConfig.organizationName}</Text>
          <Text style={styles.footerText}>{siteConfig.disclaimer}</Text>
          <Text style={styles.footerVersion}>v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.darkGray,
  },
  list: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuText: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.darkGray,
  },
  menuDesc: {
    fontSize: 13,
    color: colors.mediumGray,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  footerOrg: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: colors.mediumGray,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerVersion: {
    fontSize: 12,
    color: colors.lightGray,
    marginTop: 12,
  },
});
