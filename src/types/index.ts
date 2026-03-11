export interface Listing {
  guid: number;
  full_name: string;
  parent_organization?: string;
  category: string;
  description?: string;
  eligibility_requirements?: string;
  min_age?: number;
  max_age?: number;
  age_group?: string;
  services_provided?: string;
  keywords?: string[];
  cost_keywords?: string[];
  website?: string;
  program_email?: string;
  full_address?: string;
  intake_instructions?: string;
  text_message_instructions?: string;
  phone_label_1?: string;
  phone_1?: string;
  phone_1_ext?: string;
  phone_label_2?: string;
  phone_2?: string;
  phone_2_ext?: string;
  crisis_line_label?: string;
  crisis_line_number?: string;
  financial_information?: string;
  languages_offered?: string;
  building_description?: string;
  ada_accessibility_notes?: string;
  transit_instructions?: string;
  blog_link?: string;
  twitter_link?: string;
  facebook_link?: string;
  youtube_link?: string;
  instagram_link?: string;
  tiktok_link?: string;
  covid_message?: string;
  city?: string;
  agency_verified?: string;
  date_agency_verified?: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  office_entrance_image_url?: string;
  internal_directions?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
}

export interface FormattedListing extends Omit<Listing, 'latitude' | 'longitude'> {
  coords: [number, number];
  cost?: string[];
}

export interface CategoryIcons {
  [category: string]: { icon: string };
}

export interface CategoryTree {
  [parent: string]: { [sub: string]: number };
}

export interface Sponsor {
  name: string;
  logo_url: string;
  website_url?: string;
}

export interface Resource {
  name: string;
  description: string;
  link: string;
}

export interface Meta {
  listingCategoryIcons: CategoryIcons;
  listingCategories: CategoryTree;
  listingCities: Record<string, number>;
  listingKeywords: Record<string, number>;
  resources: Resource[];
  sponsors: Sponsor[];
}

export interface Filters {
  search: string;
  city: string;
  tag: string;
  costKeyword: string;
  age: string;
  ageGroup: 'all' | 'Youth' | 'Adult';
  hideFaithBased: boolean;
  category: string;
}
