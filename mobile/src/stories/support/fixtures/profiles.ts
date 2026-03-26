import type {
  AuthenticatedUser,
  DiscoveryUser,
  User,
  UserPhoto,
} from '../../../api/types';

const PHOTO_LIBRARY = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80',
];

export function makeUserPhoto(
  overrides: Partial<UserPhoto> = {},
): UserPhoto {
  const sortOrder = overrides.sortOrder ?? 0;

  return {
    id: overrides.id ?? `photo-${sortOrder + 1}`,
    storageKey: overrides.storageKey ?? PHOTO_LIBRARY[sortOrder % PHOTO_LIBRARY.length],
    isPrimary: overrides.isPrimary ?? sortOrder === 0,
    isHidden: overrides.isHidden ?? false,
    sortOrder,
  };
}

export function makeUser(overrides: Partial<User> = {}): User {
  const photos = overrides.photos ?? [
    makeUserPhoto({ id: 'photo-1', isPrimary: true, sortOrder: 0 }),
    makeUserPhoto({ id: 'photo-2', sortOrder: 1 }),
    makeUserPhoto({ id: 'photo-3', sortOrder: 2 }),
  ];

  return {
    id: overrides.id ?? 'user-1',
    email: overrides.email ?? 'lana@brdg.local',
    firstName: overrides.firstName ?? 'Lana',
    age: overrides.age ?? 29,
    isOnboarded: overrides.isOnboarded ?? true,
    photoUrl: overrides.photoUrl ?? photos[0]?.storageKey,
    profile: {
      city: 'Honolulu',
      bio: 'Sunrise hikes, slower conversations, and plans that actually happen.',
      intentDating: true,
      intentWorkout: true,
      intentFriends: false,
      ...overrides.profile,
    },
    fitnessProfile: {
      intensityLevel: 'moderate',
      weeklyFrequencyBand: '3-4',
      primaryGoal: 'connection',
      favoriteActivities: 'Running, Yoga, Hiking',
      prefersMorning: true,
      prefersEvening: false,
      ...overrides.fitnessProfile,
    },
    photos,
    ...overrides,
  };
}

export function makeAuthenticatedUser(
  overrides: Partial<AuthenticatedUser> = {},
): AuthenticatedUser {
  const baseUser = makeUser(overrides);

  return {
    ...baseUser,
    email: overrides.email ?? baseUser.email ?? 'lana@brdg.local',
    firstName: overrides.firstName ?? baseUser.firstName ?? 'Lana',
    isOnboarded: overrides.isOnboarded ?? true,
  };
}

export function makeDiscoveryUser(
  overrides: Partial<DiscoveryUser> = {},
): DiscoveryUser {
  const baseUser = makeUser(overrides);

  return {
    ...baseUser,
    firstName: overrides.firstName ?? baseUser.firstName ?? 'Lana',
    birthdate: overrides.birthdate ?? '1995-01-01T00:00:00.000Z',
    age: overrides.age ?? baseUser.age ?? 29,
    profile: overrides.profile ?? baseUser.profile ?? null,
    fitnessProfile: overrides.fitnessProfile ?? baseUser.fitnessProfile ?? null,
    photos: overrides.photos ?? baseUser.photos ?? [],
    distanceKm: overrides.distanceKm ?? 5,
    recommendationScore: overrides.recommendationScore ?? 88,
  };
}
