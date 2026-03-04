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
} from 'react-native';
import MapView, { Marker, Region, PROVIDER_DEFAULT } from 'react-native-maps';
import ClusteredMapView from 'react-native-map-clustering';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { FormattedListing } from '../types';
import { useListings } from '../hooks/useListings';
import { useFilters } from '../hooks/useFilters';
import { useSaved } from '../hooks/useSaved';
import { getDistance } from '../utils/filters';
import {
  colors,
  siteConfig,
  categoryColors,
  defaultCategoryColor,
} from '../config/siteConfig';
import ListingCard from '../components/ListingCard';
import FilterSheet from '../components/FilterSheet';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type MapStackParamList = {
  MapMain: undefined;
  Detail: { listing: FormattedListing };
};

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<MapStackParamList>>();

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

  const snapPoints = useMemo(
    () => [120, SCREEN_HEIGHT * 0.5, SCREEN_HEIGHT * 0.9],
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
        400,
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
        600,
      );
    } catch {
      // location unavailable
    }
  }, []);

  const boundingRegion = useMemo((): Region | null => {
    if (sortedFiltered.length === 0) return null;
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    for (const l of sortedFiltered) {
      if (l.coords[0] < minLat) minLat = l.coords[0];
      if (l.coords[0] > maxLat) maxLat = l.coords[0];
      if (l.coords[1] < minLng) minLng = l.coords[1];
      if (l.coords[1] > maxLng) maxLng = l.coords[1];
    }
    const PAD = 0.15;
    const latDelta = Math.max((maxLat - minLat) * (1 + PAD), 0.05);
    const lngDelta = Math.max((maxLng - minLng) * (1 + PAD), 0.05);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  }, [sortedFiltered]);

  const hasInitiallyFit = useRef(false);
  useEffect(() => {
    if (!boundingRegion || !mapRef.current || !mapReady) return;
    if (!hasInitiallyFit.current) {
      setTimeout(() => {
        mapRef.current?.animateToRegion(boundingRegion, 0);
      }, 400);
      hasInitiallyFit.current = true;
    } else {
      mapRef.current.animateToRegion(boundingRegion, 500);
    }
  }, [boundingRegion, mapReady]);

  const getMarkerColor = useCallback((listing: FormattedListing) => {
    const parent = listing.category?.split(': ')[0] || '';
    return categoryColors[parent] || defaultCategoryColor;
  }, []);

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
      <View style={styles.sheetHandle}>
        <View style={styles.handleBar} />
        <Text style={styles.resultCount}>
          {sortedFiltered.length} result{sortedFiltered.length !== 1 ? 's' : ''}
        </Text>
      </View>
    ),
    [sortedFiltered.length],
  );

  if (loading && listings.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.navy} />
        <Text style={styles.loadingText}>Loading resources...</Text>
      </View>
    );
  }

  if (error && listings.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={48} color={colors.mediumGray} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refresh}>
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
        mapPadding={{ top: insets.top + 70, bottom: 130, left: 0, right: 0 }}
        clusterColor={colors.navy}
        clusterTextColor={colors.white}
        clusterFontFamily={Platform.OS === 'ios' ? 'System' : 'Roboto'}
        spiralEnabled={false}
        onMapReady={() => setMapReady(true)}
        onPress={() => {
          Keyboard.dismiss();
          setSelectedGuid(null);
        }}
      >
        {sortedFiltered.map((listing) => (
          <Marker
            key={listing.guid}
            identifier={String(listing.guid)}
            coordinate={{
              latitude: listing.coords[0],
              longitude: listing.coords[1],
            }}
            pinColor={getMarkerColor(listing)}
            onPress={() => handleMarkerPress(listing)}
          />
        ))}
      </ClusteredMapView>

      {/* Floating Toolbar */}
      <View style={[styles.toolbar, { top: insets.top + 8 }]}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.mediumGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search resources..."
            placeholderTextColor={colors.mediumGray}
            value={filters.search}
            onChangeText={(t) => setFilter('search', t)}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() => setFilterOpen(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="options-outline" size={22} color={colors.white} />
          {activeCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Near Me button */}
      <TouchableOpacity
        style={[styles.nearMeBtn, { bottom: snapPoints[0] + 16 }]}
        onPress={handleNearMe}
        activeOpacity={0.8}
      >
        <Ionicons name="navigate" size={22} color={colors.navy} />
      </TouchableOpacity>

      {/* Active filter chips */}
      {activeCount > 0 && (
        <View style={[styles.chipRow, { top: insets.top + 62 }]}>
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
              label={filters.category}
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
        </View>
      )}

      {/* Bottom Sheet */}
      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={snapPoints}
        handleComponent={renderHandle}
        backgroundStyle={styles.sheetBg}
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
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText} numberOfLines={1}>
        {label}
      </Text>
      <TouchableOpacity onPress={onRemove} hitSlop={8}>
        <Ionicons name="close-circle" size={16} color={colors.navy} />
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
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: colors.darkGray,
    height: 44,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.danger,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  nearMeBtn: {
    position: 'absolute',
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  chipRow: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    zIndex: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
    maxWidth: 160,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.navy,
  },
  sheetBg: {
    backgroundColor: colors.offWhite,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetHandle: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.lightGray,
    marginBottom: 6,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkGray,
  },
  listContent: {
    paddingTop: 4,
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
