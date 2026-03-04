import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, siteConfig } from '../config/siteConfig';

export default function AboutScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <Ionicons name="map" size={40} color={colors.gold} />
        <Text style={styles.heroTitle}>{siteConfig.siteName}</Text>
        <Text style={styles.heroTagline}>{siteConfig.tagline}</Text>
      </View>

      {/* About text */}
      {siteConfig.aboutText.map((paragraph, i) => (
        <Text key={i} style={styles.paragraph}>
          {paragraph}
        </Text>
      ))}

      {/* Disclaimer */}
      <View style={styles.disclaimerBox}>
        <Ionicons name="alert-circle-outline" size={18} color={colors.gold} />
        <Text style={styles.disclaimerText}>{siteConfig.disclaimer}</Text>
      </View>

      {/* Contributors */}
      <Text style={styles.sectionTitle}>Contributors</Text>
      {siteConfig.contributors.map((c) => (
        <View key={c.name} style={styles.contributorCard}>
          {c.logo && (
            <Image source={{ uri: c.logo }} style={styles.contributorLogo} />
          )}
          <Text style={styles.contributorName}>{c.name}</Text>
          <Text style={styles.contributorDesc}>{c.description}</Text>
          {c.website_url && (
            <TouchableOpacity
              onPress={() => Linking.openURL(c.website_url!)}
              style={styles.linkRow}
            >
              <Ionicons name="open-outline" size={14} color={colors.navy} />
              <Text style={styles.linkText}>Visit Website</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    padding: 20,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 28,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.navy,
    marginTop: 12,
    textAlign: 'center',
  },
  heroTagline: {
    fontSize: 15,
    color: colors.mediumGray,
    marginTop: 6,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 15,
    color: colors.darkGray,
    lineHeight: 23,
    marginBottom: 14,
  },
  disclaimerBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    borderRadius: 10,
    padding: 14,
    gap: 10,
    marginVertical: 16,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: colors.darkGray,
    lineHeight: 19,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.darkGray,
    marginTop: 20,
    marginBottom: 12,
  },
  contributorCard: {
    backgroundColor: colors.offWhite,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  contributorLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  contributorName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.darkGray,
    marginBottom: 6,
  },
  contributorDesc: {
    fontSize: 14,
    color: colors.mediumGray,
    lineHeight: 20,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.navy,
  },
});
