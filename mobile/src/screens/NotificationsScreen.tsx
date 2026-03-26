import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AppNotification } from '../api/types';
import AppBackdrop from '../components/ui/AppBackdrop';
import { useTheme } from '../theme/useTheme';
import { NotificationsFeed } from '../features/notifications/components/NotificationsFeed';
import { NotificationsHeader } from '../features/notifications/components/NotificationsHeader';
import { useNotificationsScreenState } from '../features/notifications/hooks/useNotificationsScreenState';
import { resolveNotificationNavigation } from '../features/notifications/notificationNavigation';
import type { RootStackScreenProps } from '../core/navigation/types';

export default function NotificationsScreen({
  navigation,
}: RootStackScreenProps<'Notifications'>) {
  const theme = useTheme();
  const {
    actionError,
    errorMessage,
    handleMarkAllRead,
    handleMarkRead,
    isRefetching,
    isLoading,
    notifications,
    refetch,
    setActionError,
    unreadCount,
  } = useNotificationsScreenState();

  const handleNavigate = useCallback((notif: AppNotification) => {
    setActionError(null);
    const result = resolveNotificationNavigation(notif);
    if (!result.ok) {
      setActionError(result.error);
      return;
    }

    if (result.target.route === 'Chat') {
      navigation.navigate('Chat', result.target.params);
      return;
    }

    if (result.target.route === 'EventDetail') {
      navigation.navigate('EventDetail', result.target.params);
      return;
    }

    navigation.navigate('ProfileDetail', result.target.params);
  }, [navigation, setActionError]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <AppBackdrop />
      <NotificationsHeader
        onClearAll={() => {
          void handleMarkAllRead();
        }}
        onGoBack={() => navigation.goBack()}
        theme={theme}
        unreadCount={unreadCount}
      />
      <NotificationsFeed
        actionError={actionError}
        errorMessage={errorMessage}
        isLoading={isLoading}
        isRefetching={isRefetching}
        notifications={notifications}
        onMarkRead={(id) => {
          void handleMarkRead(id);
        }}
        onNavigate={handleNavigate}
        onRefresh={() => {
          void refetch();
        }}
        theme={theme}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
