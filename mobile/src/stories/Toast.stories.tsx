import React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Button } from '../design/primitives';
import { ToastOverlay } from '../components/ui/ToastOverlay';
import { useToastStore } from '../store/toastStore';

function ToastPlayground() {
  const show = useToastStore((s) => s.show);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, padding: 24, gap: 12, paddingTop: 80, backgroundColor: '#FDFBF8' }}>
        <Button label="Success toast" onPress={() => show('Profile saved', 'success')} />
        <Button label="Error toast" onPress={() => show('Network error. Please check your connection.', 'error')} variant="secondary" />
        <Button label="Warning toast" onPress={() => show('Your session will expire soon', 'warning')} variant="secondary" />
        <Button label="Info toast" onPress={() => show('New match found nearby!', 'info')} variant="secondary" />
      </View>
      <ToastOverlay />
    </SafeAreaProvider>
  );
}

const meta = {
  title: 'Feedback/Toast',
  component: ToastPlayground,
} satisfies Meta<typeof ToastPlayground>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Interactive: Story = {};
