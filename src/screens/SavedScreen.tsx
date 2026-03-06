import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { FormattedListing } from '../types';
import { useListings } from '../hooks/useListings';
import { useSaved } from '../hooks/useSaved';
import { useTheme } from '../hooks/useTheme';
import ListingCard from '../components/ListingCard';
import {
  categoryColors,
  defaultCategoryColor,
  siteConfig,
} from '../config/siteConfig';

type SavedStackParamList = {
  SavedMain: undefined;
  Detail: { listing: FormattedListing };
};

function buildPrintHtml(saved: FormattedListing[]): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const resourceCards = saved
    .map((l) => {
      const parent = l.category?.split(': ')[0] || '';
      const accent = categoryColors[parent] || defaultCategoryColor;
      const rows: string[] = [];

      if (l.full_address)
        rows.push(`<tr><td class="lbl">Address</td><td>${esc(l.full_address)}</td></tr>`);
      if (l.phone_1)
        rows.push(`<tr><td class="lbl">${esc(l.phone_label_1 || 'Phone')}</td><td>${esc(l.phone_1)}</td></tr>`);
      if (l.phone_2)
        rows.push(`<tr><td class="lbl">${esc(l.phone_label_2 || 'Phone 2')}</td><td>${esc(l.phone_2)}</td></tr>`);
      if (l.crisis_line_number)
        rows.push(`<tr><td class="lbl">${esc(l.crisis_line_label || 'Crisis Line')}</td><td style="color:#E74C3C;font-weight:600">${esc(l.crisis_line_number)}</td></tr>`);
      if (l.program_email)
        rows.push(`<tr><td class="lbl">Email</td><td>${esc(l.program_email)}</td></tr>`);
      if (l.website)
        rows.push(`<tr><td class="lbl">Website</td><td>${esc(l.website)}</td></tr>`);
      if (l.min_age || l.max_age) {
        const ages =
          l.min_age && l.max_age
            ? `${l.min_age}–${l.max_age}`
            : l.min_age
            ? `${l.min_age}+`
            : `Up to ${l.max_age}`;
        rows.push(`<tr><td class="lbl">Ages</td><td>${esc(ages)}${l.age_group ? ` (${esc(l.age_group)})` : ''}</td></tr>`);
      }
      if (l.cost && l.cost.length > 0)
        rows.push(`<tr><td class="lbl">Cost</td><td>${esc(l.cost.join(', '))}</td></tr>`);
      if (l.intake_instructions)
        rows.push(`<tr><td class="lbl">Intake</td><td>${esc(l.intake_instructions)}</td></tr>`);

      return `
        <div class="card">
          <div class="accent" style="background:${accent}"></div>
          <div class="card-body">
            <div class="cat" style="color:${accent}">${esc(l.category || '')}</div>
            <div class="name">${esc(l.full_name)}</div>
            ${l.parent_organization ? `<div class="org">${esc(l.parent_organization)}</div>` : ''}
            ${l.description ? `<p class="desc">${esc(l.description)}</p>` : ''}
            ${rows.length > 0 ? `<table>${rows.join('')}</table>` : ''}
          </div>
        </div>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 24px; line-height: 1.5; }
  .header { text-align: center; margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid #1B3A4B; }
  .header h1 { font-size: 22px; color: #1B3A4B; margin-bottom: 4px; }
  .header p { font-size: 13px; color: #666; }
  .card { display: flex; flex-direction: row; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 16px; overflow: hidden; page-break-inside: avoid; }
  .accent { width: 5px; flex-shrink: 0; }
  .card-body { padding: 14px 16px; flex: 1; }
  .cat { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .name { font-size: 17px; font-weight: 800; color: #1B3A4B; margin-bottom: 2px; }
  .org { font-size: 13px; color: #777; margin-bottom: 8px; }
  .desc { font-size: 13px; color: #444; margin-bottom: 10px; }
  table { width: 100%; font-size: 13px; border-collapse: collapse; }
  td { padding: 3px 0; vertical-align: top; }
  .lbl { font-weight: 600; color: #555; width: 80px; padding-right: 10px; white-space: nowrap; }
  .footer { text-align: center; margin-top: 24px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 11px; color: #999; }
</style>
</head>
<body>
  <div class="header">
    <h1>My Saved Resources</h1>
    <p>${esc(siteConfig.siteName)} &mdash; ${esc(dateStr)}</p>
    <p>${saved.length} resource${saved.length !== 1 ? 's' : ''}</p>
  </div>
  ${resourceCards}
  <div class="footer">
    ${esc(siteConfig.siteName)} &bull; ${esc(siteConfig.organizationName)}<br/>
    ${esc(siteConfig.disclaimer)}
  </div>
</body>
</html>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<SavedStackParamList>>();
  const { listings, refreshing, refresh } = useListings();
  const { savedGuids, toggleSave, isSaved, clearAll } = useSaved();
  const { colors } = useTheme();
  const [printing, setPrinting] = useState(false);

  const savedListings = useMemo(
    () => listings.filter((l) => savedGuids.includes(l.guid)),
    [listings, savedGuids],
  );

  const handlePrint = useCallback(async () => {
    if (savedListings.length === 0) return;
    setPrinting(true);
    try {
      const html = buildPrintHtml(savedListings);
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share or print your saved resources',
        UTI: 'com.adobe.pdf',
      });
    } catch (e: any) {
      if (e?.message !== 'User cancelled') {
        Alert.alert('Error', 'Could not generate the printout. Please try again.');
      }
    } finally {
      setPrinting(false);
    }
  }, [savedListings]);

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
        <View style={styles.headerActions}>
          {savedListings.length > 0 && (
            <TouchableOpacity
              onPress={handlePrint}
              disabled={printing}
              style={styles.headerBtn}
              accessibilityRole="button"
              accessibilityLabel="Print or share saved resources as PDF"
            >
              {printing ? (
                <ActivityIndicator size="small" color={colors.navy} />
              ) : (
                <Ionicons name="print-outline" size={22} color={colors.navy} />
              )}
            </TouchableOpacity>
          )}
          {savedListings.length > 0 && (
            <TouchableOpacity onPress={clearAll} accessibilityRole="button" accessibilityLabel="Clear all saved resources">
              <Text style={[styles.clearBtn, { color: colors.danger }]}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.navy}
            colors={[colors.navy]}
          />
        }
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerBtn: {
    padding: 4,
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
