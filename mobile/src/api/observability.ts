import * as Sentry from '@sentry/react-native';
import { env } from '../config/env';
import { normalizeApiError, type ApiErrorKind, type NormalizedApiError } from './errors';

export type ApiDomain =
  | 'auth'
  | 'profile'
  | 'discovery'
  | 'events'
  | 'matches'
  | 'moderation'
  | 'notifications';

export interface ApiFailureLogOptions {
  context?: Record<string, unknown>;
  ignoreErrorKinds?: ApiErrorKind[];
}

const DEV_LOG_DEDUPE_WINDOW_MS = 30_000;
const recentDevLogs = new Map<string, number>();

function compactContext(context: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(context).filter(([, value]) => value !== undefined),
  );
}

function shouldSkipLogging(
  normalized: NormalizedApiError,
  options?: ApiFailureLogOptions,
): boolean {
  if (normalized.transport === 'cancelled') return true;
  return options?.ignoreErrorKinds?.includes(normalized.kind) ?? false;
}

function shouldLogInDev(key: string): boolean {
  const now = Date.now();
  const previous = recentDevLogs.get(key);

  if (previous !== undefined && now - previous < DEV_LOG_DEDUPE_WINDOW_MS) {
    return false;
  }

  recentDevLogs.set(key, now);
  return true;
}

export function logApiFailure(
  domain: ApiDomain,
  action: string,
  error: unknown,
  options: ApiFailureLogOptions = {},
): NormalizedApiError {
  const normalized = normalizeApiError(error);
  const failureContext = compactContext({
    ...(options.context ?? {}),
    status: normalized.status,
    code: normalized.code,
    kind: normalized.kind,
    transport: normalized.transport,
    transient: normalized.transient,
    message: normalized.message,
    debugMessage: normalized.debugMessage,
    fingerprint: normalized.fingerprint,
    isNetworkError: normalized.isNetworkError,
    retryable: normalized.retryable,
  });

  if (shouldSkipLogging(normalized, options)) {
    return normalized;
  }

  if (env.sentryDsn) {
    Sentry.addBreadcrumb({
      category: 'api',
      type: 'error',
      level: normalized.transient ? 'warning' : 'error',
      message: `[api:${domain}] ${action} failed`,
      data: {
        domain,
        action,
        ...failureContext,
      },
    });
  }

  if (__DEV__ && shouldLogInDev(`${domain}:${action}:${normalized.fingerprint}`)) {
    const logLevel = normalized.transient ? 'warn' : 'error';
    console[logLevel](`[api:${domain}] ${action} failed`, failureContext);
  }

  return normalized;
}

export function logTransientApiClientFailure(
  requestLabel: string,
  status: number | undefined,
  errorMessage: string,
): void {
  if (env.sentryDsn) {
    Sentry.addBreadcrumb({
      category: 'api',
      level: 'warning',
      message: `${requestLabel} failed`,
      data: {
        requestLabel,
        status,
        errorMessage,
        hasResponse: status !== undefined,
      },
    });
  }

  if (__DEV__ && shouldLogInDev(`client:${requestLabel}:${status ?? 'network'}`)) {
    const logLevel = status && status >= 500 ? 'error' : 'warn';
    console[logLevel]('[api-client] request failed', {
      requestLabel,
      status,
      errorMessage,
    });
  }
}
