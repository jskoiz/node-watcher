import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env';
import { handleUnauthorized } from './authSession';
import { getToken } from './tokenStorage';
import { showToast } from '../store/toastStore';
import { parseRetryAfter } from './errors';

const client = axios.create({
    baseURL: env.apiUrl,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.request.use(
    async (config) => {
        // Only inject the stored token when the caller has not already supplied an
        // Authorization header.  This lets call-sites pass an explicit token (e.g.
        // authApi.me) without having it silently overwritten by the interceptor.
        if (!config.headers.Authorization) {
            const token = await getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Auto-retry for 429 on idempotent GET requests
// ---------------------------------------------------------------------------

const MAX_429_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 2000;
const MAX_RETRY_DELAY_MS = 30000;
const RETRY_COUNT_KEY = '__retryCount';

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryDelayMs(error: AxiosError): number {
    const retryAfterHeader = error.response?.headers?.['retry-after'] as
        | string
        | undefined;
    const retryAfterSeconds = parseRetryAfter(retryAfterHeader);
    if (retryAfterSeconds !== undefined) {
        return Math.min(retryAfterSeconds * 1000, MAX_RETRY_DELAY_MS);
    }
    return DEFAULT_RETRY_DELAY_MS;
}

client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const config = error.config as InternalAxiosRequestConfig & {
            [RETRY_COUNT_KEY]?: number;
        } | undefined;

        // Auto-retry: only for 429 on GET requests
        if (
            error.response?.status === 429 &&
            config &&
            config.method?.toUpperCase() === 'GET'
        ) {
            const retryCount = config[RETRY_COUNT_KEY] ?? 0;
            if (retryCount < MAX_429_RETRIES) {
                config[RETRY_COUNT_KEY] = retryCount + 1;
                const delayMs = getRetryDelayMs(error);
                await sleep(delayMs);
                return client.request(config);
            }
        }

        // Existing 401 handling
        if (error?.response?.status === 401) {
            await handleUnauthorized();
        } else if (!error?.response) {
            // Network error — no response received
            showToast('Network error. Please check your connection.', 'error');
        } else if (error.response.status >= 500) {
            showToast('Server error. Please try again later.', 'error');
        }

        return Promise.reject(error);
    }
);

export default client;
