import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../constants/storage';
import { buildInfo, type BuildProvenance } from './buildInfo';

type StoredBuildProvenanceByBinary = Record<string, BuildProvenance>;

export type ResolvedBuildDisplayInfo = {
  appEnv: string;
  apiBaseUrl: string | null;
  version: string;
  iosBuildNumber: string;
  binaryBranch: string;
  binaryGitSha: string;
  binaryBuiltAt: string;
  binaryReleasePath: string;
  binaryProvenanceSource: 'current-manifest' | 'stored-native' | 'native-version-only';
  bundleBranch: string;
  bundleGitSha: string;
  bundleBuiltAt: string;
  bundleReleasePath: string;
};

function normalizeString(value: string | null | undefined) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getBinaryStorageKey(
  nativeVersion: string | null | undefined,
  nativeBuildVersion: string | null | undefined,
) {
  const version = normalizeString(nativeVersion);
  const buildVersion = normalizeString(nativeBuildVersion);
  if (!version || !buildVersion) {
    return null;
  }

  return `${version}+${buildVersion}`;
}

function parseStoredBuildProvenance(rawValue: string | null) {
  if (!rawValue) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return Object.entries(parsed).reduce<StoredBuildProvenanceByBinary>((acc, [key, value]) => {
      if (!normalizeString(key) || !value || typeof value !== 'object' || Array.isArray(value)) {
        return acc;
      }

      const candidate = value as Partial<BuildProvenance>;
      acc[key] = {
        appEnv: normalizeString(candidate.appEnv) ?? 'unknown',
        apiBaseUrl: normalizeString(candidate.apiBaseUrl) ?? null,
        version: normalizeString(candidate.version) ?? 'unknown',
        iosBuildNumber: normalizeString(candidate.iosBuildNumber) ?? 'unknown',
        androidVersionCode: normalizeString(candidate.androidVersionCode) ?? 'unknown',
        gitBranch: normalizeString(candidate.gitBranch) ?? 'unknown',
        gitSha: normalizeString(candidate.gitSha) ?? 'unknown',
        gitShortSha: normalizeString(candidate.gitShortSha) ?? 'unknown',
        buildDate: normalizeString(candidate.buildDate) ?? 'unknown',
        buildDateSource:
          candidate.buildDateSource === 'scripted' ||
          candidate.buildDateSource === 'runtime-generated'
            ? candidate.buildDateSource
            : 'unknown',
        releaseMode: normalizeString(candidate.releaseMode) ?? 'unknown',
        releaseProfile: normalizeString(candidate.releaseProfile) ?? null,
        provenanceSource:
          candidate.provenanceSource === 'scripted-release'
            ? 'scripted-release'
            : 'runtime-derived',
      };
      return acc;
    }, {});
  } catch {
    return {};
  }
}

export function isScriptedBinaryProvenance(info: BuildProvenance) {
  return info.provenanceSource === 'scripted-release' && info.releaseMode !== 'runtime';
}

async function readStoredBuildProvenanceByBinary() {
  const stored = await AsyncStorage.getItem(STORAGE_KEYS.buildProvenanceByBinary);
  return parseStoredBuildProvenance(stored);
}

export async function ensureStoredBuildProvenance({
  currentBuildInfo = buildInfo,
  nativeVersion = Application.nativeApplicationVersion,
  nativeBuildVersion = Application.nativeBuildVersion,
}: {
  currentBuildInfo?: BuildProvenance;
  nativeVersion?: string | null;
  nativeBuildVersion?: string | null;
} = {}) {
  const binaryKey = getBinaryStorageKey(nativeVersion, nativeBuildVersion);
  if (!binaryKey) {
    return null;
  }

  try {
    const stored = await readStoredBuildProvenanceByBinary();
    if (stored[binaryKey]) {
      return stored[binaryKey];
    }

    if (!isScriptedBinaryProvenance(currentBuildInfo)) {
      return null;
    }

    const nextStored = {
      ...stored,
      [binaryKey]: currentBuildInfo,
    };

    await AsyncStorage.setItem(
      STORAGE_KEYS.buildProvenanceByBinary,
      JSON.stringify(nextStored),
    );

    return currentBuildInfo;
  } catch {
    return null;
  }
}

export function deriveResolvedBuildDisplayInfo({
  currentBuildInfo = buildInfo,
  storedBinaryBuildInfo = null,
  nativeVersion = Application.nativeApplicationVersion,
  nativeBuildVersion = Application.nativeBuildVersion,
}: {
  currentBuildInfo?: BuildProvenance;
  storedBinaryBuildInfo?: BuildProvenance | null;
  nativeVersion?: string | null;
  nativeBuildVersion?: string | null;
} = {}): ResolvedBuildDisplayInfo {
  const currentIsScripted = isScriptedBinaryProvenance(currentBuildInfo);
  const binaryBuildInfo = currentIsScripted
    ? currentBuildInfo
    : storedBinaryBuildInfo;

  return {
    appEnv: currentBuildInfo.appEnv,
    apiBaseUrl: currentBuildInfo.apiBaseUrl,
    version:
      normalizeString(nativeVersion) ??
      binaryBuildInfo?.version ??
      currentBuildInfo.version,
    iosBuildNumber:
      normalizeString(nativeBuildVersion) ??
      binaryBuildInfo?.iosBuildNumber ??
      currentBuildInfo.iosBuildNumber,
    binaryBranch: binaryBuildInfo?.gitBranch ?? 'unknown',
    binaryGitSha: binaryBuildInfo?.gitSha ?? 'unknown',
    binaryBuiltAt: binaryBuildInfo?.buildDate ?? 'unknown',
    binaryReleasePath: binaryBuildInfo?.releaseMode ?? 'unknown',
    binaryProvenanceSource: currentIsScripted
      ? 'current-manifest'
      : binaryBuildInfo
        ? 'stored-native'
        : 'native-version-only',
    bundleBranch: currentBuildInfo.gitBranch,
    bundleGitSha: currentBuildInfo.gitSha,
    bundleBuiltAt: currentBuildInfo.buildDate,
    bundleReleasePath: currentBuildInfo.releaseMode,
  };
}

export function useResolvedBuildDisplayInfo() {
  const [storedBinaryBuildInfo, setStoredBinaryBuildInfo] =
    useState<BuildProvenance | null>(null);

  useEffect(() => {
    let isMounted = true;

    ensureStoredBuildProvenance()
      .then((value) => {
        if (isMounted) {
          setStoredBinaryBuildInfo(value);
        }
      })
      .catch(() => {
        if (isMounted) {
          setStoredBinaryBuildInfo(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return deriveResolvedBuildDisplayInfo({ storedBinaryBuildInfo });
}
