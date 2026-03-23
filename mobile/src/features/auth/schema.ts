import { z } from 'zod';

export function buildBirthdate(year: string, month: string, day: string) {
  if (!year || !month || !day) {
    return '';
  }

  const birthdate = `${year}-${month}-${day}`;
  const parsed = new Date(`${birthdate}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString().slice(0, 10) === birthdate ? birthdate : '';
}

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Enter a valid email.'),
  password: z.string().min(1, 'Password is required.'),
});

export const signupSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required.'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required.')
      .email('Enter a valid email.'),
    password: z
      .string()
      .min(1, 'Password is required.')
      .min(8, 'Use at least 8 characters.'),
    birthdate: z.string(),
    gender: z.string().trim().min(1, 'Choose one of the listed gender options.'),
  })
  .superRefine((values, ctx) => {
    if (!values.birthdate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Choose your birthdate.',
        path: ['birthdate'],
      });
      return;
    }

    const [year = '', month = '', day = ''] = values.birthdate.split('-');
    if (!buildBirthdate(year, month, day)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Choose a real birthdate.',
        path: ['birthdate'],
      });
      return;
    }

    const birthDate = new Date(values.birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'You must be at least 18 years old.',
        path: ['birthdate'],
      });
    }
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
