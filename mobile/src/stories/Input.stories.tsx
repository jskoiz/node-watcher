import type { Meta, StoryObj } from '@storybook/react-native';
import { Input } from '../design/primitives';
import { withStorySurface } from './support';

const meta = {
  title: 'Design/Input',
  component: Input,
  decorators: [withStorySurface()],
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    value: '',
    onChangeText: () => undefined,
  },
};

export const Filled: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    value: 'jordan@example.com',
    onChangeText: () => undefined,
  },
};

export const Error: Story = {
  args: {
    label: 'Password',
    placeholder: 'At least 8 characters',
    value: 'short',
    error: 'Password must be at least 8 characters.',
    onChangeText: () => undefined,
  },
};

export const Disabled: Story = {
  args: {
    editable: false,
    label: 'Location',
    placeholder: 'Choose a city',
    value: 'Honolulu',
    onChangeText: () => undefined,
  },
};

export const Multiline: Story = {
  args: {
    label: 'Bio',
    multiline: true,
    numberOfLines: 4,
    placeholder: 'How do you like to move?',
    value: 'Sunrise runs, slower weekend sessions, and coffee after.',
    onChangeText: () => undefined,
  },
};
