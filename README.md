# WY Resource Map — Mobile App

A native iOS and Android app that helps young people ages 11–20 find youth-serving resources across Wyoming. Built with React Native and Expo.

**Developed by [Casper Youth Hub](https://www.casperyouthhub.org/) in partnership with [Unicorn Solutions](https://www.unicornsolutions.org/).**

## Features

- **Interactive Map** — Full-screen native map (Apple MapKit on iOS, Google Maps on Android) with category-colored markers and donut-chart cluster indicators
- **Category Filtering** — Tap category pills (Counseling, Psychiatric Care, Substance Use, Crisis Services) for instant filtering, plus advanced filters for location, cost, age, and more
- **Search** — Full-text search across all resource fields
- **Near Me** — GPS-based proximity sorting to find the closest resources
- **Saved Resources** — Bookmark resources for quick access, persisted locally
- **Detail View** — Full listing info with tap-to-call, directions, share, and website links
- **Offline Support** — Cached data with 15-minute refresh so the app works without connectivity
- **Privacy First** — No accounts, no analytics, no tracking. Location never leaves the device.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.83 via Expo SDK 55 (managed workflow) |
| Language | TypeScript |
| Navigation | React Navigation 7 (bottom tabs + native stack) |
| Map | react-native-maps + react-native-map-clustering |
| Bottom Sheet | @gorhom/bottom-sheet 5 |
| SVG | react-native-svg (donut chart clusters) |
| Location | expo-location |
| Storage | @react-native-async-storage/async-storage |
| Backend API | https://casperyouthhubmap.org (Node.js/Express/PostgreSQL) |

## Project Structure

```
├── App.tsx                    # Entry point
├── src/
│   ├── config/
│   │   └── siteConfig.ts      # App config, colors, category mappings
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── utils/
│   │   └── filters.ts          # Filtering, formatting, distance calc
│   ├── hooks/
│   │   ├── useListings.ts      # API fetch + caching hook
│   │   ├── useFilters.ts       # Filter state management hook
│   │   └── useSaved.ts         # Saved resources persistence hook
│   ├── components/
│   │   ├── ListingCard.tsx      # Resource card component
│   │   └── FilterSheet.tsx      # Filter modal with all filter options
│   ├── screens/
│   │   ├── MapScreen.tsx        # Main map + bottom sheet + markers
│   │   ├── DetailScreen.tsx     # Full resource detail view
│   │   ├── SavedScreen.tsx      # Saved resources list
│   │   ├── MoreScreen.tsx       # More menu (About, Resources, etc.)
│   │   ├── AboutScreen.tsx      # About page
│   │   └── ResourcesScreen.tsx  # Additional resources list
│   └── navigation/
│       └── index.tsx            # Tab + stack navigator setup
├── assets/                     # App icons, splash screen
├── app.json                    # Expo configuration
├── eas.json                    # EAS Build + Submit config
├── PRIVACY_POLICY.md           # App privacy policy
├── STORE_LISTING.md            # App Store / Play Store metadata
└── PUBLISHING_GUIDE.md         # Step-by-step publishing instructions
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- [EAS CLI](https://docs.expo.dev/eas/) (`npm install -g eas-cli`)
- For iOS builds: macOS with Xcode 15+
- For Android builds: Android Studio (optional, EAS builds in the cloud)

### Install & Run

```bash
# Clone the repo
git clone https://github.com/cajun1689/cyh-mapping-mobile.git
cd cyh-mapping-mobile

# Install dependencies
npm install

# Start the dev server
npx expo start
```

**Run on device:** Scan the QR code with the Expo Go app (iOS/Android).

**Run on simulator:**
- iOS: Press `i` in the terminal (requires Xcode + iOS Simulator)
- Android: Press `a` (requires Android Studio + emulator)

### Build for Production

```bash
# Login to EAS
eas login

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production
```

See [PUBLISHING_GUIDE.md](./PUBLISHING_GUIDE.md) for full App Store and Play Store submission instructions.

## API

The app fetches data from two endpoints on the existing web backend:

| Endpoint | Returns |
|----------|---------|
| `GET /api/listings` | Array of all resource listings |
| `GET /api/meta` | Categories, cities, keywords, sponsors |

No authentication required. Data is cached locally for 15 minutes.

## Configuration

All app-wide settings are in `src/config/siteConfig.ts`:

- **API_BASE** — Backend URL
- **colors** — App color palette
- **categoryColors** — Map marker colors per category
- **categoryIcons** — Ionicons per category
- **siteConfig** — App name, about text, map center, forms, resources

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -m "Add my feature"`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

This project is maintained by Casper Youth Hub. Contact info@casperyouthhub.org for licensing inquiries.

## Acknowledgments

- **Casper Youth Hub** — Project lead and content curation
- **Unicorn Solutions** — Development partner
- **Mapping Action Collective** — Original Oregon Youth Resource Map codebase
