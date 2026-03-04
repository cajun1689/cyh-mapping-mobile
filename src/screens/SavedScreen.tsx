import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { FormattedListing } from '../types';
import { useListings } from '../hooks/useListings';
import { useSaved } from '../hooks/useSaved';
import { useTheme } from '../hooks/useTheme';
import ListingCard from '../components/ListingCard';

type SavedStackParamList = {
  SavedMain: undefined;
  Detail: { listing: FormattedListing };
};

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<SavedStackParamList>>();
  const { listings } = useListings();
  const { savedGuids, toggleSave, isSaved, clearAll } = useSaved();
  const { colors } = useTheme();

  const savedListings = useMemo(
    () => listings.filter((l) => savedGuids.includes(l.guid)),
    [listings, savedGuids],
  );

  const renderItem = useCallback(
    ({ item }: { item: FormattedListing }) => (
      <ListingCard
        listing={item}
        isSaved={true}
        onPress={() => navigation.navigate('Detail', { listing: item })}
        onToggleSave={() => toggleSave(item.guid)}
      />
    ),
    [navigation, toggleSave],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
          Saved Resources
        </Text>
        {savedListings.length > 0 && (
          <TouchableOpacity onPress={clearAll} accessibilityRole="button" accessibilityLabel="Clear all saved resources">
            <Text style={[styles.clearBtn, { color: colors.danger }]}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={savedListings}
        keyExtractor={(item) => String(item.guid)}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.list,
          savedListings.length === 0 && styles.emptyContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty} accessibilityLabel="No saved resources yet. Tap the heart icon on any resource to save it here.">
            <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
              <Ionicons name="heart-outline" size={56} color={colors.border} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No saved resources yet</Text>
            <Text style={[styles.emptyBody, { color: colors.textTertiary }]}>
              Tap the heart icon on any resource to save it here for quick access.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  clearBtn: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    paddingTop: 12,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
