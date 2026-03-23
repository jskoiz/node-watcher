export const ACTIVITY_DEFINITIONS = [
  { key: 'lifting', label: 'Lifting', profileLabel: '🏋️ Lifting', icon: 'activity', color: '#C97070' },
  { key: 'yoga', label: 'Yoga', profileLabel: '🧘 Yoga', icon: 'circle', color: '#B8A9C4' },
  { key: 'surfing', label: 'Surfing', profileLabel: '🏄 Surfing', icon: 'wind', color: '#B8A9C4' },
  { key: 'hiking', label: 'Hiking', profileLabel: '🥾 Hiking', icon: 'map', color: '#C4A882' },
  { key: 'running', label: 'Running', profileLabel: '🏃 Running', icon: 'activity', color: '#8BAA7A' },
  { key: 'cycling', label: 'Cycling', profileLabel: '🚴 Cycling', icon: 'navigation', color: '#8BAA7A' },
  { key: 'beach', label: 'Beach Workouts', profileLabel: '🏖️ Beach', icon: 'sun', color: '#B8A9C4' },
  { key: 'climbing', label: 'Climbing', profileLabel: '🧗 Climbing', icon: 'triangle', color: '#D4A59A' },
  { key: 'skiing', label: 'Skiing', profileLabel: '⛷️ Skiing', icon: 'navigation-2', color: '#B8A9C4' },
  { key: 'swimming', label: 'Swimming', profileLabel: '🏊 Swimming', icon: 'droplet', color: '#B8A9C4' },
  { key: 'boxing', label: 'Boxing', profileLabel: '🥊 Boxing', icon: 'target', color: '#C97070' },
  { key: 'crossfit', label: 'CrossFit', profileLabel: 'CrossFit', icon: 'shuffle', color: '#C4A882' },
] as const;

export type ActivityDefinition = (typeof ACTIVITY_DEFINITIONS)[number];

export const ONBOARDING_ACTIVITIES = ACTIVITY_DEFINITIONS.map(({ key, label, icon }) => ({
  key,
  label,
  icon,
})) as ReadonlyArray<Pick<ActivityDefinition, 'key' | 'label' | 'icon'>>;

export const ACTIVITY_OPTIONS = ACTIVITY_DEFINITIONS.map(({ profileLabel, label, color }) => ({
  label: profileLabel,
  value: label,
  color,
})) as ReadonlyArray<{
  label: string;
  value: string;
  color: string;
}>;

const ACTIVITY_LOOKUP = new Map(
  ACTIVITY_DEFINITIONS.flatMap(({ key, label, profileLabel }) => {
    const normalizedProfileLabel = profileLabel.replace(/^[^\p{L}\p{N}]+/u, '').trim();
    return [
      [key.toLowerCase(), label],
      [label.toLowerCase(), label],
      [profileLabel.toLowerCase(), label],
      [normalizedProfileLabel.toLowerCase(), label],
    ] as const;
  }),
);

export function normalizeActivityValue(activity: string) {
  const normalized = activity.trim();
  if (!normalized) return null;
  return ACTIVITY_LOOKUP.get(normalized.toLowerCase()) ?? normalized;
}

export function formatSelectedActivityLabels(values: string[]) {
  return values
    .map((value) => normalizeActivityValue(value))
    .filter((value): value is string => Boolean(value))
    .join(' · ');
}
