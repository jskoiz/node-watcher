/**
 * Dev-mode response contract validation.
 *
 * Validates API responses against shared Zod schemas in __DEV__ mode only.
 * Mismatches are logged as warnings — they never throw or break the app.
 */
import type { ZodType } from "zod";
import type { AxiosResponse } from "axios";
import {
  AuthResponseSchema,
  CurrentUserSchema,
  DiscoveryFeedSchema,
  LikeResponseSchema,
  PassResponseSchema,
  UndoSwipeResponseSchema,
  ProfileCompletenessSchema,
  MatchListSchema,
  ChatMessageListSchema,
  SendMessageResponseSchema,
  EventListSchema,
  EventSummarySchema,
  EventRsvpResponseSchema,
  EventInviteResponseSchema,
  EventInviteListSchema,
} from "@contracts";

// ── Schema registry: maps URL patterns to Zod schemas ───────────────

type RouteEntry = { method: string; pattern: RegExp; schema: ZodType };

const routes: RouteEntry[] = [
  // Auth
  { method: "POST", pattern: /^\/auth\/login$/, schema: AuthResponseSchema },
  { method: "POST", pattern: /^\/auth\/signup$/, schema: AuthResponseSchema },
  { method: "GET", pattern: /^\/auth\/me$/, schema: CurrentUserSchema },

  // Discovery
  { method: "GET", pattern: /^\/discovery\/feed$/, schema: DiscoveryFeedSchema },
  { method: "POST", pattern: /^\/discovery\/like\//, schema: LikeResponseSchema },
  { method: "POST", pattern: /^\/discovery\/pass\//, schema: PassResponseSchema },
  { method: "POST", pattern: /^\/discovery\/undo$/, schema: UndoSwipeResponseSchema },
  { method: "GET", pattern: /^\/discovery\/profile-completeness$/, schema: ProfileCompletenessSchema },

  // Matches
  { method: "GET", pattern: /^\/matches$/, schema: MatchListSchema },
  { method: "GET", pattern: /^\/matches\/[^/]+\/messages$/, schema: ChatMessageListSchema },
  { method: "POST", pattern: /^\/matches\/[^/]+\/messages$/, schema: SendMessageResponseSchema },

  // Events
  { method: "GET", pattern: /^\/events$/, schema: EventListSchema },
  { method: "GET", pattern: /^\/events\/me$/, schema: EventListSchema },
  { method: "GET", pattern: /^\/events\/[^/]+$/, schema: EventSummarySchema },
  { method: "POST", pattern: /^\/events\/[^/]+\/rsvp$/, schema: EventRsvpResponseSchema },
  { method: "POST", pattern: /^\/events\/[^/]+\/invite$/, schema: EventInviteResponseSchema },
  { method: "GET", pattern: /^\/events\/[^/]+\/invites$/, schema: EventInviteListSchema },
];

function findSchema(method: string, url: string): RouteEntry | undefined {
  const upperMethod = method.toUpperCase();
  return routes.find(
    (r) => r.method === upperMethod && r.pattern.test(url),
  );
}

/**
 * Axios response interceptor that validates response data against shared
 * contracts. Only active in __DEV__ — in production this is a no-op.
 */
export function devContractInterceptor(response: AxiosResponse): AxiosResponse {
  if (!__DEV__) return response;

  const method = response.config.method ?? "GET";
  // Strip the baseURL to get the relative path
  const baseURL = response.config.baseURL ?? "";
  let url = response.config.url ?? "";
  if (url.startsWith(baseURL)) {
    url = url.slice(baseURL.length);
  }

  const entry = findSchema(method, url);
  if (!entry) return response;

  const result = entry.schema.safeParse(response.data);
  if (!result.success) {
    console.warn(
      `[contract] ${method.toUpperCase()} ${url} response shape mismatch:\n` +
        result.error.issues
          .map((i) => `  ${i.path.join(".")}: ${i.message}`)
          .join("\n"),
    );
  }

  return response;
}
