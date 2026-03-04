export const API_BASE = 'https://casperyouthhubmap.org';

export const siteConfig = {
  siteName: 'Wyoming Youth Resource Map',
  siteNameShort: 'WY Resource Map',
  organizationName: 'Casper Youth Hub',
  partnerName: 'Unicorn Solutions',
  tagline: 'Find youth-serving resources across Wyoming for ages 11\u201320',
  description:
    'Wyoming Youth Resource Map \u2014 find youth-serving resources across Wyoming for ages 11-20',

  mapCenter: { latitude: 42.8666, longitude: -106.3131 },
  mapZoom: 7,
  mapDelta: { latitudeDelta: 5.5, longitudeDelta: 5.5 },
  state: 'Wyoming',
  ageRange: { min: 11, max: 20 },

  aboutText: [
    'The Wyoming Youth Resource Map, developed by Casper Youth Hub, in partnership with Unicorn Solutions, is designed to help young people ages 11-20 and their allies connect to youth-serving resources, organizations, and leadership opportunities across Wyoming.',
    'The map centers youth needs and voices, and includes services for health and mental healthcare, housing, education, and more.',
    'This tool was adapted from the Oregon Youth Resource Map, originally created by the Mapping Action Collective, in partnership with Youth and Young Adult Leaders from across the state of Oregon for the Healthy Transitions program, and customized for Wyoming youth by the Casper Youth Hub.',
  ],

  disclaimer:
    'Please contact providers ahead of time, as hours and services may change. This map is not updated in real time.',

  contributors: [
    {
      name: 'Casper Youth Hub',
      description:
        'The Casper Youth Hub connects young people ages 11-20 with resources, services, and opportunities across Wyoming.',
    },
    {
      name: 'Unicorn Solutions',
      description:
        'Unicorn Solutions partnered with Casper Youth Hub to develop and deploy the Wyoming Youth Resource Map.',
    },
    {
      name: 'Mapping Action Collective',
      logo: 'https://i.postimg.cc/9M28z2Kv/mac-logo.png',
      website_url: 'https://mappingaction.org/',
      description:
        'The Mapping Action Collective (MAC) uses mapping, data, and technology to support their community and beyond. MAC wrote the original code and organized the database that powers this resource map.',
    },
  ] as { name: string; description: string; logo?: string; website_url?: string }[],

  moreResources: [
    {
      link: 'https://www.211.org/',
      name: '211 \u2014 Wyoming',
      description:
        'Dial 2-1-1 or visit 211.org to find local resources for food, housing, health care, employment, and more.',
    },
    {
      link: 'https://www.crisistextline.org/resources/',
      name: 'National Crisis Resources (Crisis Text Line)',
      description:
        'List of resources curated & vetted by a national crisis text line service. Resources are all free or low-cost, and available for viewing on mobile phones.',
    },
  ],

  forms: {
    feedback:
      'https://docs.google.com/forms/d/e/1FAIpQLSeb_tpvHqV6t2Ktj93an6V0mEY0fBZXF8FvV33TgQ_2AvNW0w/viewform',
    provider:
      'https://docs.google.com/forms/d/e/1FAIpQLScdjDQLmLPG3gqDndITzxdchkG0yJkemaZ5gwJvYLd-fC_JFA/viewform',
  },
} as const;

export const colors = {
  navy: '#1B3A4B',
  gold: '#F2C94C',
  white: '#FFFFFF',
  offWhite: '#F5F6F8',
  lightGray: '#E8E8E8',
  mediumGray: '#999999',
  darkGray: '#333333',
  black: '#111111',
  danger: '#E74C3C',
  success: '#27AE60',
  cardShadow: 'rgba(0,0,0,0.08)',
} as const;

export const categoryColors: Record<string, string> = {
  'Counseling': '#4A90D9',
  'Psychiatric Care': '#9B59B6',
  'Substance Use': '#27AE60',
  'Crisis Services': '#E74C3C',
};

export const defaultCategoryColor = '#7F8C8D';

export const categoryIcons: Record<string, string> = {
  'Counseling': 'chatbubbles-outline',
  'Psychiatric Care': 'medkit-outline',
  'Substance Use': 'shield-checkmark-outline',
  'Crisis Services': 'call-outline',
};
