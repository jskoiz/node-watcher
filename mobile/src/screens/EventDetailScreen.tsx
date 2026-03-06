import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { eventsApi } from '../services/api';
import { normalizeApiError } from '../api/errors';
import type { EventDetail } from '../api/types';
import AppState from '../components/ui/AppState';
import AppButton from '../components/ui/AppButton';
import AppBackButton from '../components/ui/AppBackButton';
import { useTheme } from '../theme/useTheme';
import { radii, spacing, typography } from '../theme/tokens';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HERO_HEIGHT = 300;

function formatDateRange(startsAt: string, endsAt?: string | null) {
  const start = new Date(startsAt);
  const end = endsAt ? new Date(endsAt) : null;
  const date = start.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const startTime = start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const endTime = end ? end.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : null;
  return { date, time: endTime ? `${startTime} – ${endTime}` : startTime };
}

export default function EventDetailScreen({ route, navigation }: any) {
  const theme = useTheme();
  const eventId = route.params?.eventId as string;
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const fetchEvent = async () => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await eventsApi.detail(eventId);
      setEvent(response.data);
    } catch (err) {
      setError(normalizeApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvent(); }, [eventId]);

  const handleJoin = async () => {
    if (!event || joining || event.joined) return;
    setJoining(true);
    const prev = event;
    setEvent({ ...event, joined: true, attendeesCount: event.attendeesCount + 1 });
    try {
      const response = await eventsApi.rsvp(event.id);
      setEvent((current) => current ? { ...current, joined: true, attendeesCount: response.data.attendeesCount } : current);
    } catch {
      setEvent(prev);
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <AppState title="Loading event" loading />;
  if (error || !event) return <AppState title="Couldn't load event" description={error ?? 'Event not found'} actionLabel="Try again" onAction={fetchEvent} isError />;

  const dateInfo = formatDateRange(event.startsAt, event.endsAt);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Full-bleed hero */}
        <View style={styles.heroContainer}>
          {event.imageUrl ? (
            <Image source={{ uri: event.imageUrl }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: theme.surfaceElevated }]} />
          )}
          <View style={styles.heroOverlay} />

          {/* Back button overlay */}
          <View style={styles.backBtnOverlay}>
            <AppBackButton onPress={() => navigation.goBack()} style={{ marginBottom: 0 }} />
          </View>

          {/* Category badge */}
          {!!event.category && (
            <View style={[styles.heroBadge, { backgroundColor: theme.primary }]}>
              <Text style={[styles.heroBadgeText, { color: theme.white }]}>{event.category}</Text>
            </View>
          )}
        </View>

        {/* Content card overlapping hero */}
        <View style={[styles.contentCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{event.title}</Text>

          {/* Metadata rows */}
          <View style={styles.metaList}>
            <MetaRow icon="📅" label={dateInfo.date} sub={dateInfo.time} />
            <MetaRow icon="📍" label={event.location} />
            <MetaRow icon="👤" label={`Hosted by ${event.host.firstName}`} />
            <MetaRow icon="🙌" label={`${event.attendeesCount} attending`} />
          </View>

          {event.description ? (
            <View style={[styles.descSection, { borderTopColor: theme.border }]}>
              <Text style={[styles.descLabel, { color: theme.accent }]}>About this event</Text>
              <Text style={[styles.description, { color: theme.textSecondary }]}>{event.description}</Text>
            </View>
          ) : null}

          {/* CTA pinned inside card */}
          <View style={styles.ctaArea}>
            <AppButton
              label={event.joined ? "✓ You're going" : joining ? 'Joining…' : 'Join event'}
              onPress={handleJoin}
              disabled={event.joined}
              loading={joining}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaRow({ icon, label, sub }: { icon: string; label: string; sub?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaIcon}>{icon}</Text>
      <View>
        <Text style={[styles.metaLabel, { color: theme.textPrimary }]}>{label}</Text>
        {sub ? <Text style={[styles.metaSub, { color: theme.textSecondary }]}>{sub}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxxl },
  heroContainer: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT * 0.5,
    backgroundColor: 'rgba(28,23,20,0.35)',
  },
  backBtnOverlay: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    backgroundColor: 'rgba(28,23,20,0.50)',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  heroBadge: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  heroBadgeText: {
    fontSize: typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contentCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
    minHeight: 300,
  },
  title: {
    fontSize: typography.h1,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: spacing.lg,
    lineHeight: 36,
  },
  metaList: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  metaIcon: {
    fontSize: typography.body,
    lineHeight: 24,
    width: 26,
    textAlign: 'center',
  },
  metaLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    lineHeight: 24,
  },
  metaSub: {
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
  descSection: {
    borderTopWidth: 1,
    paddingTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  descLabel: {
    fontSize: typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.body,
    lineHeight: 26,
  },
  ctaArea: {
    marginTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
});
