import React from 'react';
import { render } from '@testing-library/react-native';
import { ChatMessageList } from '../components/ChatMessageList';
import type { Theme } from '../../../theme/tokens';

jest.mock('../components/EventInviteCard', () => ({
  EventInviteCard: ({ title }: { title: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text>{title}</Text>;
  },
}));

const MOCK_THEME: Theme = {
  primary: '#C4A882',
  accent: '#8BAA7A',
  background: '#FDFBF8',
  surface: '#FFFFFF',
  surfaceElevated: '#F7F4F0',
  textPrimary: '#2C2420',
  textSecondary: '#7A7068',
  textMuted: '#B0A89E',
  border: '#E8E2DA',
  borderSoft: '#F0EBE4',
  danger: '#CC4444',
  white: '#FFFFFF',
  energy: '#E8A838',
  primarySubtle: 'rgba(196,168,130,0.12)',
} as Theme;

describe('ChatMessageList accessibility', () => {
  it('labels sent messages with "You:" prefix', () => {
    const { getByLabelText } = render(
      <ChatMessageList
        messages={[{ id: 'm1', text: 'Hello there', sender: 'me' }]}
        onRefresh={() => undefined}
        refreshing={false}
        theme={MOCK_THEME}
      />,
    );
    expect(getByLabelText('You: Hello there')).toBeTruthy();
  });

  it('labels received messages with "Them:" prefix', () => {
    const { getByLabelText } = render(
      <ChatMessageList
        messages={[{ id: 'm2', text: 'Hey!', sender: 'them' }]}
        onRefresh={() => undefined}
        refreshing={false}
        theme={MOCK_THEME}
      />,
    );
    expect(getByLabelText('Them: Hey!')).toBeTruthy();
  });

  it('renders invite-card content when an event invite message is present', () => {
    const { getByText } = render(
      <ChatMessageList
        eventInvites={{
          'event-1': {
            eventId: 'event-1',
            title: 'Sunrise Run',
            location: 'Magic Island',
            startsAt: '2026-03-17T06:00:00.000Z',
            status: 'pending',
            isMe: false,
          },
        }}
        messages={[{ id: 'm3', text: '[EVENT_INVITE:event-1]', sender: 'them' }]}
        onRefresh={() => undefined}
        refreshing={false}
        theme={MOCK_THEME}
      />,
    );

    expect(getByText('Sunrise Run')).toBeTruthy();
  });

  it('renders a stable placeholder invite card when invite metadata is missing', () => {
    const { getByText } = render(
      <ChatMessageList
        messages={[{ id: 'm4', text: '[EVENT_INVITE:event-2]', sender: 'them' }]}
        onRefresh={() => undefined}
        refreshing={false}
        theme={MOCK_THEME}
      />,
    );

    expect(getByText('Loading event...')).toBeTruthy();
  });
});
