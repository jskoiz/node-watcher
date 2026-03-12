import type { ExpoConfig } from "expo/config";

const appName = process.env.EXPO_PUBLIC_APP_NAME?.trim() || "BRDG";
const slug = process.env.EXPO_PUBLIC_APP_SLUG?.trim() || "brdg";
const version = process.env.APP_VERSION?.trim() || "1.0.0";
const iosBundleIdentifier =
  process.env.IOS_BUNDLE_IDENTIFIER?.trim() || "com.avmillabs.brdg";
const androidPackage =
  process.env.ANDROID_PACKAGE?.trim() || "com.avmillabs.brdg";

const parsedAndroidVersionCode = Number.parseInt(
  process.env.ANDROID_VERSION_CODE || "1",
  10,
);
const androidVersionCode = Number.isFinite(parsedAndroidVersionCode)
  ? parsedAndroidVersionCode
  : 1;

const appEnv = process.env.APP_ENV?.trim() || "development";
const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

if (appEnv !== "development" && !apiUrl) {
  throw new Error(
    "EXPO_PUBLIC_API_URL must be set when APP_ENV is preview or production.",
  );
}

const config: ExpoConfig = {
  name: appName,
  slug,
  version,
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: slug,
  userInterfaceStyle: "light",
  newArchEnabled: true,
  runtimeVersion: {
    policy: "appVersion",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: iosBundleIdentifier,
    buildNumber: process.env.IOS_BUILD_NUMBER?.trim() || "1",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: androidPackage,
    versionCode: androidVersionCode,
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  extra: {
    appEnv,
    apiBaseUrl: apiUrl ?? null,
    ...(process.env.EAS_PROJECT_ID
      ? {
          eas: {
            projectId: process.env.EAS_PROJECT_ID,
          },
        }
      : {}),
  },
};

export default config;
