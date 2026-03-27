import { z } from 'zod';

export const onboardingSchema = z.object({
  intent: z.enum(['dating', 'workout', 'both']),
  discoveryPreference: z.enum(['men', 'women', 'both']),
  activities: z.array(z.string()).min(1, 'Pick at least one activity'),
  frequencyLabel: z.string().min(1),
  intensityLevel: z.string().min(1),
  weeklyFrequencyBand: z.string().min(1),
  environment: z.array(z.string()).min(1, 'Pick at least one environment'),
  schedule: z.array(z.string()).min(1, 'Pick at least one schedule'),
  socialComfort: z.string().min(1, 'Pick a social preference'),
});
