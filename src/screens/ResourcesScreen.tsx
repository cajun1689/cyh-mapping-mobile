import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useListings } from '../hooks/useListings';
import { colors, siteConfig } from '../config/siteConfig';
import { Resource } from '../types';

export default function ResourcesScreen() {
  const { meta } = useListings();

  const allResources: Resource[] = [
    ...siteConfig.moreResources,
    ...(meta?.resources || []),
  ];

  const renderItem = ({ item }: { item: Resource }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => Linking.openURL(item.link)}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="open-outline" size={20} color={colors.navy} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDesc} numberOfLines={3}>
          {item.description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.lightGray} />
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={allResources}
      keyExtractor={(item, i) => `${item.name}-${i}`}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No additional resources available</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
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
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkGray,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: colors.mediumGray,
    lineHeight: 18,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 15,
    color: colors.mediumGray,
  },
});
