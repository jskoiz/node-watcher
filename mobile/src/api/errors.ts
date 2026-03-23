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
    /** Seconds to wait before retrying (parsed from Retry-After header). */
    retryAfterSeconds?: number;
}

const STATUS_MESSAGES: Record<number, string> = {
    403: 'You don\u2019t have permission to do that.',
    404: 'The requested resource was not found.',
    429: 'Too many requests. Please wait a moment and try again.',
    503: 'Service is temporarily unavailable. Please try again shortly.',
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
        const { kind, retryable } = classifyStatus(status);

        const message =
            data?.message ||
            data?.error ||
            (status && STATUS_MESSAGES[status]) ||
            error.message ||
            'Something went wrong. Please try again.';

        const retryAfterHeader = error.response?.headers?.['retry-after'] as
            | string
            | undefined;

        return {
            message,
            status,
            code: data?.code,
            kind,
            isNetworkError: !error.response,
            isUnauthorized: status === 401,
            retryable,
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
        };
    }

    return {
        message: 'Unexpected error occurred.',
        kind: 'unknown',
        isNetworkError: false,
        isUnauthorized: false,
        retryable: false,
    };
}
