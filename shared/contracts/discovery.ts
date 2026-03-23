import { z } from "zod";
import {
  UserProfileSchema,
  FitnessProfileSchema,
  UserPhotoSchema,
} from "./common";

// ── GET /discovery/feed ─────────────────────────────────────────────

export const DiscoveryUserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  birthdate: z.coerce.date(),
  age: z.number(),
  distanceKm: z.number().nullable().optional(),
  recommendationScore: z.number().optional(),
  profile: UserProfileSchema.nullable(),
  fitnessProfile: FitnessProfileSchema.nullable(),
  photos: z.array(UserPhotoSchema),
});

export const DiscoveryFeedSchema = z.array(DiscoveryUserSchema);

export type DiscoveryUser = z.infer<typeof DiscoveryUserSchema>;

// ── POST /discovery/like/:id ────────────────────────────────────────

export const LikeResponseSchema = z.object({
  status: z.enum(["match", "liked", "already_liked"]),
  match: z
    .object({ id: z.string() })
    .optional(),
});

export type LikeResponse = z.infer<typeof LikeResponseSchema>;

// ── POST /discovery/pass/:id ────────────────────────────────────────

export const PassResponseSchema = z.object({
  status: z.enum(["passed", "already_passed"]),
});

export type PassResponse = z.infer<typeof PassResponseSchema>;

// ── POST /discovery/undo ────────────────────────────────────────────

export const UndoSwipeResponseSchema = z.object({
  status: z.enum(["undone", "nothing_to_undo"]),
  action: z.enum(["like", "pass"]).optional(),
  targetUserId: z.string().optional(),
  archivedMatchId: z.string().optional(),
});

export type UndoSwipeResponse = z.infer<typeof UndoSwipeResponseSchema>;

// ── GET /discovery/profile-completeness ─────────────────────────────

export const ProfileCompletenessSchema = z.object({
  score: z.number(),
  total: z.number(),
  earned: z.number(),
  prompts: z.array(z.string()),
  missing: z.array(
    z.object({
      field: z.string(),
      label: z.string(),
      route: z.string(),
    }),
  ),
});

export type ProfileCompleteness = z.infer<typeof ProfileCompletenessSchema>;
