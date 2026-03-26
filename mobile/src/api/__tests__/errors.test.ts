import axios, { AxiosError, AxiosHeaders } from 'axios';
import { normalizeApiError, parseRetryAfter } from '../errors';

function makeAxiosError(
    status: number | undefined,
    data?: Record<string, unknown>,
    headers?: Record<string, string>,
    code?: string,
): AxiosError {
    const error = new AxiosError('Request failed');
    error.code = code;
    if (status !== undefined) {
        error.response = {
            status,
            statusText: '',
            data: data ?? {},
            headers: headers ?? {},
            config: { headers: new AxiosHeaders() },
        };
    }
    return error;
}

describe('parseRetryAfter', () => {
    it('returns undefined for null/undefined', () => {
        expect(parseRetryAfter(null)).toBeUndefined();
        expect(parseRetryAfter(undefined)).toBeUndefined();
    });

    it('parses delta-seconds', () => {
        expect(parseRetryAfter('120')).toBe(120);
        expect(parseRetryAfter('0')).toBe(0);
    });

    it('parses HTTP-date format', () => {
        const futureDate = new Date(Date.now() + 60_000).toUTCString();
        const result = parseRetryAfter(futureDate);
        expect(result).toBeGreaterThanOrEqual(59);
        expect(result).toBeLessThanOrEqual(61);
    });

    it('returns 0 for past HTTP-dates', () => {
        const pastDate = new Date(Date.now() - 60_000).toUTCString();
        expect(parseRetryAfter(pastDate)).toBe(0);
    });

    it('returns undefined for garbage input', () => {
        expect(parseRetryAfter('not-a-number-or-date')).toBeUndefined();
    });

    it('trims whitespace', () => {
        expect(parseRetryAfter('  30  ')).toBe(30);
    });
});

describe('normalizeApiError', () => {
    it('classifies 401 as unauthorized', () => {
        const err = normalizeApiError(makeAxiosError(401));
        expect(err.kind).toBe('unauthorized');
        expect(err.isUnauthorized).toBe(true);
        expect(err.retryable).toBe(false);
        expect(err.message).toContain('session expired');
    });

    it('classifies 403 as forbidden', () => {
        const err = normalizeApiError(makeAxiosError(403));
        expect(err.kind).toBe('forbidden');
        expect(err.retryable).toBe(false);
        expect(err.message).toContain('permission');
    });

    it('classifies 404 as not_found', () => {
        const err = normalizeApiError(makeAxiosError(404));
        expect(err.kind).toBe('not_found');
        expect(err.retryable).toBe(false);
        expect(err.message).toContain('not found');
    });

    it('classifies 429 as rate_limited and retryable', () => {
        const err = normalizeApiError(makeAxiosError(429));
        expect(err.kind).toBe('rate_limited');
        expect(err.retryable).toBe(true);
        expect(err.message).toContain('Too many requests');
    });

    it('classifies 503 as service_unavailable and retryable', () => {
        const err = normalizeApiError(makeAxiosError(503));
        expect(err.kind).toBe('service_unavailable');
        expect(err.retryable).toBe(true);
    });

    it('classifies other 5xx as server_error and retryable', () => {
        const err = normalizeApiError(makeAxiosError(502));
        expect(err.kind).toBe('server_error');
        expect(err.retryable).toBe(true);
    });

    it('classifies other 4xx as unknown and non-retryable', () => {
        const err = normalizeApiError(makeAxiosError(422));
        expect(err.kind).toBe('unknown');
        expect(err.retryable).toBe(false);
    });

    it('classifies network errors (no response) as network', () => {
        const err = normalizeApiError(makeAxiosError(undefined));
        expect(err.kind).toBe('network');
        expect(err.isNetworkError).toBe(true);
        expect(err.retryable).toBe(true);
        expect(err.transient).toBe(true);
        expect(err.transport).toBe('network');
        expect(err.message).toContain('Unable to reach BRDG');
    });

    it('treats request timeouts as transient network failures', () => {
        const err = normalizeApiError(
            makeAxiosError(undefined, undefined, undefined, 'ECONNABORTED'),
        );

        expect(err.kind).toBe('network');
        expect(err.transport).toBe('timeout');
        expect(err.transient).toBe(true);
        expect(err.message).toContain('timed out');
    });

    it('treats cancelled requests as non-retryable noise', () => {
        const err = normalizeApiError(
            makeAxiosError(undefined, undefined, undefined, 'ERR_CANCELED'),
        );

        expect(err.kind).toBe('unknown');
        expect(err.transport).toBe('cancelled');
        expect(err.retryable).toBe(false);
        expect(err.transient).toBe(false);
        expect(err.message).toContain('cancelled');
    });

    it('parses Retry-After header from 429 response', () => {
        const err = normalizeApiError(
            makeAxiosError(429, {}, { 'retry-after': '60' }),
        );
        expect(err.retryAfterSeconds).toBe(60);
    });

    it('returns undefined retryAfterSeconds when header is absent', () => {
        const err = normalizeApiError(makeAxiosError(429));
        expect(err.retryAfterSeconds).toBeUndefined();
    });

    it('prefers server message over default', () => {
        const err = normalizeApiError(
            makeAxiosError(429, { message: 'Slow down, cowboy' }),
        );
        expect(err.message).toBe('Slow down, cowboy');
        expect(err.serverMessage).toBe('Slow down, cowboy');
    });

    it('uses backend error text when message is absent', () => {
        const err = normalizeApiError(
            makeAxiosError(409, { error: 'Event already started' }),
        );

        expect(err.message).toBe('Event already started');
        expect(err.serverMessage).toBe('Event already started');
    });

    it('handles plain Error instances', () => {
        const err = normalizeApiError(new Error('boom'));
        expect(err.kind).toBe('unknown');
        expect(err.message).toBe('boom');
        expect(err.retryable).toBe(false);
        expect(err.fingerprint).toBe('unknown:none:none:unknown');
    });

    it('handles unknown thrown values', () => {
        const err = normalizeApiError('string error');
        expect(err.kind).toBe('unknown');
        expect(err.message).toBe('Unexpected error occurred.');
        expect(err.retryable).toBe(false);
    });
});
