/**
 * Dev-mode response contract validation.
 *
 * Validates API responses against shared Zod schemas in __DEV__ mode only.
 * Mismatches are logged as warnings - they never throw or break the app.
 */
import type { AxiosResponse } from "axios";
import type { ZodTypeAny } from "zod";
import { normalizeContractPath, findResponseContract } from "@contracts";
import {
  BlockResponseSchema,
  CurrentUserSchema,
  ReportResponseSchema,
  UserPhotoSchema,
} from "./types";

/**
 * Mobile-only route entries that extend the shared contract registry with
 * endpoints whose schemas carry mobile-specific extensions (e.g. isHidden on
 * photos) or schemas that only exist on the mobile side (moderation).
 */
type RouteEntry = { method: string; pattern: RegExp; schema: ZodTypeAny };

const mobileOnlyRoutes: RouteEntry[] = [
  // Profile (mobile extends CurrentUserSchema/UserPhotoSchema with extra fields)
  { method: "GET", pattern: /^\/profile$/, schema: CurrentUserSchema },
  { method: "PATCH", pattern: /^\/profile\/fitness$/, schema: CurrentUserSchema },
  { method: "POST", pattern: /^\/profile\/photos$/, schema: UserPhotoSchema },
  { method: "PATCH", pattern: /^\/profile\/photos\/[^/]+$/, schema: UserPhotoSchema },
  { method: "DELETE", pattern: /^\/profile\/photos\/[^/]+$/, schema: UserPhotoSchema },

  // Moderation (schemas defined in mobile types only)
  { method: "POST", pattern: /^\/moderation\/report$/, schema: ReportResponseSchema },
  { method: "POST", pattern: /^\/moderation\/block$/, schema: BlockResponseSchema },
];

function findSchema(
  method: string,
  url: string,
  baseURL: string,
): { schema: ZodTypeAny } | undefined {
  const upperMethod = method.toUpperCase();
  const normalizedPath = normalizeContractPath(url, baseURL);

  // Mobile-only routes take precedence (they use extended schemas)
  const mobileEntry = mobileOnlyRoutes.find(
    (route) => route.method === upperMethod && route.pattern.test(normalizedPath),
  );
  if (mobileEntry) return mobileEntry;

  // Fall back to shared contract registry
  const shared = findResponseContract(method, url, baseURL);
  if (shared) return { schema: shared.responseSchema as ZodTypeAny };

  return undefined;
}

/**
 * Axios response interceptor that validates response data against shared
 * contracts. Only active in __DEV__ - in production this is a no-op.
 */
export function devContractInterceptor(response: AxiosResponse): AxiosResponse {
  if (!__DEV__) return response;

  const method = response.config.method ?? "GET";
  const baseURL = response.config.baseURL ?? "";
  const rawUrl = response.config.url ?? "";
  const displayPath = normalizeContractPath(rawUrl, baseURL);

  const entry = findSchema(method, rawUrl, baseURL);
  if (!entry) return response;

  const result = entry.schema.safeParse(response.data);
  if (!result.success) {
    console.warn(
      `[contract] ${method.toUpperCase()} ${displayPath} response shape mismatch:\n` +
        result.error.issues
          .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
          .join("\n"),
    );
  }

  return response;
}
