import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import * as Updates from 'expo-updates';
import { STORAGE_KEYS } from '../../constants/storage';

type StoredOtaReceipts = Record<string, string>;

export type CurrentOtaInfo = {
  isEnabled: boolean;
  updateId: string | null;
  shortUpdateId: string | null;
  channel: string | null;
  runtimeVersion: string | null;
  launchSource: 'downloaded' | 'embedded' | 'disabled';
  launchSourceLabel: string;
  publishedAt: string | null;
  publishedSummary: string;
  firstSeenAt: string | null;
  firstSeenSummary: string;
  headerLabel: string;
};

function normalizeString(value: string | null | undefined) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeUpdateId(value: string | null | undefined) {
  const normalized = normalizeString(value);
  if (!normalized) {
    return null;
  }

  return normalized.toLowerCase();
}

function normalizeDate(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseStoredReceipts(rawValue: string | null): StoredOtaReceipts {
  if (!rawValue) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return Object.entries(parsed).reduce<StoredOtaReceipts>((acc, [key, value]) => {
      const normalizedKey = normalizeUpdateId(key);
      const normalizedValue = normalizeDate(typeof value === 'string' ? value : null)?.toISOString();

      if (normalizedKey && normalizedValue) {
        acc[normalizedKey] = normalizedValue;
      }

      return acc;
    }, {});
  } catch {
    return {};
  }
}

export function formatRelativeAge(
  value: Date | string | null | undefined,
  now: Date = new Date(),
) {
  const date = normalizeDate(value);
  if (!date) {
    return null;
  }

  const diffMs = Math.max(0, now.getTime() - date.getTime());

  if (diffMs < 60_000) {
    return 'just now';
  }

  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) {
    return `${diffWeeks}w ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths}mo ago`;
  }

  return `${Math.floor(diffDays / 365)}y ago`;
}

function formatTimestampSummary(
  value: Date | string | null | undefined,
  now: Date = new Date(),
) {
  const date = normalizeDate(value);
  if (!date) {
    return null;
  }

  const relative = formatRelativeAge(date, now);
  return relative ? `${date.toISOString()} (${relative})` : date.toISOString();
}

async function readStoredReceipts() {
  const stored = await AsyncStorage.getItem(STORAGE_KEYS.otaUpdateFirstSeenById);
  return parseStoredReceipts(stored);
}

export async function ensureCurrentOtaFirstSeenAt(now: Date = new Date()) {
  const updateId = normalizeUpdateId(Updates.updateId);
  if (!updateId) {
    return null;
  }

  try {
    const receipts = await readStoredReceipts();
    const existing = normalizeDate(receipts[updateId])?.toISOString() ?? null;
    if (existing) {
      return existing;
    }

    const nextValue = now.toISOString();
    await AsyncStorage.setItem(
      STORAGE_KEYS.otaUpdateFirstSeenById,
      JSON.stringify({
        ...receipts,
        [updateId]: nextValue,
      }),
    );
    return nextValue;
  } catch {
    return null;
  }
}

export function getCurrentOtaInfo({
  now = new Date(),
  firstSeenAt = null,
}: {
  now?: Date;
  firstSeenAt?: string | null;
} = {}): CurrentOtaInfo {
  const updateId = normalizeUpdateId(Updates.updateId);
  const shortUpdateId = updateId?.slice(0, 8) ?? null;
  const createdAt = normalizeDate(Updates.createdAt);
  const normalizedFirstSeenAt = normalizeDate(firstSeenAt);
  const channel = normalizeString(Updates.channel);
  const runtimeVersion = normalizeString(Updates.runtimeVersion);

  const launchSource: CurrentOtaInfo['launchSource'] = !Updates.isEnabled
    ? 'disabled'
    : Updates.isEmbeddedLaunch
      ? 'embedded'
      : 'downloaded';

  const launchSourceLabel =
    launchSource === 'downloaded'
      ? 'downloaded OTA'
      : launchSource === 'embedded'
        ? 'embedded bundle'
        : 'updates unavailable';

  const headerLabel =
    launchSource === 'downloaded' && shortUpdateId
      ? `Build Info - OTA ${shortUpdateId}`
      : launchSource === 'embedded' && shortUpdateId
        ? `Build Info - Embedded ${shortUpdateId}`
        : launchSource === 'embedded'
          ? 'Build Info - Embedded'
          : 'Build Info';

  return {
    isEnabled: Updates.isEnabled,
    updateId,
    shortUpdateId,
    channel,
    runtimeVersion,
    launchSource,
    launchSourceLabel,
    publishedAt: createdAt?.toISOString() ?? null,
    publishedSummary: formatTimestampSummary(createdAt, now) ?? 'unknown',
    firstSeenAt: normalizedFirstSeenAt?.toISOString() ?? null,
    firstSeenSummary:
      formatTimestampSummary(normalizedFirstSeenAt, now) ??
      (updateId ? 'not recorded yet' : 'unavailable'),
    headerLabel,
  };
}

export function useCurrentOtaInfo() {
  const [firstSeenAt, setFirstSeenAt] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let isMounted = true;

    ensureCurrentOtaFirstSeenAt()
      .then((value) => {
        if (isMounted) {
          setFirstSeenAt(value);
        }
      })
      .catch(() => {
        if (isMounted) {
          setFirstSeenAt(null);
        }
      });

    const intervalId = setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return getCurrentOtaInfo({ now, firstSeenAt });
}
