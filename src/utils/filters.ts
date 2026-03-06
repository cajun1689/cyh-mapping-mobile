import { Listing, FormattedListing, Filters } from '../types';

const SEMANTIC_COLORS = [
  'green', 'teal', 'blue', 'violet', 'purple',
  'pink', 'red', 'orange', 'yellow', 'olive',
];

export const getColor = (index: number): string =>
  SEMANTIC_COLORS[index % SEMANTIC_COLORS.length];

export const titleCaseKey = (key: string): string =>
  key.charAt(0).toUpperCase() + key.slice(1);

export const formatSocialMediaUrl = (url: string): string => {
  if (url.includes('https://www.')) return url.split('https://www.')[1];
  if (url.includes('https://')) return url.split('https://')[1];
  if (url.includes('http://')) return url.split('http://')[1];
  return url;
};

export const getCityCount = (listings: Listing[]): Record<string, number> => {
  const cityCount: Record<string, number> = {};
  for (const listing of listings) {
    if (listing.city) {
      cityCount[listing.city] = (cityCount[listing.city] || 0) + 1;
    }
  }
  return cityCount;
};

const HIDDEN_KEYWORDS = ['Faith-Based'];

export const getKeywordCount = (listings: Listing[]): Record<string, number> => {
  const keywordCount: Record<string, number> = {};
  for (const listing of listings) {
    if (listing.keywords) {
      for (const keyword of listing.keywords) {
        if (HIDDEN_KEYWORDS.includes(keyword)) continue;
        keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
      }
    }
  }
  return keywordCount;
};

export const COST_KEYWORDS = [
  'OHP', 'Private Insurance', 'Financial Aid Available', 'Free',
  'Accepts Uninsured', 'Sliding Scale', 'Low Cost', 'Medicare / Medicaid',
];

export const getCostCount = (listings: Listing[]): Record<string, number> => {
  const costCount: Record<string, number> = {};
  for (const listing of listings) {
    if (listing.cost_keywords) {
      for (const keyword of listing.cost_keywords) {
        costCount[keyword] = (costCount[keyword] || 0) + 1;
      }
    }
  }
  return costCount;
};

export const getCategoryCount = (
  listings: Listing[],
): Record<string, Record<string, number>> => {
  const categories: Record<string, Record<string, number>> = {};
  for (const listing of listings) {
    if (!listing.category) continue;
    const [parent, sub] = listing.category.split(': ');
    if (!categories[parent]) categories[parent] = {};
    const subKey = sub || 'General';
    categories[parent][subKey] = (categories[parent][subKey] || 0) + 1;
  }
  return categories;
};

export function formatListings(listings: Listing[]): FormattedListing[] {
  return listings.map(({ latitude, longitude, ...rest }) => ({
    ...rest,
    coords: [
      typeof latitude === 'string' ? parseFloat(latitude) : Number(latitude),
      typeof longitude === 'string' ? parseFloat(longitude) : Number(longitude),
    ] as [number, number],
    cost: rest.cost_keywords?.length ? rest.cost_keywords : undefined,
  }));
}

export function filterListings(
  listings: FormattedListing[],
  filters: Filters,
  hidden: number[] = [],
  savedGuids?: number[],
): FormattedListing[] {
  if (savedGuids) {
    return listings.filter((l) => savedGuids.includes(l.guid));
  }

  return listings.filter((listing) => {
    if (hidden.includes(listing.guid)) return false;

    if (filters.hideFaithBased) {
      if (listing.keywords?.includes('Faith-Based')) return false;
      if (listing.category?.startsWith('Faith Based')) return false;
    }

    if (filters.ageGroup !== 'all') {
      const group = listing.age_group || 'Youth and Adult';
      if (filters.ageGroup === 'Youth' && group === 'Adult') return false;
      if (filters.ageGroup === 'Adult' && group === 'Youth') return false;
    }

    const allText = Object.entries(listing).join(' ').toLowerCase();

    if (filters.tag && !allText.includes(filters.tag.toLowerCase())) {
      return false;
    }

    if (filters.search && !allText.includes(filters.search.toLowerCase())) {
      return false;
    }

    if (filters.city && listing.city !== filters.city) return false;

    if (
      filters.costKeyword &&
      (!listing.cost_keywords || !listing.cost_keywords.includes(filters.costKeyword))
    ) {
      return false;
    }

    if (filters.category) {
      const listingCat = listing.category || '';
      if (
        !listingCat.startsWith(filters.category) &&
        listingCat !== filters.category
      ) {
        return false;
      }
    }

    if (filters.age) {
      const age = parseInt(filters.age, 10);
      if (!isNaN(age)) {
        if (listing.max_age && age > listing.max_age) return false;
        if (listing.min_age && age < listing.min_age) return false;
      }
    }

    return true;
  });
}

export function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 3959; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
