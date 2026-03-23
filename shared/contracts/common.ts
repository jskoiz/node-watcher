import { z } from "zod";

// ── Reusable fragments ──────────────────────────────────────────────

export const UserProfileSchema = z.object({
  bio: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  intentDating: z.boolean().nullable().optional(),
  intentWorkout: z.boolean().nullable().optional(),
  intentFriends: z.boolean().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

export const FitnessProfileSchema = z.object({
  intensityLevel: z.string().nullable().optional(),
  weeklyFrequencyBand: z.string().nullable().optional(),
  primaryGoal: z.string().nullable().optional(),
  secondaryGoal: z.string().nullable().optional(),
  favoriteActivities: z.string().nullable().optional(),
  prefersMorning: z.boolean().nullable().optional(),
  prefersEvening: z.boolean().nullable().optional(),
});

export const UserPhotoSchema = z.object({
  id: z.string(),
  storageKey: z.string(),
  isPrimary: z.boolean(),
  sortOrder: z.number(),
  createdAt: z.coerce.date().optional(),
});

/** Minimal user stub used in match/event sub-objects. */
export const UserStubSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  photoUrl: z.string().nullable().optional(),
});
