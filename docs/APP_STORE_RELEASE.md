# BRDG App Store release checklist

This repo is now wired for EAS build profiles and production-safe mobile configuration, but App Store submission still requires a few values and assets that cannot be inferred from source code.

## Engineering baseline

- Mobile app config is driven by [`mobile/app.config.ts`](/Users/jerry/Desktop/brdg/mobile/app.config.ts) instead of placeholder identifiers in `app.json`.
- Release builds require `EXPO_PUBLIC_API_URL`, which prevents shipping a binary that points at localhost.
- The app now exposes authenticated in-app account deletion, which is required by Apple when account creation is supported.
- `mobile/eas.json` includes `development`, `preview`, and `production` build profiles.

## Required environment values

Copy [`mobile/.env.example`](/Users/jerry/Desktop/brdg/mobile/.env.example) into your local env or EAS secrets and replace:

- `EXPO_PUBLIC_API_URL` with the production backend origin
- `IOS_BUNDLE_IDENTIFIER` with the App Store bundle ID reserved in Apple Developer
- `ANDROID_PACKAGE` with the Play package name if Android release is also planned
- `EAS_PROJECT_ID` once the Expo project is linked

Current production values prepared in this workspace:

- `EXPO_PUBLIC_API_URL=https://api.brdg.social`
- `IOS_BUNDLE_IDENTIFIER=com.avmillabs.brdg`
- `ANDROID_PACKAGE=com.avmillabs.brdg`

For local release builds, [`mobile/.env.production`](/Users/jerry/Desktop/brdg/mobile/.env.production) is ready to use.

## Recommended release flow

From [`/Users/jerry/Desktop/brdg/mobile`](/Users/jerry/Desktop/brdg/mobile):

```bash
npx eas login
npx eas build --platform ios --profile production
```

If the build is intended for App Store review, submit the resulting `.ipa` through Transporter or `eas submit` after App Store Connect is configured.

If building locally with Xcode instead of EAS:

```bash
cd /Users/jerry/Desktop/brdg/mobile
xcodebuild -workspace ios/mobile.xcworkspace -scheme mobile -configuration Release -destination 'generic/platform=iOS' archive -archivePath build/BRDG.xcarchive -allowProvisioningUpdates
```

## App Store Connect items still required

- App Store app record tied to the final iOS bundle identifier
- Privacy Policy URL
- Support URL
- App description, keywords, and age rating questionnaire
- iPhone screenshots for the final production build
- Test credentials and review notes for the reviewer

## Release validation before submission

- `npm run check` in [`mobile`](/Users/jerry/Desktop/brdg/mobile)
- `npm run check:full` in [`backend`](/Users/jerry/Desktop/brdg/backend)
- Verify signup, login, onboarding, profile load, discovery feed, chat, event creation, RSVP, notifications, logout, and account deletion against the production API
