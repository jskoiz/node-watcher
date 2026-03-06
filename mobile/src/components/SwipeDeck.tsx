import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { radii, shadows, spacing, typography } from '../theme/tokens';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const CARD_HEIGHT = Math.floor(SCREEN_HEIGHT * 0.65);

// Dark theme constants (SwipeDeck is always dark)
const DARK = {
  background: '#0D1117',
  surface: '#1C2330',
  accent: '#34D399',
  danger: '#F87171',
  primary: '#7C6AF7',
};

interface CardProps {
  user: any;
  onPress?: () => void;
}

const profileChips = (user: any) => {
  const chips: string[] = [];
  if (user.profile?.city) chips.push(user.profile.city);
  if (user.fitnessProfile?.primaryGoal) chips.push(user.fitnessProfile.primaryGoal);
  if (user.fitnessProfile?.intensityLevel) chips.push(user.fitnessProfile.intensityLevel);
  return chips.slice(0, 3);
};

const getIntentLabel = (intent?: string) => {
  if (intent === 'dating') return '❤️ Dating';
  if (intent === 'workout') return '💪 Workout';
  return '🔀 Both';
};

const Card = ({ user, onPress }: CardProps) => {
  const primaryPhoto = user.photos?.find((p: any) => p.isPrimary)?.storageKey || user.photoUrl;
  const chips = profileChips(user);
  const intentLabel = getIntentLabel(user.profile?.intent);

  return (
    <TouchableOpacity
      activeOpacity={0.96}
      onPress={onPress}
      style={[styles.card, shadows.card]}
    >
      <View style={styles.imageContainer}>
        {primaryPhoto ? (
          <Image source={{ uri: primaryPhoto }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.initials}>{user.firstName?.[0] || '?'}</Text>
          </View>
        )}

        {/* Top badges row */}
        <View style={styles.topBadges}>
          {/* Active now — accent green */}
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>● Active now</Text>
          </View>

          {/* Intent badge — top right */}
          <View style={styles.intentBadge}>
            <Text style={styles.intentBadgeText}>{intentLabel}</Text>
          </View>
        </View>

        {/* Gradient overlay — layered rgba */}
        <View style={styles.gradientOverlay} pointerEvents="none">
          <View style={styles.gradientTop} />
          <View style={styles.gradientMid} />
          <View style={styles.gradientBottom} />
        </View>

        {/* Card info overlay */}
        <View style={styles.overlay}>
          <Text style={styles.name}>
            {user.firstName || 'Someone'}{user.age ? `, ${user.age}` : ''}
          </Text>
          <Text style={styles.bio} numberOfLines={2}>
            {user.profile?.bio || 'Looking for a compatible training partner.'}
          </Text>
          <View style={styles.chipRow}>
            {chips.length > 0
              ? chips.map((chip) => (
                  <View key={chip} style={styles.chip}>
                    <Text style={styles.chipText}>{chip}</Text>
                  </View>
                ))
              : (
                <View style={styles.chip}>
                  <Text style={styles.chipText}>Nearby</Text>
                </View>
              )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface SwipeDeckProps {
  data: any[];
  onSwipeLeft: (user: any) => void;
  onSwipeRight: (user: any) => void;
  onPress?: (user: any) => void;
}

export default function SwipeDeck({ data, onSwipeLeft, onSwipeRight, onPress }: SwipeDeckProps) {
  const swiperRef = useRef<Swiper<any>>(null);

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No new profiles tonight</Text>
        <Text style={styles.emptyText}>You've seen everyone nearby. Check back soon for fresh faces.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Swiper
        ref={swiperRef}
        cards={data}
        renderCard={(card) => <Card user={card} onPress={() => onPress && onPress(card)} />}
        onSwipedLeft={(index) => onSwipeLeft(data[index])}
        onSwipedRight={(index) => onSwipeRight(data[index])}
        cardIndex={0}
        backgroundColor={DARK.background}
        stackSize={3}
        stackSeparation={14}
        cardVerticalMargin={8}
        cardHorizontalMargin={16}
        containerStyle={styles.swiperContainer}
        animateOverlayLabelsOpacity
        animateCardOpacity
        disableTopSwipe
        disableBottomSwipe
        swipeBackCard
        overlayLabels={{
          left: {
            title: 'PASS',
            style: {
              label: styles.overlayReject,
              wrapper: styles.overlayWrapperLeft,
            },
          },
          right: {
            title: 'LIKE',
            style: {
              label: styles.overlayLike,
              wrapper: styles.overlayWrapperRight,
            },
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK.background,
  },
  swiperContainer: {
    flex: 1,
    backgroundColor: DARK.background,
    paddingBottom: spacing.xxxl,
  },
  card: {
    borderRadius: 24,
    backgroundColor: DARK.surface,
    overflow: 'hidden',
    height: CARD_HEIGHT,
    width: '100%',
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: DARK.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 86,
    color: '#F0F6FF',
    fontWeight: '700',
  },
  topBadges: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: DARK.accent,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  activeBadgeText: {
    color: '#0D1117',
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  intentBadge: {
    backgroundColor: 'rgba(28,35,48,0.85)',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  intentBadgeText: {
    color: '#F0F6FF',
    fontSize: typography.caption,
    fontWeight: '700',
  },
  // Layered gradient simulation
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
  },
  gradientTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.0)',
  },
  gradientMid: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.30)',
  },
  gradientBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  name: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  bio: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: typography.caption,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
    backgroundColor: DARK.background,
  },
  emptyTitle: {
    color: '#F0F6FF',
    fontSize: typography.h2,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
    fontSize: typography.body,
  },
  overlayReject: {
    borderColor: DARK.danger,
    color: DARK.danger,
    borderWidth: 2.5,
    fontSize: 30,
    fontWeight: '900',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
  overlayLike: {
    borderColor: DARK.accent,
    color: DARK.accent,
    borderWidth: 2.5,
    fontSize: 30,
    fontWeight: '900',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
  overlayWrapperLeft: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginTop: 42,
    marginLeft: -30,
  },
  overlayWrapperRight: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: 42,
    marginLeft: 30,
  },
});
