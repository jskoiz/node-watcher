import React from 'react';
import {
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { AppNotification } from '../../../api/types';
import AppIcon from '../../../components/ui/AppIcon';
import { StatePanel } from '../../../design/primitives';
import { radii, spacing, typography } from '../../../theme/tokens';
import type { Theme } from '../../../theme/tokens';
import {
  buildNotificationSections,
  type NotificationSectionTitle,
} from '../notificationPresentation';
import { NotificationRow } from './NotificationRow';

interface NotificationSection {
  data: AppNotification[];
  title: NotificationSectionTitle;
}

interface NotificationsFeedProps {
  actionError: string | null;
  errorMessage: string | null;
  isLoading: boolean;
  isRefetching: boolean;
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onNavigate: (notification: AppNotification) => void;
  onRefresh: () => void;
  theme: Theme;
}

function NotificationsEmptyState({ theme }: { theme: Theme }) {
  return (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyIconWrap,
          {
            backgroundColor: theme.surfaceElevated,
            borderColor: theme.border,
          },
        ]}
      >
        <AppIcon name="bell" size={24} color={theme.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
        No notifications
      </Text>
      <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>
        You'll see matches, messages, and event updates here.
      </Text>
    </View>
  );
}

function NotificationsActionError({
  message,
  theme,
}: {
  message: string;
  theme: Theme;
}) {
  return (
    <View style={styles.routeError}>
      <Text style={[styles.routeErrorText, { color: theme.danger }]}>
        {message}
      </Text>
    </View>
  );
}

export function NotificationsFeed({
  actionError,
  errorMessage,
  isLoading,
  isRefetching,
  notifications,
  onMarkRead,
  onNavigate,
  onRefresh,
  theme,
}: NotificationsFeedProps) {
  const sections = React.useMemo<NotificationSection[]>(
    () => buildNotificationSections(notifications),
    [notifications],
  );

  if (isLoading) {
    return <StatePanel title="Loading notifications" loading />;
  }

  if (errorMessage && notifications.length === 0) {
    return (
      <StatePanel
        title="Couldn't load notifications"
        description={errorMessage}
        actionLabel="Try again"
        onAction={onRefresh}
        isError
      />
    );
  }

  if (notifications.length === 0) {
    return <NotificationsEmptyState theme={theme} />;
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <NotificationRow
          notification={item}
          theme={theme}
          onMarkRead={onMarkRead}
          onNavigate={onNavigate}
        />
      )}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={[styles.groupLabel, { color: theme.textMuted }]}>
          {title}
        </Text>
      )}
      ListHeaderComponent={
        actionError ? (
          <NotificationsActionError message={actionError} theme={theme} />
        ) : null
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      stickySectionHeadersEnabled={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching && !isLoading}
          onRefresh={onRefresh}
          tintColor={theme.primary}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  routeError: {
    backgroundColor: 'rgba(196, 168, 130, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(196, 168, 130, 0.32)',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  routeErrorText: {
    fontSize: typography.caption,
    lineHeight: 18,
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: 64,
  },
  groupLabel: {
    fontSize: typography.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl || 40,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.h3,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyBody: {
    fontSize: typography.body,
    textAlign: 'center',
    lineHeight: 24,
  },
});
