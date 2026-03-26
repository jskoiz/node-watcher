import type { DiscoveryUser, User } from '../../api/types';

export type SwipeDeckUser = User &
  Pick<Partial<DiscoveryUser>, 'distanceKm' | 'recommendationScore'>;

export interface SwipeDeckProps {
  cardHeight?: number;
  data: SwipeDeckUser[];
  onPress?: (user: SwipeDeckUser) => void;
  onSwipeLeft: (user: SwipeDeckUser) => void;
  onSwipeRight: (user: SwipeDeckUser) => void;
}

export interface SwipeDeckCardProps {
  cardHeight: number;
  onPress?: () => void;
  user: SwipeDeckUser;
}
