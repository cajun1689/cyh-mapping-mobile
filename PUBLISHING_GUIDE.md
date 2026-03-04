# Publishing Guide — WY Resource Map

Step-by-step instructions for publishing to the Apple App Store and Google Play Store using Expo EAS.

---

## Prerequisites

### Accounts You Need

| Account | Cost | URL |
|---------|------|-----|
| **Apple Developer Program** | $99/year | https://developer.apple.com/programs/ |
| **Google Play Console** | $25 one-time | https://play.google.com/console/signup |
| **Expo Account** | Free | https://expo.dev/signup |

### Tools to Install

```bash
npm install -g eas-cli
eas login
```

---

## Part 1: App Icons & Splash Screen

Before building, you need proper app icons. The current assets are Expo defaults.

### Requirements

| Asset | Size | Notes |
|-------|------|-------|
| `assets/icon.png` | 1024×1024 px | iOS App Store icon. No transparency, no rounded corners (iOS adds them). |
| `assets/android-icon-foreground.png` | 1024×1024 px | Android adaptive icon foreground. Keep main content in center 66% (safe zone). |
| `assets/android-icon-background.png` | 1024×1024 px | Android adaptive icon background (solid color or pattern). |
| `assets/android-icon-monochrome.png` | 1024×1024 px | Android 13+ themed icon (single color on transparent). |
| `assets/splash-icon.png` | 200×200 px | Centered on splash background color (#1B3A4B). |

### Design Suggestion

Navy (#1B3A4B) background with a gold (#F2C94C) map pin or Wyoming outline. Keep it simple — it needs to be recognizable at 29×29px on a home screen.

You can use tools like:
- [Figma](https://figma.com) — design your own
- [Icon Kitchen](https://icon.kitchen) — generate adaptive icons
- [App Icon Generator](https://www.appicon.co/) — resize for all platforms

---

## Part 2: Host the Privacy Policy

Both stores require a publicly accessible privacy policy URL.

**Option A (recommended):** Add a route to your existing site:
- Host `PRIVACY_POLICY.md` content at `https://casperyouthhubmap.org/app-privacy`

**Option B:** Use a free hosting service:
- Upload to GitHub Pages, Notion, or any public URL

Update `STORE_LISTING.md` with the final URL once hosted.

---

## Part 3: Configure EAS

### 3a. Link Your Expo Project

```bash
cd /path/to/cyh-mapping-mobile
eas init
```

This creates/links the project on your Expo dashboard.

### 3b. Update `eas.json` with Your Credentials

**For iOS** — you need your Apple Team ID and App Store Connect App ID:

1. Go to https://appstoreconnect.apple.com
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - Platform: iOS
   - Name: `WY Resource Map`
   - Primary Language: English (US)
   - Bundle ID: `org.casperyouthhub.resourcemap`
   - SKU: `wy-resource-map`
4. Note the **Apple ID** (numeric) shown on the App Information page
5. Find your **Team ID** at https://developer.apple.com/account → Membership Details

**For Android** — you need a Google Play service account key:

1. Go to https://play.google.com/console
2. Create a new app:
   - App name: `WY Resource Map`
   - Default language: English (US)
   - App or Game: App
   - Free or Paid: Free
3. Set up a service account for automated uploads:
   - Go to **Setup** → **API access** → **Create new service account**
   - Follow the Google Cloud Console link
   - Create a service account with **Service Account User** role
   - Generate a JSON key and download it
   - Back in Play Console, grant the service account **Release manager** permissions
4. Save the JSON key file somewhere secure (e.g., `~/keys/play-service-account.json`)

### 3c. Update `eas.json`

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@apple-id-email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDE12345"
      },
      "android": {
        "serviceAccountKeyPath": "~/keys/play-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

Replace the placeholder values with your actual credentials.

---

## Part 4: Build the App

### iOS Production Build

```bash
eas build --platform ios --profile production
```

- EAS will ask you to log in to your Apple Developer account
- It auto-generates provisioning profiles and certificates
- Build takes ~10-15 minutes in the cloud
- Download link appears when done

### Android Production Build

```bash
eas build --platform android --profile production
```

- Generates an `.aab` (Android App Bundle) file
- Build takes ~10-15 minutes
- Download link appears when done

### Build Both at Once

```bash
eas build --platform all --profile production
```

---

## Part 5: Submit to Stores

### 5a. Submit to Apple App Store

```bash
eas submit --platform ios --profile production
```

EAS will:
1. Upload the `.ipa` to App Store Connect
2. You'll see it appear in **TestFlight** within ~15 minutes

Then in App Store Connect (https://appstoreconnect.apple.com):
1. Go to your app → **App Store** tab
2. Fill in:
   - **Description** — Copy from `STORE_LISTING.md`
   - **Keywords** — Copy from `STORE_LISTING.md`
   - **Support URL** — `https://casperyouthhubmap.org`
   - **Privacy Policy URL** — Your hosted privacy policy URL
   - **Category** — Reference
   - **Age Rating** — Complete the questionnaire (select "None" for all content questions → rating will be 4+)
3. Add **Screenshots** (see below)
4. Select the build from TestFlight
5. Click **Submit for Review**

**Review timeline:** Typically 24-48 hours for first submission.

### 5b. Submit to Google Play Store

```bash
eas submit --platform android --profile production
```

EAS will:
1. Upload the `.aab` to the **Internal testing** track

Then in Google Play Console (https://play.google.com/console):
1. Complete the **Store listing**:
   - Short description — Copy from `STORE_LISTING.md`
   - Full description — Copy from `STORE_LISTING.md`
   - App icon — Upload your 512×512 icon
   - Feature graphic — 1024×500 banner image
   - Screenshots — At least 2 phone screenshots
2. Complete **Content rating** questionnaire
3. Complete **Target audience** (select 13+ since the app serves ages 11-20)
4. Set **Privacy policy URL**
5. Under **App content**, complete Data Safety:
   - Location: Collected, not shared, optional (for Near Me feature)
   - No other data collected
6. Move build from Internal → **Production** track
7. Click **Submit for Review**

**Review timeline:** Typically 1-7 days for first submission.

---

## Part 6: Screenshots

Both stores require screenshots. Here's how to capture them:

### Using iOS Simulator

```bash
# Run on a specific simulator
npx expo run:ios --device "iPhone 16 Pro Max"

# Take screenshot (saves to Desktop)
# Use Cmd+S in Simulator, or:
xcrun simctl io booted screenshot ~/Desktop/screenshot.png
```

### Needed Screenshots (5 per device size)

1. **Map view** — Full map of Wyoming with colored markers visible
2. **Card list** — Bottom sheet pulled to half showing resource cards
3. **Filters** — Filter sheet open showing filter options
4. **Detail** — A specific resource's detail screen
5. **Saved** — Saved tab with a few bookmarked resources

### Required Sizes

| Store | Device | Resolution |
|-------|--------|-----------|
| iOS | iPhone 6.7" (iPhone 15 Pro Max) | 1290×2796 |
| iOS | iPhone 6.1" (iPhone 15 Pro) | 1179×2556 |
| Play Store | Phone | Min 320px, max 3840px, 16:9 or 9:16 |

---

## Part 7: Updates

After initial release, pushing updates is simple:

```bash
# For code-only changes (no native module changes):
eas update --branch production --message "Description of changes"

# For changes that require a new native build:
eas build --platform all --profile production
eas submit --platform all --profile production
```

EAS Update delivers JavaScript-only changes instantly (no store review needed). Native changes require a new build + store review.

---

## Quick Reference

```bash
# Development
npx expo start                                    # Start dev server
eas build --platform ios --profile development     # Dev build (iOS)
eas build --platform android --profile development # Dev build (Android)

# Production
eas build --platform all --profile production      # Build both platforms
eas submit --platform ios --profile production      # Submit to App Store
eas submit --platform android --profile production  # Submit to Play Store

# Over-the-air updates (JS-only changes)
eas update --branch production --message "Bug fix"
```

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| `eas build` fails on iOS signing | Run `eas credentials` to manage certificates |
| Build fails with native module error | Clear cache: `npx expo start --clear` then rebuild |
| App rejected for missing privacy policy | Host `PRIVACY_POLICY.md` at a public URL and add it to store listing |
| App rejected for screenshots | Ensure screenshots show real app content, not placeholder/mockup |
| Android upload fails | Check service account has **Release manager** role in Play Console |
| iOS "Missing Compliance" warning | Already handled — `usesNonExemptEncryption: false` is set in app.json |

---

## Estimated Costs

| Item | Cost |
|------|------|
| Apple Developer Program | $99/year |
| Google Play Console | $25 one-time |
| EAS Build (free tier) | 30 builds/month free |
| EAS Submit | Free |
| Total first year | ~$124 |
| Total subsequent years | ~$99/year |
