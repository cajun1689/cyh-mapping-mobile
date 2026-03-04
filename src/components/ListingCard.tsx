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
      style={[styles.card, isSelected && { borderLeftColor: accentColor, borderLeftWidth: 3 }]}
    >
      <View style={styles.topRow}>
        <View style={[styles.categoryDot, { backgroundColor: accentColor }]} />
        <Text style={styles.categoryLabel} numberOfLines={1}>
          {parentCategory || 'Resource'}
        </Text>
        <View style={styles.spacer} />
        {distance !== undefined && (
          <Text style={styles.distanceText}>{distance.toFixed(1)} mi</Text>
        )}
        <Pressable onPress={onToggleSave} hitSlop={12} style={styles.saveBtn}>
          <Ionicons
            name={isSaved ? 'heart' : 'heart-outline'}
            size={20}
            color={isSaved ? colors.danger : colors.lightGray}
          />
        </Pressable>
      </View>

      <Text style={styles.name} numberOfLines={2}>
        {listing.full_name}
      </Text>

      {(listing.full_address || listing.city) ? (
        <Text style={styles.subtitle} numberOfLines={1}>
          {listing.full_address || listing.city}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.mediumGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  spacer: {
    flex: 1,
  },
  distanceText: {
    fontSize: 12,
    color: colors.mediumGray,
    marginRight: 8,
    fontWeight: '500',
  },
  saveBtn: {
    padding: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.darkGray,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 13,
    color: colors.mediumGray,
    marginTop: 2,
    lineHeight: 17,
  },
});
