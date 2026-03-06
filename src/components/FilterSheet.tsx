import React, { useMemo, useState } from 'react';
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Filters, FormattedListing, Meta } from '../types';
import {
  getCityCount,
  getKeywordCount,
  getCostCount,
  getCategoryCount,
} from '../utils/filters';
import {
  colors,
  siteConfig,
  categoryColors,
  categoryIcons,
  defaultCategoryColor,
} from '../config/siteConfig';

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
  const insets = useSafeAreaInsets();
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : 12 }]}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.clearAll}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.darkGray} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
              placeholder={`Age (${siteConfig.ageRange.min}\u2013${siteConfig.ageRange.max})`}
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
            .map(([parent, subs]) => {
              const subKeys = Object.keys(subs);
              const totalCount = Object.values(subs).reduce((a: number, b: number) => a + b, 0);
              const catColor = categoryColors[parent] || defaultCategoryColor;
              const iconName = (categoryIcons[parent] || 'folder-outline') as any;
              const isSingleSub = subKeys.length === 1;

              if (isSingleSub) {
                const full = `${parent}: ${subKeys[0]}`;
                const isActive = filters.category === full || filters.category.startsWith(`${parent}:`);
                return (
                  <TouchableOpacity
                    key={parent}
                    style={[
                      styles.categoryFlat,
                      isActive && { backgroundColor: catColor + '18', borderColor: catColor },
                    ]}
                    onPress={() =>
                      setFilter('category', isActive ? '' : `${parent}:`)
                    }
                  >
                    <View style={[styles.categoryIconDot, { backgroundColor: catColor }]}>
                      <Ionicons name={iconName} size={14} color="#fff" />
                    </View>
                    <Text
                      style={[
                        styles.categoryFlatText,
                        isActive && { color: catColor, fontWeight: '700' },
                      ]}
                      numberOfLines={1}
                    >
                      {parent}
                    </Text>
                    <Text style={styles.categoryCount}>{totalCount}</Text>
                  </TouchableOpacity>
                );
              }

              const isParentActive = filters.category.startsWith(`${parent}:`);
              return (
                <View key={parent}>
                  <TouchableOpacity
                    style={styles.categoryParent}
                    onPress={() =>
                      setExpandedCategory(
                        expandedCategory === parent ? null : parent,
                      )
                    }
                  >
                    <View style={[styles.categoryIconDot, { backgroundColor: catColor }]}>
                      <Ionicons name={iconName} size={14} color="#fff" />
                    </View>
                    <Text
                      style={[
                        styles.categoryParentText,
                        isParentActive && { color: catColor },
                      ]}
                    >
                      {parent}
                    </Text>
                    <Ionicons
                      name={
                        expandedCategory === parent
                          ? 'chevron-down'
                          : 'chevron-forward'
                      }
                      size={14}
                      color={colors.mediumGray}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setFilter(
                          'category',
                          isParentActive ? '' : `${parent}:`,
                        )
                      }
                      hitSlop={8}
                    >
                      <Text style={[styles.categoryCount, isParentActive && { color: catColor }]}>
                        {totalCount}
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
                            style={[
                              styles.categorySub,
                              isActive && { backgroundColor: catColor + '12' },
                            ]}
                            onPress={() =>
                              setFilter('category', isActive ? '' : full)
                            }
                          >
                            <View style={[styles.subDot, { backgroundColor: catColor }]} />
                            <Text
                              style={[
                                styles.categorySubText,
                                isActive && { color: catColor, fontWeight: '600' },
                              ]}
                            >
                              {sub}
                            </Text>
                            <Text style={styles.categoryCount}>{count}</Text>
                          </TouchableOpacity>
                        );
                      })}
                </View>
              );
            })}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Apply Button */}
        <View style={[styles.applyRow, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.applyText}>Show Results</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headerRow: {
    flex: 1,
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
    marginTop: 4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
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
  categoryFlat: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginBottom: 4,
  },
  categoryFlatText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.darkGray,
  },
  categoryIconDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryParent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 10,
    marginBottom: 2,
  },
  categoryParentText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.darkGray,
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
    paddingVertical: 9,
    paddingLeft: 48,
    paddingRight: 8,
    borderRadius: 8,
    marginBottom: 2,
  },
  categorySubText: {
    flex: 1,
    fontSize: 14,
    color: colors.darkGray,
  },
  applyRow: {
    paddingHorizontal: 20,
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
