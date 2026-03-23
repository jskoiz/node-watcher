/**
 * Tests for the 429 auto-retry interceptor in client.ts.
 *
 * We test the retry logic in isolation by extracting the core behavior
 * rather than importing the client (which has module-level side effects).
 */

import { parseRetryAfter } from '../errors';

const MAX_429_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 2000;
const MAX_RETRY_DELAY_MS = 30000;
const RETRY_COUNT_KEY = '__retryCount';

function getRetryDelayMs(retryAfterHeader: string | undefined): number {
    const retryAfterSeconds = parseRetryAfter(retryAfterHeader);
    if (retryAfterSeconds !== undefined) {
        return Math.min(retryAfterSeconds * 1000, MAX_RETRY_DELAY_MS);
    }
    return DEFAULT_RETRY_DELAY_MS;
}

interface FakeConfig {
    method: string;
    [RETRY_COUNT_KEY]?: number;
}

interface FakeError {
    response?: { status: number; headers?: Record<string, string> };
    config: FakeConfig;
}

/**
 * Simulates the retry decision logic from the response interceptor.
 * Returns { shouldRetry, retryCount, delayMs } instead of actually sleeping.
 */
function evaluateRetry(error: FakeError): {
    shouldRetry: boolean;
    retryCount: number;
    delayMs: number;
} {
    const config = error.config;
    if (
        error.response?.status === 429 &&
        config.method.toUpperCase() === 'GET'
    ) {
        const retryCount = config[RETRY_COUNT_KEY] ?? 0;
        if (retryCount < MAX_429_RETRIES) {
            const delayMs = getRetryDelayMs(error.response?.headers?.['retry-after']);
            return { shouldRetry: true, retryCount: retryCount + 1, delayMs };
        }
    }
    return { shouldRetry: false, retryCount: config[RETRY_COUNT_KEY] ?? 0, delayMs: 0 };
}

describe('429 auto-retry interceptor logic', () => {
    it('retries a GET request on 429', () => {
        const result = evaluateRetry({
            response: { status: 429 },
            config: { method: 'get' },
        });
        expect(result.shouldRetry).toBe(true);
        expect(result.retryCount).toBe(1);
    });

    it('does NOT retry a POST request on 429', () => {
        const result = evaluateRetry({
            response: { status: 429 },
            config: { method: 'post' },
        });
        expect(result.shouldRetry).toBe(false);
    });

    it('does NOT retry a PUT request on 429', () => {
        const result = evaluateRetry({
            response: { status: 429 },
            config: { method: 'put' },
        });
        expect(result.shouldRetry).toBe(false);
    });

    it('does NOT retry a DELETE request on 429', () => {
        const result = evaluateRetry({
            response: { status: 429 },
            config: { method: 'delete' },
        });
        expect(result.shouldRetry).toBe(false);
    });

    it('does NOT retry a GET on non-429 errors', () => {
        const result = evaluateRetry({
            response: { status: 500 },
            config: { method: 'get' },
        });
        expect(result.shouldRetry).toBe(false);
    });

    it('stops retrying after MAX_429_RETRIES', () => {
        const result = evaluateRetry({
            response: { status: 429 },
            config: { method: 'get', [RETRY_COUNT_KEY]: MAX_429_RETRIES },
        });
        expect(result.shouldRetry).toBe(false);
    });

    it('uses Retry-After header when present', () => {
        const result = evaluateRetry({
            response: { status: 429, headers: { 'retry-after': '5' } },
            config: { method: 'get' },
        });
        expect(result.shouldRetry).toBe(true);
        expect(result.delayMs).toBe(5000);
    });

    it('caps Retry-After at MAX_RETRY_DELAY_MS', () => {
        const result = evaluateRetry({
            response: { status: 429, headers: { 'retry-after': '120' } },
            config: { method: 'get' },
        });
        expect(result.delayMs).toBe(MAX_RETRY_DELAY_MS);
    });

    it('uses default delay when Retry-After is absent', () => {
        const result = evaluateRetry({
            response: { status: 429 },
            config: { method: 'get' },
        });
        expect(result.delayMs).toBe(DEFAULT_RETRY_DELAY_MS);
    });

    it('increments retry count across attempts', () => {
        // First attempt
        const first = evaluateRetry({
            response: { status: 429 },
            config: { method: 'get' },
        });
        expect(first.retryCount).toBe(1);

        // Second attempt (simulating the config being reused)
        const second = evaluateRetry({
            response: { status: 429 },
            config: { method: 'get', [RETRY_COUNT_KEY]: 1 },
        });
        expect(second.retryCount).toBe(2);
        expect(second.shouldRetry).toBe(true);

        // Third attempt — should stop
        const third = evaluateRetry({
            response: { status: 429 },
            config: { method: 'get', [RETRY_COUNT_KEY]: 2 },
        });
        expect(third.shouldRetry).toBe(false);
    });
});
