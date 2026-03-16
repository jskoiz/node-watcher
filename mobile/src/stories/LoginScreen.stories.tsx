import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  LoginScreenView,
} from '../screens/LoginScreen';
import {
  loginSchema,
  type LoginFormValues,
} from '../features/auth/schema';
import { withStoryScreenFrame } from './support';

function LoginScreenStory({
  email,
  emailError,
  isSubmitting,
  password,
  passwordError,
  submitError,
}: {
  email: string;
  emailError?: string;
  isSubmitting: boolean;
  password: string;
  passwordError?: string;
  submitError: string;
}) {
  const form = useForm<LoginFormValues>({
    defaultValues: {
      email,
      password,
    },
    resolver: zodResolver(loginSchema),
  });

  React.useEffect(() => {
    form.reset({ email, password });
  }, [email, form, password]);

  React.useEffect(() => {
    form.clearErrors();
    if (emailError) {
      form.setError('email', { type: 'manual', message: emailError });
    }
    if (passwordError) {
      form.setError('password', { type: 'manual', message: passwordError });
    }
  }, [emailError, form, passwordError]);

  return (
    <LoginScreenView
      control={form.control}
      errors={form.formState.errors}
      isSubmitting={isSubmitting}
      onClearSubmitError={() => undefined}
      onNavigateSignup={() => undefined}
      onSubmit={() => undefined}
      submitError={submitError}
    />
  );
}

const meta = {
  title: 'Screens/Login',
  component: LoginScreenStory,
  decorators: [withStoryScreenFrame({ height: 900 })],
  args: {
    email: '',
    isSubmitting: false,
    password: '',
    submitError: '',
  },
} satisfies Meta<typeof LoginScreenStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ValidationErrors: Story = {
  args: {
    email: 'lana',
    emailError: 'Enter a valid email.',
    password: '',
    passwordError: 'Password is required.',
  },
};

export const SubmitError: Story = {
  args: {
    email: 'lana@brdg.local',
    password: 'PreviewPass123!',
    submitError: 'Incorrect email or password.',
  },
};

export const Loading: Story = {
  args: {
    email: 'lana@brdg.local',
    isSubmitting: true,
    password: 'PreviewPass123!',
  },
};
