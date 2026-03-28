export const UI_PREVIEW_PASSWORD = 'PreviewPass123!';

export const UI_PREVIEW_USERS = [
  {
    key: 'lana',
    email: 'preview.lana@brdg.local',
    firstName: 'Lana',
    birthdate: '1996-04-14',
    gender: 'woman',
    photoUrls: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1552674605-469523170d9e?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=800&fit=crop',
    ],
    profile: {
      city: 'Honolulu',
      country: 'US',
      latitude: 21.2767,
      longitude: -157.8275,
      bio: 'Morning runner looking for dates, workouts, and low-pressure beach hangs before work.',
      intentDating: true,
      intentWorkout: true,
      intentFriends: false,
      showMeMen: true,
      showMeWomen: true,
      showMeOther: true,
      maxDistanceKm: 25,
    },
    fitness: {
      intensityLevel: 'INTERMEDIATE',
      weeklyFrequencyBand: '3-4',
      primaryGoal: 'endurance',
      secondaryGoal: 'health',
      favoriteActivities: 'Running, Yoga, Beach Workouts',
      prefersMorning: true,
      prefersEvening: true,
    },
  },
  {
    key: 'mason',
    email: 'preview.mason@brdg.local',
    firstName: 'Mason',
    birthdate: '1993-11-02',
    gender: 'man',
    photoUrls: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1483721310020-03333e577078?w=600&h=800&fit=crop',
    ],
    profile: {
      city: 'Kakaako',
      country: 'US',
      latitude: 21.2968,
      longitude: -157.8581,
      bio: 'Beach workouts, last-minute coffees, and low-ego training blocks that still feel intentional.',
      intentDating: true,
      intentWorkout: true,
      intentFriends: false,
      showMeMen: true,
      showMeWomen: true,
      showMeOther: true,
      maxDistanceKm: 35,
    },
    fitness: {
      intensityLevel: 'ADVANCED',
      weeklyFrequencyBand: '4-5',
      primaryGoal: 'strength',
      secondaryGoal: 'conditioning',
      favoriteActivities: 'Beach Workouts, Running, Boxing',
      prefersMorning: false,
      prefersEvening: true,
    },
  },
  {
    key: 'niko',
    email: 'preview.niko@brdg.local',
    firstName: 'Niko',
    birthdate: '1995-07-22',
    gender: 'man',
    photoUrls: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=800&fit=crop',
    ],
    profile: {
      city: 'Manoa',
      country: 'US',
      latitude: 21.3169,
      longitude: -157.8075,
      bio: 'Climbs, trail miles, and early starts. Good candidate for a fresh discovery card.',
      intentDating: true,
      intentWorkout: true,
      intentFriends: true,
      showMeMen: true,
      showMeWomen: true,
      showMeOther: true,
      maxDistanceKm: 50,
    },
    fitness: {
      intensityLevel: 'INTERMEDIATE',
      weeklyFrequencyBand: '3-4',
      primaryGoal: 'mobility',
      secondaryGoal: 'adventure',
      favoriteActivities: 'Hiking, Running, Climbing',
      prefersMorning: true,
      prefersEvening: false,
    },
  },
] as const;

export type UiPreviewUserKey = (typeof UI_PREVIEW_USERS)[number]['key'];

export function getUiPreviewDayAnchor(referenceDate = new Date()): Date {
  return new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate(),
      12,
      0,
      0,
      0,
    ),
  );
}

export function getUiPreviewEventWindow(referenceDate = new Date()) {
  const anchor = getUiPreviewDayAnchor(referenceDate);
  const startsAt = new Date(anchor.getTime() + 36 * 60 * 60 * 1000);
  const endsAt = new Date(anchor.getTime() + 38 * 60 * 60 * 1000);
  return { startsAt, endsAt };
}
