import React from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import type { ChatMessage } from '../../../api/types';
import type { Theme } from '../../../theme/tokens';
import { chatStyles as styles } from './chat.styles';
import { EventInviteCard } from './EventInviteCard';
import type { EventInviteCardProps } from './EventInviteCard';

/** Pattern for detecting event invite messages: [EVENT_INVITE:<eventId>] */
const EVENT_INVITE_PATTERN = /\[EVENT_INVITE:([^\]]+)\]/;
/** Far-future placeholder so loading cards are never treated as expired. */
const PENDING_EVENT_STARTS_AT = '2099-01-01T00:00:00.000Z';

export function parseEventInviteMessage(text: string): string | null {
  const match = EVENT_INVITE_PATTERN.exec(text);
  return match ? match[1] : null;
}

const ChatBubble = React.memo(function ChatBubble({
  eventInvites,
  item,
  onNavigateToEvent,
  theme,
}: {
  eventInvites?: Record<string, EventInviteCardProps>;
  item: ChatMessage;
  onNavigateToEvent?: (eventId: string) => void;
  theme: Theme;
}) {
  const isMe = item.sender === 'me';
  const senderLabel = isMe ? 'You' : 'Them';
  const eventId = React.useMemo(() => parseEventInviteMessage(item.text), [item.text]);

  if (eventId) {
    const inviteData = eventInvites?.[eventId];
    if (inviteData) {
      return (
        <EventInviteCard
          {...inviteData}
          isMe={isMe}
          onNavigateToEvent={onNavigateToEvent}
        />
      );
    }

    return (
      <EventInviteCard
        eventId={eventId}
        title="Loading event..."
        location=""
        startsAt={PENDING_EVENT_STARTS_AT}
        status="pending"
        isMe={isMe}
        onNavigateToEvent={onNavigateToEvent}
      />
    );
  }

  return (
    <View
      style={[
        styles.bubble,
        isMe ? styles.bubbleMe : styles.bubbleThem,
        { backgroundColor: isMe ? theme.textPrimary : theme.surface },
      ]}
      accessibilityLabel={`${senderLabel}: ${item.text}`}
    >
      <Text
        style={[
          styles.bubbleText,
          { color: isMe ? theme.textInverse : theme.textPrimary },
        ]}
      >
        {item.text}
      </Text>
    </View>
  );
});

export const ChatMessageList = React.memo(function ChatMessageList({
  eventInvites,
  messages,
  onNavigateToEvent,
  onRefresh,
  refreshing,
  theme,
}: {
  eventInvites?: Record<string, EventInviteCardProps>;
  messages: ChatMessage[];
  onNavigateToEvent?: (eventId: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
  theme: Theme;
}) {
  const renderItem = React.useCallback(
    ({ item }: { item: ChatMessage }) => (
      <ChatBubble
        eventInvites={eventInvites}
        item={item}
        onNavigateToEvent={onNavigateToEvent}
        theme={theme}
      />
    ),
    [eventInvites, onNavigateToEvent, theme],
  );
  const keyExtractor = React.useCallback((item: ChatMessage) => item.id, []);

  return (
    <FlatList
      data={messages}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      inverted
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      windowSize={10}
      maxToRenderPerBatch={15}
      removeClippedSubviews
      initialNumToRender={20}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
        />
      }
    />
  );
});
