import React, { useMemo, useRef, useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
  ScrollView,
  Pressable,
  Modal,
} from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Filters, FormattedListing, Meta } from '../types';
import {
  getCityCount,
  getKeywordCount,
  getCostCount,
  getCategoryCount,
} from '../utils/filters';
import { colors, siteConfig } from '../config/siteConfig';

interface Props {
  visible: boolean;
  onClose: () => void;
  filters: Filters;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  clearFilters: () => void;
  meta: Meta | null;
  listings: FormattedListing[];
}

export default function FilterSheet({
  visible,
  onClose,
  filters,
  setFilter,
  clearFilters,
  meta,
  listings,
}: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const cities = useMemo(() => {
    if (meta?.listingCities) return meta.listingCities;
    return getCityCount(listings as any);
  }, [meta, listings]);

  const keywords = useMemo(() => {
    if (meta?.listingKeywords) return meta.listingKeywords;
    return getKeywordCount(listings as any);
  }, [meta, listings]);

  const costs = useMemo(() => getCostCount(listings as any), [listings]);

  const categories = useMemo(() => {
    if (meta?.listingCategories) return meta.listingCategories;
    return getCategoryCount(listings as any);
  }, [meta, listings]);

  const snapPoints = useMemo(() => ['70%', '90%'], []);

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onClose}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={{ backgroundColor: colors.lightGray }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Filters</Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearAll}>Clear All</Text>
          </TouchableOpacity>
        </View>

        <BottomSheetScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Location */}
          <SectionHeader icon="location" label="Location" />
          <ChipGroup
            items={Object.keys(cities).sort()}
            counts={cities}
            selected={filters.city}
            onSelect={(v) => setFilter('city', v === filters.city ? '' : v)}
          />

          {/* Service Type */}
          <SectionHeader icon="pricetag" label="Service Type" />
          <ChipGroup
            items={Object.keys(keywords).sort()}
            counts={keywords}
            selected={filters.tag}
            onSelect={(v) => setFilter('tag', v === filters.tag ? '' : v)}
          />

          {/* Cost */}
          <SectionHeader icon="cash" label="Cost" />
          <ChipGroup
            items={Object.keys(costs).sort()}
            counts={costs}
            selected={filters.costKeyword}
            onSelect={(v) =>
              setFilter('costKeyword', v === filters.costKeyword ? '' : v)
            }
          />

          {/* Age */}
          <SectionHeader icon="people" label="Age" />
          <View style={styles.ageRow}>
            <TextInput
              style={styles.ageInput}
              placeholder={`Age (${siteConfig.ageRange.min}–${siteConfig.ageRange.max})`}
              placeholderTextColor={colors.mediumGray}
              keyboardType="number-pad"
              value={filters.age}
              onChangeText={(t) => setFilter('age', t)}
              maxLength={2}
            />
          </View>

          {/* Age Group */}
          <SectionHeader icon="body" label="Age Group" />
          <View style={styles.segmentRow}>
            {(['all', 'Youth', 'Adult'] as const).map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.segment,
                  filters.ageGroup === g && styles.segmentActive,
                ]}
                onPress={() => setFilter('ageGroup', g)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    filters.ageGroup === g && styles.segmentTextActive,
                  ]}
                >
                  {g === 'all' ? 'All Ages' : g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Faith-Based */}
          <View style={styles.faithRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.faithLabel}>
                Hide faith-based organizations
              </Text>
              <Text style={styles.faithSub}>
                Toggle on to exclude faith-based listings
              </Text>
            </View>
            <Switch
              value={filters.hideFaithBased}
              onValueChange={(v) => setFilter('hideFaithBased', v)}
              trackColor={{ false: colors.lightGray, true: colors.gold }}
              thumbColor={colors.white}
            />
          </View>

          {/* Category */}
          <SectionHeader icon="grid" label="Category" />
          {Object.entries(categories)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([parent, subs]) => (
              <View key={parent}>
                <TouchableOpacity
                  style={styles.categoryParent}
                  onPress={() =>
                    setExpandedCategory(
                      expandedCategory === parent ? null : parent,
                    )
                  }
                >
                  <Ionicons
                    name={
                      expandedCategory === parent
                        ? 'chevron-down'
                        : 'chevron-forward'
                    }
                    size={16}
                    color={colors.mediumGray}
                  />
                  <Text
                    style={[
                      styles.categoryParentText,
                      filters.category === parent &&
                        styles.categoryParentTextActive,
                    ]}
                  >
                    {parent}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setFilter(
                        'category',
                        filters.category === parent ? '' : parent,
                      )
                    }
                    hitSlop={8}
                  >
                    <Text style={styles.categoryCount}>
                      {Object.values(subs).reduce((a, b) => a + b, 0)}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
                {expandedCategory === parent &&
                  Object.entries(subs)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([sub, count]) => {
                      const full = `${parent}: ${sub}`;
                      const isActive = filters.category === full;
                      return (
                        <TouchableOpacity
                          key={full}
                          style={styles.categorySub}
                          onPress={() =>
                            setFilter('category', isActive ? '' : full)
                          }
                        >
                          <Text
                            style={[
                              styles.categorySubText,
                              isActive && styles.categorySubTextActive,
                            ]}
                          >
                            {sub}
                          </Text>
                          <Text style={styles.categoryCount}>{count}</Text>
                        </TouchableOpacity>
                      );
                    })}
              </View>
            ))}

          <View style={{ height: 40 }} />
        </BottomSheetScrollView>

        {/* Apply Button */}
        <View style={styles.applyRow}>
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.applyText}>Show Results</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </Modal>
  );
}

function SectionHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon as any} size={18} color={colors.navy} />
      <Text style={styles.sectionLabel}>{label}</Text>
    </View>
  );
}

function ChipGroup({
  items,
  counts,
  selected,
  onSelect,
}: {
  items: string[];
  counts: Record<string, number>;
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <View style={styles.chipGroup}>
      {items.map((item) => {
        const isActive = selected === item;
        return (
          <TouchableOpacity
            key={item}
            style={[styles.filterChip, isActive && styles.filterChipActive]}
            onPress={() => onSelect(item)}
          >
            <Text
              style={[
                styles.filterChipText,
                isActive && styles.filterChipTextActive,
              ]}
              numberOfLines={1}
            >
              {item}
            </Text>
            {counts[item] !== undefined && (
              <Text
                style={[
                  styles.filterChipCount,
                  isActive && styles.filterChipCountActive,
                ]}
              >
                {counts[item]}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheetBg: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.darkGray,
  },
  clearAll: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.danger,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.darkGray,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.offWhite,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  filterChipText: {
    fontSize: 13,
    color: colors.darkGray,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.white,
  },
  filterChipCount: {
    fontSize: 11,
    color: colors.mediumGray,
    fontWeight: '600',
  },
  filterChipCountActive: {
    color: 'rgba(255,255,255,0.7)',
  },
  ageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ageInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.darkGray,
    backgroundColor: colors.offWhite,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 0,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.offWhite,
  },
  segmentActive: {
    backgroundColor: colors.navy,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkGray,
  },
  segmentTextActive: {
    color: colors.white,
  },
  faithRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  faithLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.darkGray,
  },
  faithSub: {
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 2,
  },
  categoryParent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  categoryParentText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.darkGray,
  },
  categoryParentTextActive: {
    color: colors.navy,
  },
  categoryCount: {
    fontSize: 12,
    color: colors.mediumGray,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'right',
  },
  categorySub: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 32,
  },
  categorySubText: {
    flex: 1,
    fontSize: 14,
    color: colors.darkGray,
  },
  categorySubTextActive: {
    color: colors.navy,
    fontWeight: '600',
  },
  applyRow: {
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  applyBtn: {
    backgroundColor: colors.navy,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
