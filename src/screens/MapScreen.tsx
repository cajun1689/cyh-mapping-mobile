import React, { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Keyboard,
  ScrollView,
} from 'react-native';
import MapView, { Marker, Region, PROVIDER_DEFAULT } from 'react-native-maps';
import ClusteredMapView from 'react-native-map-clustering';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Circle as SvgCircle } from 'react-native-svg';

import { FormattedListing } from '../types';
import { useListings } from '../hooks/useListings';
import { useFilters } from '../hooks/useFilters';
import { useSaved } from '../hooks/useSaved';
import { useTheme } from '../hooks/useTheme';
import { getDistance } from '../utils/filters';
import {
  colors,
  siteConfig,
  categoryColors,
  categoryIcons,
  defaultCategoryColor,
} from '../config/siteConfig';
import ListingCard from '../components/ListingCard';
import FilterSheet from '../components/FilterSheet';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DOT_SIZE = 14;
const DOT_SELECTED_SIZE = 20;

type MapStackParamList = {
  MapMain: undefined;
  Detail: { listing: FormattedListing };
};

function MarkerDot({ color, isSelected }: { color: string; isSelected: boolean }) {
  const size = isSelected ? DOT_SELECTED_SIZE : DOT_SIZE;
  return (
    <View style={[
      markerStyles.wrapper,
      { width: size + 8, height: size + 8 },
    ]}>
      {isSelected && (
        <View style={[markerStyles.ring, { borderColor: color }]} />
      )}
      <View
        style={[
          markerStyles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const markerStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: DOT_SELECTED_SIZE + 10,
    height: DOT_SELECTED_SIZE + 10,
    borderRadius: (DOT_SELECTED_SIZE + 10) / 2,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dot: {
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});

interface CategorySlice {
  color: string;
  count: number;
}

function DonutCluster({ count, slices }: { count: number; slices: CategorySlice[] }) {
  const size = Math.min(28 + Math.log2(count) * 8, 56);
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const total = slices.reduce((sum, s) => sum + s.count, 0) || 1;

  let offset = 0;

  return (
    <View style={[clusterStyles.wrapper, { width: size + 4, height: size + 4 }]}>
      <View style={clusterStyles.shadow}>
        <Svg width={size} height={size}>
          <SvgCircle
            cx={center}
            cy={center}
            r={radius}
            fill={colors.white}
            stroke={colors.lightGray}
            strokeWidth={0.5}
          />
          {slices.map((slice, i) => {
            const segLen = (slice.count / total) * circumference;
            const dashOffset = -offset;
            offset += segLen;
            return (
              <SvgCircle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${segLen} ${circumference - segLen}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
                rotation={-90}
                origin={`${center}, ${center}`}
              />
            );
          })}
        </Svg>
      </View>
      <Text style={[clusterStyles.text, { fontSize: size < 36 ? 11 : 13 }]}>
        {count}
      </Text>
    </View>
  );
}

const clusterStyles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    position: 'absolute',
    fontWeight: '800',
    color: colors.darkGray,
    textAlign: 'center',
  },
});

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<MapStackParamList>>();
  const { colors: tc, isDark, reducedMotion } = useTheme();
  const animDuration = reducedMotion ? 1 : 500;

  const { listings, rawListings, meta, loading, error, refresh } = useListings();
  const { filters, setFilter, clearFilters, activeCount, filtered } =
    useFilters(listings);
  const { savedGuids, toggleSave, isSaved } = useSaved();

  const [selectedGuid, setSelectedGuid] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef<MapView>(null);
  const sheetRef = useRef<BottomSheet>(null);
  const flatListRef = useRef<any>(null);
  const superClusterRef = useRef<any>(null);

  const snapPoints = useMemo(
    () => [130, SCREEN_HEIGHT * 0.45, SCREEN_HEIGHT * 0.88],
    [],
  );

  const sortedFiltered = useMemo(() => {
    if (!userLocation) return filtered;
    return [...filtered].sort(
      (a, b) =>
        getDistance(
          userLocation.latitude,
          userLocation.longitude,
          a.coords[0],
          a.coords[1],
        ) -
        getDistance(
          userLocation.latitude,
          userLocation.longitude,
          b.coords[0],
          b.coords[1],
        ),
    );
  }, [filtered, userLocation]);

  const handleMarkerPress = useCallback(
    (listing: FormattedListing) => {
      setSelectedGuid(listing.guid);
      sheetRef.current?.snapToIndex(0);
      const idx = sortedFiltered.findIndex((l) => l.guid === listing.guid);
      if (idx >= 0) {
        flatListRef.current?.scrollToIndex({ index: idx, animated: true });
      }
    },
    [sortedFiltered],
  );

  const handleCardPress = useCallback(
    (listing: FormattedListing) => {
      setSelectedGuid(listing.guid);
      mapRef.current?.animateToRegion(
        {
          latitude: listing.coords[0],
          longitude: listing.coords[1],
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        reducedMotion ? 1 : 400,
      );
      navigation.navigate('Detail', { listing });
    },
    [navigation],
  );

  const handleNearMe = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setUserLocation(coords);
      mapRef.current?.animateToRegion(
        {
          ...coords,
          latitudeDelta: 0.3,
          longitudeDelta: 0.3,
        },
        reducedMotion ? 1 : 600,
      );
    } catch {
      // location unavailable
    }
  }, []);

  const validListings = useMemo(
    () =>
      sortedFiltered.filter(
        (l) =>
          l.coords &&
          typeof l.coords[0] === 'number' &&
          typeof l.coords[1] === 'number' &&
          isFinite(l.coords[0]) &&
          isFinite(l.coords[1]),
      ),
    [sortedFiltered],
  );

  const boundingRegion = useMemo((): Region | null => {
    if (validListings.length === 0) return null;
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    for (const l of validListings) {
      if (l.coords[0] < minLat) minLat = l.coords[0];
      if (l.coords[0] > maxLat) maxLat = l.coords[0];
      if (l.coords[1] < minLng) minLng = l.coords[1];
      if (l.coords[1] > maxLng) maxLng = l.coords[1];
    }
    const PAD = 0.3;
    const latDelta = Math.max((maxLat - minLat) * (1 + PAD), 0.1);
    const lngDelta = Math.max((maxLng - minLng) * (1 + PAD), 0.1);
    const region = {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
    if (
      !isFinite(region.latitude) ||
      !isFinite(region.longitude) ||
      !isFinite(region.latitudeDelta) ||
      !isFinite(region.longitudeDelta)
    ) {
      return null;
    }
    return region;
  }, [validListings]);

  const hasInitiallyFit = useRef(false);
  useEffect(() => {
    if (!boundingRegion || !mapRef.current || !mapReady) return;
    if (!hasInitiallyFit.current) {
      const timer = setTimeout(() => {
        try {
          mapRef.current?.animateToRegion(boundingRegion, 1);
        } catch {}
      }, 600);
      hasInitiallyFit.current = true;
      return () => clearTimeout(timer);
    } else {
      try {
        mapRef.current.animateToRegion(boundingRegion, animDuration);
      } catch {}
    }
  }, [boundingRegion, mapReady]);

  const getMarkerColor = useCallback((listing: FormattedListing) => {
    const parent = listing.category?.split(': ')[0] || '';
    return categoryColors[parent] || defaultCategoryColor;
  }, []);

  const renderCluster = useCallback((cluster: any) => {
    const { id, geometry, onPress, properties } = cluster;
    const count = properties?.point_count || 0;
    const clusterId = properties?.cluster_id;

    let slices: CategorySlice[] = [];
    try {
      if (superClusterRef.current && clusterId !== undefined) {
        const leaves = superClusterRef.current.getLeaves(clusterId, Infinity);
        const catCounts: Record<string, number> = {};
        for (const leaf of leaves) {
          const idx = leaf.properties?.index;
          if (idx !== undefined && validListings[idx]) {
            const parent = validListings[idx].category?.split(': ')[0] || '';
            const color = categoryColors[parent] || defaultCategoryColor;
            catCounts[color] = (catCounts[color] || 0) + 1;
          }
        }
        slices = Object.entries(catCounts).map(([color, cnt]) => ({
          color,
          count: cnt,
        }));
      }
    } catch {}

    if (slices.length === 0) {
      slices = [{ color: colors.navy, count: 1 }];
    }

    return (
      <Marker
        key={`cluster-${id}`}
        coordinate={{
          latitude: geometry.coordinates[1],
          longitude: geometry.coordinates[0],
        }}
        onPress={onPress}
        tracksViewChanges={false}
      >
        <DonutCluster count={count} slices={slices} />
      </Marker>
    );
  }, [validListings]);

  const renderCard = useCallback(
    ({ item }: { item: FormattedListing }) => {
      const dist = userLocation
        ? getDistance(
            userLocation.latitude,
            userLocation.longitude,
            item.coords[0],
            item.coords[1],
          )
        : undefined;
      return (
        <ListingCard
          listing={item}
          isSaved={isSaved(item.guid)}
          isSelected={item.guid === selectedGuid}
          onPress={() => handleCardPress(item)}
          onToggleSave={() => toggleSave(item.guid)}
          distance={dist}
        />
      );
    },
    [isSaved, selectedGuid, handleCardPress, toggleSave, userLocation],
  );

  const renderHandle = useCallback(
    () => (
      <View style={[styles.sheetHandle, { borderBottomColor: tc.border }]}>
        <View style={[styles.handleBar, { backgroundColor: tc.border }]} />
        <Text
          style={[styles.resultCount, { color: tc.textTertiary }]}
          accessibilityRole="header"
          accessibilityLabel={`${sortedFiltered.length} result${sortedFiltered.length !== 1 ? 's' : ''}`}
          maxFontSizeMultiplier={1.3}
        >
          {sortedFiltered.length} result{sortedFiltered.length !== 1 ? 's' : ''}
        </Text>
      </View>
    ),
    [sortedFiltered.length, tc],
  );

  if (loading && listings.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: tc.background }]}>
        <ActivityIndicator size="large" color={tc.navy} />
        <Text style={[styles.loadingText, { color: tc.textTertiary }]}>Loading resources...</Text>
      </View>
    );
  }

  if (error && listings.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: tc.background }]}>
        <Ionicons name="cloud-offline-outline" size={48} color={tc.textTertiary} />
        <Text style={[styles.errorText, { color: tc.textTertiary }]}>{error}</Text>
        <TouchableOpacity style={[styles.retryBtn, { backgroundColor: tc.navy }]} onPress={refresh} accessibilityRole="button" accessibilityLabel="Try again">
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ClusteredMapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          ...siteConfig.mapCenter,
          ...siteConfig.mapDelta,
        }}
        showsUserLocation={!!userLocation}
        showsMyLocationButton={false}
        mapPadding={{ top: insets.top + 120, bottom: 140, left: 16, right: 16 }}
        radius={50}
        minZoomLevel={5}
        maxZoom={14}
        spiralEnabled={false}
        renderCluster={renderCluster}
        superClusterRef={superClusterRef}
        onMapReady={() => setMapReady(true)}
        onPress={() => {
          Keyboard.dismiss();
          setSelectedGuid(null);
        }}
      >
        {validListings.map((listing) => (
          <Marker
            key={listing.guid}
            identifier={String(listing.guid)}
            coordinate={{
              latitude: listing.coords[0],
              longitude: listing.coords[1],
            }}
            onPress={() => handleMarkerPress(listing)}
            tracksViewChanges={false}
          >
            <MarkerDot
              color={getMarkerColor(listing)}
              isSelected={listing.guid === selectedGuid}
            />
          </Marker>
        ))}
      </ClusteredMapView>

      {/* Floating Toolbar */}
      <View style={[styles.toolbar, { top: insets.top + 8 }]}>
        <View style={[styles.searchContainer, { backgroundColor: tc.surface }]}>
          <Ionicons name="search" size={18} color={tc.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: tc.text }]}
            placeholder="Search resources..."
            placeholderTextColor={tc.textTertiary}
            value={filters.search}
            onChangeText={(t) => setFilter('search', t)}
            returnKeyType="search"
            clearButtonMode="while-editing"
            accessibilityLabel="Search resources"
            accessibilityHint="Type to filter resources by name or keyword"
          />
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: tc.navy }, activeCount > 0 && styles.filterBtnActive]}
          onPress={() => setFilterOpen(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Filters${activeCount > 0 ? `, ${activeCount} active` : ''}`}
          accessibilityHint="Opens filter options"
        >
          <Ionicons name="options-outline" size={22} color="#FFFFFF" />
          {activeCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText} accessibilityElementsHidden>{activeCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Category Bar */}
      {meta?.listingCategories && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.categoryBar, { top: insets.top + 62 }]}
          contentContainerStyle={styles.categoryBarContent}
        >
          {Object.keys(meta.listingCategories).map((parent) => {
            const isActive = filters.category.startsWith(parent);
            const catColor = categoryColors[parent] || defaultCategoryColor;
            const iconName = (categoryIcons[parent] || 'folder-outline') as any;
            return (
              <TouchableOpacity
                key={parent}
                style={[
                  styles.categoryPill,
                  { backgroundColor: isActive ? catColor : tc.mapOverlay },
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  if (isActive) {
                    setFilter('category', '');
                  } else {
                    setFilter('category', `${parent}:`);
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel={`${parent} category`}
                accessibilityState={{ selected: isActive }}
                accessibilityHint={isActive ? 'Tap to remove filter' : 'Tap to filter by this category'}
              >
                <Ionicons
                  name={iconName}
                  size={16}
                  color={isActive ? '#FFFFFF' : catColor}
                />
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: isActive ? '#FFFFFF' : tc.text },
                  ]}
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.3}
                >
                  {parent}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Near Me button */}
      <TouchableOpacity
        style={[styles.nearMeBtn, { bottom: snapPoints[0] + 16, backgroundColor: tc.surface }]}
        onPress={handleNearMe}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Near me"
        accessibilityHint="Uses your location to sort resources by distance"
      >
        <Ionicons name="navigate" size={20} color={tc.navy} />
      </TouchableOpacity>

      {/* Active filter chips */}
      {activeCount > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.chipRow, { top: insets.top + 102 }]}
          contentContainerStyle={styles.chipRowContent}
        >
          {filters.city ? (
            <Chip label={filters.city} onRemove={() => setFilter('city', '')} />
          ) : null}
          {filters.tag ? (
            <Chip label={filters.tag} onRemove={() => setFilter('tag', '')} />
          ) : null}
          {filters.costKeyword ? (
            <Chip
              label={filters.costKeyword}
              onRemove={() => setFilter('costKeyword', '')}
            />
          ) : null}
          {filters.category ? (
            <Chip
              label={filters.category.replace(': ', ' > ')}
              onRemove={() => setFilter('category', '')}
            />
          ) : null}
          {filters.ageGroup !== 'all' ? (
            <Chip
              label={filters.ageGroup}
              onRemove={() => setFilter('ageGroup', 'all')}
            />
          ) : null}
          {filters.hideFaithBased ? (
            <Chip
              label="No faith-based"
              onRemove={() => setFilter('hideFaithBased', false)}
            />
          ) : null}
        </ScrollView>
      )}

      {/* Bottom Sheet */}
      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        handleComponent={renderHandle}
        backgroundStyle={[styles.sheetBg, { backgroundColor: tc.sheetBg }]}
        enablePanDownToClose={false}
      >
        <BottomSheetFlatList
          ref={flatListRef}
          data={sortedFiltered}
          keyExtractor={(item: FormattedListing) => String(item.guid)}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <Ionicons
                name="search-outline"
                size={40}
                color={colors.mediumGray}
              />
              <Text style={styles.emptyText}>No resources match your filters</Text>
              <TouchableOpacity onPress={clearFilters}>
                <Text style={styles.clearLink}>Clear all filters</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </BottomSheet>

      {/* Filter Sheet */}
      <FilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilter={setFilter}
        clearFilters={clearFilters}
        meta={meta}
        listings={listings}
      />
    </View>
  );
}

function Chip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  const { colors: tc } = useTheme();
  return (
    <View
      style={[styles.chip, { backgroundColor: tc.chipBg }]}
      accessibilityRole="button"
      accessibilityLabel={`Active filter: ${label}. Double tap to remove.`}
    >
      <Text style={[styles.chipText, { color: tc.navy }]} numberOfLines={1} maxFontSizeMultiplier={1.3}>
        {label}
      </Text>
      <TouchableOpacity onPress={onRemove} hitSlop={8} accessibilityLabel={`Remove ${label} filter`}>
        <Ionicons name="close-circle" size={14} color={tc.navy} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.offWhite,
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.mediumGray,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.mediumGray,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: colors.navy,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
  toolbar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.darkGray,
    height: 46,
  },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  filterBtnActive: {
    backgroundColor: '#2a5670',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.danger,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  categoryBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  categoryBarContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  nearMeBtn: {
    position: 'absolute',
    right: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  chipRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  chipRowContent: {
    paddingHorizontal: 16,
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.navy,
  },
  sheetBg: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  sheetHandle: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.lightGray,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.lightGray,
    marginBottom: 8,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mediumGray,
    letterSpacing: 0.2,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  emptyList: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: colors.mediumGray,
    textAlign: 'center',
  },
  clearLink: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: colors.navy,
  },
});
