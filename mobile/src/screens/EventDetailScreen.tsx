import type { RootStackScreenProps } from '../core/navigation/types';
import { EventDetailView } from '../features/events/components/EventDetailView';
import { useEventDetailScreenController } from '../features/events/hooks/useEventDetailScreenController';

export default function EventDetailScreen({
  route,
  navigation,
}: RootStackScreenProps<'EventDetail'>) {
  const eventId = route.params?.eventId;
  const eventDetailScreenState = useEventDetailScreenController({
    eventId,
    onBack: () => navigation.goBack(),
  });

  return (
    <EventDetailView
      errorMessage={eventDetailScreenState.errorMessage}
      event={eventDetailScreenState.event}
      isJoining={eventDetailScreenState.isJoining}
      isLoading={eventDetailScreenState.isLoading}
      onBack={eventDetailScreenState.onBack}
      onJoin={eventDetailScreenState.onJoin}
      onRefresh={eventDetailScreenState.onRefresh}
    />
  );
}

export type { EventDetailViewProps } from '../features/events/components/EventDetailView';
export { EventDetailView };
