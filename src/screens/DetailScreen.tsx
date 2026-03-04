import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { FormattedListing } from '../types';
import { useSaved } from '../hooks/useSaved';
import { formatSocialMediaUrl } from '../utils/filters';
import {
  colors,
  categoryColors,
  defaultCategoryColor,
} from '../config/siteConfig';

type DetailParams = {
  Detail: { listing: FormattedListing };
};

export default function DetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<DetailParams, 'Detail'>>();
  const { listing } = route.params;
  const { isSaved, toggleSave } = useSaved();
  const saved = isSaved(listing.guid);

  const parentCategory = listing.category?.split(': ')[0] || '';
  const accentColor = categoryColors[parentCategory] || defaultCategoryColor;

  const handleDirections = useCallback(() => {
    const addr = encodeURIComponent(listing.full_address || '');
    const url = Platform.select({
      ios: `maps://maps.apple.com/?daddr=${addr}`,
      android: `geo:0,0?q=${addr}`,
      default: `https://maps.google.com/?q=${addr}`,
    });
    Linking.openURL(url);
  }, [listing.full_address]);

  const handleCall = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone.replace(/[^\d+]/g, '')}`);
  }, []);

  const handleEmail = useCallback((email: string) => {
    Linking.openURL(`mailto:${email}`);
  }, []);

  const handleWebsite = useCallback(async (url: string) => {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    await WebBrowser.openBrowserAsync(fullUrl);
  }, []);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `${listing.full_name}\n${listing.full_address || ''}\n${listing.phone_1 || ''}`,
        title: listing.full_name,
      });
    } catch {
      // share cancelled
    }
  }, [listing]);

  const socialLinks = [
    { key: 'website', icon: 'globe-outline', value: listing.website },
    { key: 'facebook', icon: 'logo-facebook', value: listing.facebook_link },
    { key: 'instagram', icon: 'logo-instagram', value: listing.instagram_link },
    { key: 'twitter', icon: 'logo-twitter', value: listing.twitter_link },
    { key: 'youtube', icon: 'logo-youtube', value: listing.youtube_link },
    { key: 'tiktok', icon: 'musical-notes-outline', value: listing.tiktok_link },
  ].filter((s) => s.value);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        {listing.image_url ? (
          <Image source={{ uri: listing.image_url }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroPlaceholder, { backgroundColor: accentColor }]}>
            <Ionicons name="business-outline" size={48} color="rgba(255,255,255,0.6)" />
          </View>
        )}

        <View style={styles.body}>
          {/* Category badge */}
          <View style={[styles.categoryBadge, { backgroundColor: accentColor + '18' }]}>
            <Text style={[styles.categoryText, { color: accentColor }]}>
              {listing.category}
            </Text>
          </View>

          {/* Name */}
          <Text style={styles.name}>{listing.full_name}</Text>
          {listing.parent_organization && (
            <Text style={styles.orgName}>{listing.parent_organization}</Text>
          )}

          {/* Action buttons */}
          <View style={styles.actionRow}>
            {listing.full_address && (
              <ActionButton
                icon="navigate-outline"
                label="Directions"
                onPress={handleDirections}
                color={colors.navy}
              />
            )}
            {listing.phone_1 && (
              <ActionButton
                icon="call-outline"
                label="Call"
                onPress={() => handleCall(listing.phone_1!)}
                color={colors.success}
              />
            )}
            <ActionButton
              icon={saved ? 'heart' : 'heart-outline'}
              label={saved ? 'Saved' : 'Save'}
              onPress={() => toggleSave(listing.guid)}
              color={saved ? colors.danger : colors.mediumGray}
            />
            <ActionButton
              icon="share-outline"
              label="Share"
              onPress={handleShare}
              color={colors.navy}
            />
          </View>

          {/* Address */}
          {listing.full_address && (
            <InfoSection icon="location-outline" title="Address">
              <Text style={styles.infoText}>{listing.full_address}</Text>
            </InfoSection>
          )}

          {/* Phones */}
          {listing.phone_1 && (
            <InfoSection icon="call-outline" title={listing.phone_label_1 || 'Phone'}>
              <TouchableOpacity onPress={() => handleCall(listing.phone_1!)}>
                <Text style={styles.linkText}>{listing.phone_1}</Text>
              </TouchableOpacity>
            </InfoSection>
          )}
          {listing.phone_2 && (
            <InfoSection icon="call-outline" title={listing.phone_label_2 || 'Phone 2'}>
              <TouchableOpacity onPress={() => handleCall(listing.phone_2!)}>
                <Text style={styles.linkText}>{listing.phone_2}</Text>
              </TouchableOpacity>
            </InfoSection>
          )}
          {listing.crisis_line_number && (
            <InfoSection icon="warning-outline" title={listing.crisis_line_label || 'Crisis Line'}>
              <TouchableOpacity onPress={() => handleCall(listing.crisis_line_number!)}>
                <Text style={[styles.linkText, { color: colors.danger }]}>
                  {listing.crisis_line_number}
                </Text>
              </TouchableOpacity>
            </InfoSection>
          )}

          {/* Email */}
          {listing.program_email && (
            <InfoSection icon="mail-outline" title="Email">
              <TouchableOpacity onPress={() => handleEmail(listing.program_email!)}>
                <Text style={styles.linkText}>{listing.program_email}</Text>
              </TouchableOpacity>
            </InfoSection>
          )}

          {/* Description */}
          {listing.description && (
            <InfoSection icon="document-text-outline" title="Description">
              <Text style={styles.infoText}>{listing.description}</Text>
            </InfoSection>
          )}

          {/* Collapsible sections */}
          <CollapsibleSection title="Eligibility" content={listing.eligibility_requirements} />
          <CollapsibleSection title="Intake Instructions" content={listing.intake_instructions} />
          <CollapsibleSection title="Financial Information" content={listing.financial_information} />
          <CollapsibleSection title="Languages Offered" content={listing.languages_offered} />
          <CollapsibleSection title="ADA / Accessibility" content={listing.ada_accessibility_notes} />
          <CollapsibleSection title="Transit Instructions" content={listing.transit_instructions} />
          <CollapsibleSection title="Building Description" content={listing.building_description} />
          <CollapsibleSection title="COVID-19 Message" content={listing.covid_message} />

          {/* Age info */}
          {(listing.min_age || listing.max_age) && (
            <InfoSection icon="people-outline" title="Ages Served">
              <Text style={styles.infoText}>
                {listing.min_age && listing.max_age
                  ? `${listing.min_age}–${listing.max_age}`
                  : listing.min_age
                  ? `${listing.min_age}+`
                  : `Up to ${listing.max_age}`}
                {listing.age_group ? ` (${listing.age_group})` : ''}
              </Text>
            </InfoSection>
          )}

          {/* Social links */}
          {socialLinks.length > 0 && (
            <View style={styles.socialRow}>
              {socialLinks.map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={styles.socialBtn}
                  onPress={() => handleWebsite(s.value!)}
                >
                  <Ionicons name={s.icon as any} size={24} color={colors.navy} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Verified */}
          {listing.agency_verified && (
            <View style={styles.verifiedRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.verifiedText}>
                Verified {listing.date_agency_verified || ''}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  color,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  color: string;
}) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <View style={[styles.actionCircle, { borderColor: color }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function InfoSection({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.infoSection}>
      <View style={styles.infoHeader}>
        <Ionicons name={icon as any} size={16} color={colors.navy} />
        <Text style={styles.infoTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function CollapsibleSection({
  title,
  content,
}: {
  title: string;
  content?: string;
}) {
  const [open, setOpen] = useState(false);
  if (!content) return null;

  return (
    <View style={styles.collapsible}>
      <TouchableOpacity
        style={styles.collapsibleHeader}
        onPress={() => setOpen(!open)}
      >
        <Text style={styles.collapsibleTitle}>{title}</Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.mediumGray}
        />
      </TouchableOpacity>
      {open && <Text style={styles.infoText}>{content}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scroll: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  heroPlaceholder: {
    width: '100%',
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.darkGray,
    lineHeight: 30,
  },
  orgName: {
    fontSize: 15,
    color: colors.mediumGray,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lightGray,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 6,
  },
  actionCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.darkGray,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.darkGray,
  },
  infoText: {
    fontSize: 15,
    color: colors.darkGray,
    lineHeight: 22,
  },
  linkText: {
    fontSize: 15,
    color: colors.navy,
    fontWeight: '600',
  },
  collapsible: {
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    paddingVertical: 12,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collapsibleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.darkGray,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  socialBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  verifiedText: {
    fontSize: 13,
    color: colors.mediumGray,
    fontWeight: '500',
  },
});
