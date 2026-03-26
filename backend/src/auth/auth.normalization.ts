import { BadRequestException } from '@nestjs/common';
import { AuthProvider, Gender } from '@prisma/client';

const GENDER_MAP: Record<string, Gender> = {
  woman: Gender.FEMALE,
  man: Gender.MALE,
  'non-binary': Gender.NON_BINARY,
};

const ALLOWED_GENDERS = ['woman', 'man', 'non-binary'] as const;

export function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? '';
}

export function redactEmail(email: string) {
  return email.replace(/(.{2}).*(@.*)/, '$1***$2');
}

export function parseBirthdate(birthdate: string) {
  const trimmedBirthdate = birthdate.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedBirthdate)) {
    throw new BadRequestException('Birthdate must use YYYY-MM-DD format');
  }

  const parsedBirthdate = new Date(`${trimmedBirthdate}T00:00:00.000Z`);
  if (Number.isNaN(parsedBirthdate.getTime())) {
    throw new BadRequestException('Birthdate must be a real date');
  }

  if (parsedBirthdate.toISOString().slice(0, 10) !== trimmedBirthdate) {
    throw new BadRequestException('Birthdate must be a real date');
  }

  return parsedBirthdate;
}

export function normalizeGender(gender: string): Gender {
  const normalizedGender = gender.trim().toLowerCase();
  if (!ALLOWED_GENDERS.includes(normalizedGender as (typeof ALLOWED_GENDERS)[number])) {
    throw new BadRequestException('Gender must be one of: woman, man, non-binary');
  }

  const mapped = GENDER_MAP[normalizedGender];
  if (!mapped) {
    throw new BadRequestException('Gender must be one of: woman, man, non-binary');
  }

  return mapped;
}

export function buildEmailLookup(email: string) {
  return {
    email: {
      equals: email,
      mode: 'insensitive' as const,
    },
    authProvider: AuthProvider.EMAIL,
  };
}
