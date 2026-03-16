import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  SignupScreenView,
} from '../screens/SignupScreen';
import {
  signupSchema,
  type SignupFormValues,
} from '../features/auth/schema';
import { withStoryScreenFrame } from './support';

function SignupScreenStory({
  birthdate,
  birthdateError,
  canProceed,
  email,
  emailError,
  firstName,
  firstNameError,
  gender,
  genderError,
  isSubmitting,
  password,
  passwordError,
  step,
}: {
  birthdate: string;
  birthdateError?: string;
  canProceed: boolean;
  email: string;
  emailError?: string;
  firstName: string;
  firstNameError?: string;
  gender: string;
  genderError?: string;
  isSubmitting: boolean;
  password: string;
  passwordError?: string;
  step: number;
}) {
  const form = useForm<SignupFormValues>({
    defaultValues: {
      birthdate,
      email,
      firstName,
      gender,
      password,
    },
    resolver: zodResolver(signupSchema),
  });

  React.useEffect(() => {
    form.reset({
      birthdate,
      email,
      firstName,
      gender,
      password,
    });
  }, [birthdate, email, firstName, form, gender, password]);

  React.useEffect(() => {
    form.clearErrors();
    if (firstNameError) {
      form.setError('firstName', { type: 'manual', message: firstNameError });
    }
    if (emailError) {
      form.setError('email', { type: 'manual', message: emailError });
    }
    if (passwordError) {
      form.setError('password', { type: 'manual', message: passwordError });
    }
    if (birthdateError) {
      form.setError('birthdate', { type: 'manual', message: birthdateError });
    }
    if (genderError) {
      form.setError('gender', { type: 'manual', message: genderError });
    }
  }, [birthdateError, emailError, firstNameError, form, genderError, passwordError]);

  return (
    <SignupScreenView
      canProceed={canProceed}
      control={form.control}
      errors={form.formState.errors}
      isSubmitting={isSubmitting}
      onBack={() => undefined}
      onNavigateLogin={() => undefined}
      onSubmitStep={() => undefined}
      step={step}
    />
  );
}

const meta = {
  title: 'Screens/Signup',
  component: SignupScreenStory,
  decorators: [withStoryScreenFrame({ height: 960 })],
  args: {
    birthdate: '',
    canProceed: false,
    email: '',
    firstName: '',
    gender: '',
    isSubmitting: false,
    password: '',
    step: 0,
  },
} satisfies Meta<typeof SignupScreenStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const StepOne: Story = {};

export const AccountStepErrors: Story = {
  args: {
    canProceed: false,
    email: 'lana',
    emailError: 'Enter a valid email.',
    password: 'short',
    passwordError: 'Use at least 8 characters.',
    step: 1,
  },
};

export const FinalStepReady: Story = {
  args: {
    birthdate: '1995-05-17',
    canProceed: true,
    email: 'lana@brdg.local',
    firstName: 'Lana',
    gender: 'Woman',
    password: 'PreviewPass123!',
    step: 2,
  },
};

export const LoadingFinalStep: Story = {
  args: {
    birthdate: '1995-05-17',
    canProceed: true,
    email: 'lana@brdg.local',
    firstName: 'Lana',
    gender: 'Woman',
    isSubmitting: true,
    password: 'PreviewPass123!',
    step: 2,
  },
};
