import { ONBOARDING_ACTIVITIES, formatSelectedActivityLabels } from '../../../constants/activities';
import type { SessionIntent } from '../../../types/sessionIntent';

export const ACTIVITIES = ONBOARDING_ACTIVITIES;

export const FREQUENCY_OPTIONS = [
  { key: '1-2', label: '1–2x', subtitle: 'Casual mover', intensity: 'low' },
  { key: '3-4', label: '3–4x', subtitle: 'Regular athlete', intensity: 'moderate' },
  { key: '5-6', label: '5–6x', subtitle: 'Dedicated', intensity: 'high' },
  { key: '7+', label: 'Daily', subtitle: 'All-in', intensity: 'high' },
] as const;

export const ENVIRONMENTS = [
  { key: 'gym', label: 'Gym', icon: 'activity' },
  { key: 'outdoors', label: 'Outdoors', icon: 'compass' },
  { key: 'beach', label: 'Beach', icon: 'sun' },
  { key: 'mountains', label: 'Mountains', icon: 'triangle' },
  { key: 'city', label: 'City', icon: 'grid' },
  { key: 'studio', label: 'Studio', icon: 'circle' },
] as const;

export const SCHEDULE_OPTIONS = [
  { key: 'morning', label: 'Morning', icon: 'sun' },
  { key: 'evening', label: 'Evening', icon: 'moon' },
  { key: 'weekends', label: 'Weekends', icon: 'calendar' },
  { key: 'flexible', label: 'Flexible', icon: 'refresh-cw' },
] as const;

export const SOCIAL_OPTIONS = [
  { key: '1-on-1', label: '1-on-1', subtitle: 'Deep focus, just us', icon: 'user' },
  { key: 'small-group', label: 'Small Group', subtitle: '3–5 people, tight-knit', icon: 'users' },
  { key: 'group-first', label: 'Group First', subtitle: 'Start big, connect naturally', icon: 'target' },
] as const;

export const STEP_CHAPTERS = [
  'Welcome',
  'Intent',
  'Activities',
  'Frequency',
  'Environment',
  'Schedule',
  'Social',
  'Summary',
  'Ready',
] as const;

export const TOTAL_STEPS = STEP_CHAPTERS.length;

export function getIntentLabel(intent: SessionIntent) {
  if (intent === 'dating') return 'Dating';
  if (intent === 'workout') return 'Training';
  return 'Open to both';
}

export function formatActivitySummary(values: string[]) {
  return formatSelectedActivityLabels(values);
}
