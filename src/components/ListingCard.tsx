import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormattedListing } from '../types';
import { colors, categoryColors, defaultCategoryColor } from '../config/siteConfig';

interface Props {
  listing: FormattedListing;
  isSaved: boolean;
  isSelected?: boolean;
  onPress: () => void;
  onToggleSave: () => void;
  distance?: number;
}

export default function ListingCard({
  listing,
  isSaved,
  isSelected,
  onPress,
  onToggleSave,
  distance,
}: Props) {
  const parentCategory = listing.category?.split(': ')[0] || '';
  const accentColor = categoryColors[parentCategory] || defaultCategoryColor;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        { borderLeftColor: accentColor },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.categoryBadge}>
          <Text style={[styles.categoryText, { color: accentColor }]}>
            {parentCategory}
          </Text>
        </View>
        <Pressable onPress={onToggleSave} hitSlop={12} style={styles.saveBtn}>
          <Ionicons
            name={isSaved ? 'heart' : 'heart-outline'}
            size={22}
            color={isSaved ? colors.danger : colors.mediumGray}
          />
        </Pressable>
      </View>

      <Text style={styles.name} numberOfLines={2}>
        {listing.full_name}
      </Text>

      {listing.full_address ? (
        <View style={styles.row}>
          <Ionicons name="location-outline" size={14} color={colors.mediumGray} />
          <Text style={styles.detail} numberOfLines={1}>
            {listing.full_address}
          </Text>
        </View>
      ) : null}

      {listing.phone_1 ? (
        <View style={styles.row}>
          <Ionicons name="call-outline" size={14} color={colors.mediumGray} />
          <Text style={styles.detail}>{listing.phone_1}</Text>
        </View>
      ) : null}

      {distance !== undefined ? (
        <View style={styles.row}>
          <Ionicons name="navigate-outline" size={14} color={colors.mediumGray} />
          <Text style={styles.detail}>{distance.toFixed(1)} mi away</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: defaultCategoryColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardSelected: {
    borderLeftWidth: 4,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: '#F0F4F8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  saveBtn: {
    padding: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.darkGray,
    marginBottom: 6,
    lineHeight: 21,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  detail: {
    fontSize: 13,
    color: colors.mediumGray,
    flex: 1,
  },
});
