import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { eventsApi } from '../services/api';
import { normalizeApiError } from '../api/errors';
import type { EventSummary } from '../api/types';
import AppBackButton from '../components/ui/AppBackButton';
import AppState from '../components/ui/AppState';
import { useTheme } from '../theme/useTheme';
import { radii, spacing, typography } from '../theme/tokens';

type TabKey = 'Joined' | 'Created' | 'Saved';
const TABS: TabKey[] = ['Joined', 'Created', 'Saved'];

const EMPTY_STATES: Record<TabKey, { icon: string; title: string; body: string; cta: string; route: string }> = {
  Joined: {
    icon: '🎉',
    title: 'No events joined yet',
    body: 'Find something that excites you and jump in.',
    cta: 'Explore Events',
    route: 'Explore',
  },
  Created: {
    icon: '✨',
    title: "You haven't hosted anything yet",
    body: 'Start an activity and invite people to move with you.',
    cta: 'Create Activity',
    route: 'Create',
  },
  Saved: {
    icon: '🔖',
    title: 'Nothing saved yet',
    body: 'Bookmark events you want to revisit later.',
    cta: 'Browse Events',
    route: 'Explore',
  },
};

function formatDate(startsAt: string) {
  return new Date(startsAt).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MyEventsScreen({ navigation }: any) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>('Joined');
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const response = await eventsApi.mine();
      setEvents(response.data || []);
    } catch (err) {
      setError(normalizeApiError(err).message);
    } finally {
      if (silent) setRefreshing(false);
      else setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchEvents(); }, []));

  const emptyMeta = EMPTY_STATES[activeTab];

  // For "Created" and "Saved" tabs we show empty state since API only provides joined events
  const displayedEvents = activeTab === 'Joined' ? events : [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        {navigation.canGoBack() && (
          <AppBackButton onPress={() => navigation.goBack()} />
        )}
        <Text style={[styles.title, { color: theme.textPrimary }]}>My Events</Text>
      </View>

      {/* Tab Switcher */}
      <View style={[styles.tabBar, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && [styles.tabActive, { backgroundColor: theme.primary }],
            ]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab ? theme.white : theme.textMuted },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {loading ? (
        <AppState title="Loading your events" loading />
      ) : error ? (
        <AppState
          title="Couldn't load events"
          description={error}
          actionLabel="Try again"
          onAction={fetchEvents}
          isError
        />
      ) : displayedEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>{emptyMeta.icon}</Text>
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>{emptyMeta.title}</Text>
          <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>{emptyMeta.body}</Text>
          <TouchableOpacity
            style={[styles.emptyCta, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate(emptyMeta.route)}
            activeOpacity={0.85}
          >
            <Text style={[styles.emptyCtaText, { color: theme.white }]}>{emptyMeta.cta}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={displayedEvents}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchEvents(true)}
              tintColor={theme.primary}
            />
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}
              onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
            >
              {/* Category bar */}
              {!!item.category && (
                <View style={[styles.cardCategoryBar, { backgroundColor: theme.primary + '22' }]}>
                  <Text style={[styles.cardCategory, { color: theme.primary }]}>{item.category}</Text>
                </View>
              )}
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.cardMeta, { color: theme.textSecondary }]}>
                  📅 {formatDate(item.startsAt)}
                </Text>
                {!!item.location && (
                  <Text style={[styles.cardMeta, { color: theme.textMuted }]}>
                    📍 {item.location}
                  </Text>
                )}
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.h1,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.xxl,
    borderRadius: radii.pill,
    borderWidth: 1,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  tabActive: {},
  tabText: {
    fontSize: typography.bodySmall,
    fontWeight: '700',
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl || 40,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.h3,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  emptyBody: {
    fontSize: typography.body,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  emptyCta: {
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: radii.pill,
  },
  emptyCtaText: {
    fontSize: typography.body,
    fontWeight: '800',
  },

  // Event cards
  list: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxl || 48,
  },
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  cardCategoryBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  cardCategory: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBody: {
    padding: spacing.md,
  },
  cardTitle: {
    fontSize: typography.body,
    fontWeight: '800',
    marginBottom: spacing.xs,
    letterSpacing: -0.2,
  },
  cardMeta: {
    fontSize: typography.bodySmall,
    marginBottom: 3,
  },
});
