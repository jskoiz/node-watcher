import type { Gender } from '@prisma/client';

export type AuthenticatedUser = {
  id: string;
  email: string | null;
  firstName: string;
  isOnboarded: boolean;
};

export type EmailAuthUser = AuthenticatedUser & {
  passwordHash: string | null;
};

export interface AuthResult {
  access_token: string;
  user: { id: string; email: string; firstName: string; isOnboarded: boolean };
}

export type CurrentUserResult = {
  id: string;
  email: string | null;
  firstName: string;
  birthdate: Date | null;
  gender: Gender;
  pronouns: string | null;
  isOnboarded: boolean;
  createdAt: Date;
  updatedAt: Date;
  age: number | null;
  profile: unknown;
  fitnessProfile: unknown;
  photos: unknown[];
};
