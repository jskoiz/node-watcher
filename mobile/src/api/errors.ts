import axios from 'axios';
import type { ApiErrorPayload } from './types';

export type ApiErrorKind =
    | 'unauthorized'
    | 'forbidden'
    | 'not_found'
    | 'rate_limited'
    | 'server_error'
    | 'service_unavailable'
    | 'network'
    | 'unknown';

export interface NormalizedApiError {
    message: string;
    status?: number;
    code?: string;
    kind: ApiErrorKind;
    isNetworkError: boolean;
    isUnauthorized: boolean;
    retryable: boolean;
    transient: boolean;
    transport: 'http' | 'network' | 'timeout' | 'cancelled' | 'unknown';
    debugMessage?: string;
    serverMessage?: string;
    fingerprint: string;
    /** Seconds to wait before retrying (parsed from Retry-After header). */
    retryAfterSeconds?: number;
}

const STATUS_MESSAGES: Record<number, string> = {
    400: 'Please review your input and try again.',
    401: 'Your session expired. Please sign in again.',
    403: 'You don\u2019t have permission to do that.',
    404: 'That item was not found or is no longer available.',
    409: 'This request conflicts with the current state. Refresh and try again.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'BRDG hit a server error. Please try again in a moment.',
    503: 'Service is temporarily unavailable. Please try again shortly.',
    504: 'The server took too long to respond. Please try again.',
};

function classifyStatus(status: number | undefined): { kind: ApiErrorKind; retryable: boolean } {
    if (!status) return { kind: 'network', retryable: true };
    switch (status) {
        case 401:
            return { kind: 'unauthorized', retryable: false };
        case 403:
            return { kind: 'forbidden', retryable: false };
        case 404:
            return { kind: 'not_found', retryable: false };
        case 429:
            return { kind: 'rate_limited', retryable: true };
        case 503:
            return { kind: 'service_unavailable', retryable: true };
        default:
            if (status >= 500) return { kind: 'server_error', retryable: true };
            return { kind: 'unknown', retryable: false };
    }
}

function extractPayloadMessage(data: ApiErrorPayload | undefined): string | undefined {
    if (!data) return undefined;

    const candidates = [data.message, data.error] as unknown[];

    for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.trim()) {
            return candidate.trim();
        }

        if (Array.isArray(candidate)) {
            const joined = candidate
                .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
                .join(', ');

            if (joined) {
                return joined;
            }
        }
    }

    return undefined;
}

function getTransport(
    isAxiosError: boolean,
    code: string | undefined,
    hasResponse: boolean,
): NormalizedApiError['transport'] {
    if (!isAxiosError) {
        return 'unknown';
    }

    if (code === 'ERR_CANCELED') {
        return 'cancelled';
    }

    if (code === 'ECONNABORTED') {
        return 'timeout';
    }

    if (!hasResponse) {
        return 'network';
    }

    return 'http';
}

function buildFingerprint(
    kind: ApiErrorKind,
    status: number | undefined,
    code: string | undefined,
    transport: NormalizedApiError['transport'],
): string {
    return [kind, status ?? 'none', code ?? 'none', transport].join(':');
}

/**
 * Parse a Retry-After header value into seconds.
 * Supports both delta-seconds ("120") and HTTP-date ("Thu, 01 Jan 2026 00:00:00 GMT") formats.
 * Returns undefined if the header is missing or unparseable.
 */
export function parseRetryAfter(headerValue: string | undefined | null): number | undefined {
    if (!headerValue) return undefined;

    const trimmed = headerValue.trim();

    // delta-seconds: a bare non-negative integer
    if (/^\d+$/.test(trimmed)) {
        const seconds = Number(trimmed);
        return seconds >= 0 ? seconds : undefined;
    }

    // HTTP-date
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
        const seconds = Math.max(0, Math.ceil((date.getTime() - Date.now()) / 1000));
        return seconds;
    }

    return undefined;
}

export function normalizeApiError(error: unknown): NormalizedApiError {
    if (axios.isAxiosError<ApiErrorPayload>(error)) {
        const status = error.response?.status;
        const data = error.response?.data;
        const transport = getTransport(true, error.code, Boolean(error.response));
        const baseClassification = classifyStatus(status);
        const kind = transport === 'cancelled' ? 'unknown' : baseClassification.kind;
        const retryable = transport === 'cancelled' ? false : baseClassification.retryable;
        const serverMessage = extractPayloadMessage(data);
        const fallbackMessage =
            transport === 'cancelled'
                ? 'This request was cancelled.'
                : transport === 'timeout'
                  ? 'The request timed out. Check your connection and try again.'
                  : transport === 'network'
                    ? 'Unable to reach BRDG. Check your connection and try again.'
                    : (status && STATUS_MESSAGES[status]) ||
                      (status && status >= 500
                          ? 'BRDG hit a server error. Please try again soon.'
                          : undefined) ||
                      'Something went wrong. Please try again.';
        const message = serverMessage || fallbackMessage;

        const retryAfterHeader = error.response?.headers?.['retry-after'] as
            | string
            | undefined;
        const transient =
            transport !== 'cancelled' &&
            (retryable || transport === 'network' || transport === 'timeout');

        return {
            message,
            status,
            code: data?.code,
            kind,
            isNetworkError: !error.response && transport !== 'cancelled',
            isUnauthorized: status === 401,
            retryable,
            transient,
            transport,
            debugMessage: error.message,
            serverMessage,
            fingerprint: buildFingerprint(kind, status, data?.code, transport),
            retryAfterSeconds: parseRetryAfter(retryAfterHeader),
        };
    }

    if (error instanceof Error) {
        return {
            message: error.message,
            kind: 'unknown',
            isNetworkError: false,
            isUnauthorized: false,
            retryable: false,
            transient: false,
            transport: 'unknown',
            debugMessage: error.message,
            fingerprint: buildFingerprint('unknown', undefined, undefined, 'unknown'),
        };
    }

    return {
        message: 'Unexpected error occurred.',
        kind: 'unknown',
        isNetworkError: false,
        isUnauthorized: false,
        retryable: false,
        transient: false,
        transport: 'unknown',
        fingerprint: buildFingerprint('unknown', undefined, undefined, 'unknown'),
    };
}
