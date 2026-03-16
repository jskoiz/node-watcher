export type UpdateProfileDto = {
  userId?: string;
  bio?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  intentDating?: boolean;
  intentWorkout?: boolean;
  intentFriends?: boolean;
};

export type UpdateFitnessProfileDto = {
  userId?: string;
  intensityLevel?: string;
  weeklyFrequencyBand?: string;
  primaryGoal?: string;
  secondaryGoal?: string;
  favoriteActivities?: string;
  prefersMorning?: boolean;
  prefersEvening?: boolean;
};

export type UpdatePhotoDto = {
  isPrimary?: boolean;
  isHidden?: boolean;
  sortOrder?: number;
};
