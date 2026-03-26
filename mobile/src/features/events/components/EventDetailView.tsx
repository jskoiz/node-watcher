import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import type { EventDetail } from '../../../api/types';
import AppBackButton from '../../../components/ui/AppBackButton';
import AppBackdrop from '../../../components/ui/AppBackdrop';
import AppIcon from '../../../components/ui/AppIcon';
import { Button, StatePanel } from '../../../design/primitives';
import { useTheme } from '../../../theme/useTheme';
import { eventDetailStyles as styles } from './eventDetail.styles';
import { formatEventDateRange } from './eventDetail.formatters';
import { EventDetailMetaRow } from './EventDetailMetaRow';

export type EventDetailViewProps = {
  errorMessage: string | null;
  event: EventDetail | null;
  isJoining: boolean;
  isLoading: boolean;
  onBack: () => void;
  onJoin: () => void;
  onRefresh: () => void;
};

export function EventDetailView({
  errorMessage,
  event,
  isJoining,
  isLoading,
  onBack,
  onJoin,
  onRefresh,
}: EventDetailViewProps) {
  const theme = useTheme();

  if (isLoading) return <StatePanel title="Loading event" loading />;

  if (errorMessage || !event) {
    return (
      <StatePanel
        title="Couldn't load event"
        description={errorMessage ?? 'Event not found'}
        actionLabel="Try again"
        onAction={onRefresh}
        isError
      />
    );
  }

  const dateInfo = formatEventDateRange(event.startsAt, event.endsAt);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <AppBackdrop />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          {event.imageUrl ? (
            <Image
              source={{ uri: event.imageUrl }}
              style={styles.heroImage}
              contentFit="cover"
              accessibilityLabel={`Event image for ${event.title}`}
            />
          ) : (
            <View
              style={[styles.heroImage, { backgroundColor: theme.surfaceElevated }]}
              accessibilityLabel="No event image"
            />
          )}
          <View style={styles.heroOverlay} />

          <View style={styles.backBtnOverlay}>
            <AppBackButton onPress={onBack} style={{ marginBottom: 0 }} />
          </View>

          {!!event.category && (
            <View style={[styles.heroBadge, { backgroundColor: theme.primary }]} accessibilityLabel={`Category: ${event.category}`}>
              <Text style={[styles.heroBadgeText, { color: theme.white }]}>{event.category}</Text>
            </View>
          )}
        </View>

        <View style={[styles.contentCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.kicker, { color: theme.accent }]}>EVENT DETAIL / SOCIAL MOTION</Text>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{event.title}</Text>
          <View style={[styles.hostStrip, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
            <View style={[styles.hostAvatar, { backgroundColor: theme.primarySubtle, borderColor: theme.primary }]}>
              <Text style={[styles.hostAvatarText, { color: theme.primary }]}>
                {event.host.firstName?.[0] ?? 'H'}
              </Text>
            </View>
            <View style={styles.hostCopy}>
              <Text style={[styles.hostLabel, { color: theme.textMuted }]}>Hosted by</Text>
              <Text style={[styles.hostName, { color: theme.textPrimary }]}>
                {event.host.firstName}
              </Text>
            </View>
            <View
              style={[styles.hostPill, { borderColor: theme.border, minHeight: 36 }]}
              accessibilityLabel="Open invite"
              accessibilityRole="text"
            >
              <Text style={[styles.hostPillText, { color: theme.textSecondary }]}>Open invite</Text>
            </View>
          </View>

          <View style={styles.metaList}>
            <EventDetailMetaRow icon="calendar" label={dateInfo.date} sub={dateInfo.time} />
            <EventDetailMetaRow icon="map-pin" label={event.location} />
            <EventDetailMetaRow icon="users" label={`${event.attendeesCount} attending`} />
          </View>

          {event.description ? (
            <View style={[styles.descSection, { borderTopColor: theme.border }]}>
              <Text style={[styles.descLabel, { color: theme.accent }]}>About this event</Text>
              <Text style={[styles.description, { color: theme.textSecondary }]}>
                {event.description}
              </Text>
            </View>
          ) : null}

          <View style={styles.ctaArea}>
            <Button
              label={event.joined ? "You're going" : isJoining ? 'Joining…' : 'Join event'}
              onPress={onJoin}
              disabled={event.joined}
              loading={isJoining}
              variant="energy"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
