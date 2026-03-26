import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../lib/testing/renderWithProviders';
import { EventDetailView } from '../EventDetailScreen';

jest.mock('../../components/ui/AppBackButton', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ onPress }: { onPress: () => void }) => (
    <Text onPress={onPress}>Back</Text>
  );
});

jest.mock('../../components/ui/AppBackdrop', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../components/ui/AppIcon', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ name }: { name: string }) => <Text>{name}</Text>;
});

describe('EventDetailView', () => {
  const baseEvent = {
    id: 'event-1',
    title: 'Sunrise Run',
    description: 'Easy pace along the water.',
    location: 'Magic Island',
    imageUrl: null,
    category: 'running',
    startsAt: '2026-03-28T18:00:00.000Z',
    endsAt: '2026-03-28T19:00:00.000Z',
    host: { id: 'host-1', firstName: 'Ava' },
    attendeesCount: 6,
    joined: false,
  };

  it('renders the join button for guests', () => {
    const onJoin = jest.fn();

    renderWithProviders(
      <EventDetailView
        errorMessage={null}
        event={baseEvent}
        isJoining={false}
        isLoading={false}
        onBack={jest.fn()}
        onJoin={onJoin}
        onRefresh={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText('Join event'));
    expect(onJoin).toHaveBeenCalled();
  });
});
