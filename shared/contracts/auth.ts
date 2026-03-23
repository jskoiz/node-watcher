import { z } from "zod";
import {
  UserProfileSchema,
  FitnessProfileSchema,
  UserPhotoSchema,
} from "./common";

// ── POST /auth/signup, POST /auth/login ─────────────────────────────

export const AuthResponseSchema = z.object({
  access_token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    firstName: z.string(),
    isOnboarded: z.boolean(),
  }),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// ── GET /auth/me ────────────────────────────────────────────────────

export const CurrentUserSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  firstName: z.string(),
  birthdate: z.coerce.date().nullable(),
  gender: z.string(),
  pronouns: z.string().nullable(),
  isOnboarded: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  age: z.number().nullable(),
  profile: UserProfileSchema.nullable(),
  fitnessProfile: FitnessProfileSchema.nullable(),
  photos: z.array(UserPhotoSchema),
});

export type CurrentUser = z.infer<typeof CurrentUserSchema>;
