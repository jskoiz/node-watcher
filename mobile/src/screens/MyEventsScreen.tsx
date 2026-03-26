import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../theme/useTheme';
import type {
  RootStackScreenProps,
} from '../core/navigation/types';
import { MyEventsScreenContent } from '../features/events/my-events/MyEventsScreenContent';
import { useMyEventsScreenState } from '../features/events/my-events/useMyEventsScreenState';

export default function MyEventsScreen({
  navigation,
}: RootStackScreenProps<'MyEvents'>) {
  const theme = useTheme();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const {
    activeTab,
    displayedEvents,
    emptyState,
    errorMessage,
    isLoading,
    isRefetching,
    setActiveTab,
    tabCounts,
    refetch,
  } = useMyEventsScreenState({ currentUserId });

  return (
    <MyEventsScreenContent
      activeTab={activeTab}
      canGoBack={navigation.canGoBack()}
      displayedEvents={displayedEvents}
      emptyState={emptyState}
      errorMessage={errorMessage}
      isLoading={isLoading}
      isRefetching={isRefetching}
      onEventPress={(eventId) =>
        navigation.navigate('EventDetail', { eventId })
      }
      onGoBack={() => navigation.goBack()}
      onRefresh={() => {
        void refetch();
      }}
      onSelectTab={setActiveTab}
      onTabEmptyCtaPress={(route) => navigation.navigate('Main', { screen: route })}
      tabCounts={tabCounts}
      theme={theme}
    />
  );
}
