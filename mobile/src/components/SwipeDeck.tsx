import React, { useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { editorialColors, radii, spacing, typography } from '../theme/tokens';
import { fontFamily } from '../lib/fonts';
import AppIcon from './ui/AppIcon';
import { SwipeDeckCard } from './swipeDeck/SwipeDeckCard';
import { clampCardHeight } from './swipeDeck/swipeDeck.presentation';
import type { SwipeDeckProps, SwipeDeckUser } from './swipeDeck/swipeDeck.types';
import { useSwipeDeckController } from './swipeDeck/useSwipeDeckController';

export default function SwipeDeck({
  cardHeight,
  data,
  onSwipeLeft,
  onSwipeRight,
  onPress,
}: SwipeDeckProps) {
  const swiperRef = useRef<Swiper<SwipeDeckUser>>(null);
  const { allSwiped, handleSwipedAll, handleSwipedLeft, handleSwipedRight } =
    useSwipeDeckController({
      data,
      onSwipeLeft,
      onSwipeRight,
    });
  const resolvedCardHeight = clampCardHeight(cardHeight);
  const resolvedCardFrameStyle = useMemo(
    () => ({
      top: 0,
      left: 0,
      right: 0,
      width: '100%',
      height: resolvedCardHeight,
    }),
    [resolvedCardHeight],
  );

  if (!data || data.length === 0 || allSwiped) {
    return (
      <View style={styles.emptyContainer} accessibilityRole="summary" accessibilityLabel="No more profiles to show">
        <AppIcon name="compass" size={32} color={editorialColors.textMuted} style={{ marginBottom: spacing.md }} />
        <Text style={styles.emptyTitle}>No new profiles tonight</Text>
        <Text style={styles.emptyText}>
          You have seen everyone nearby. Check back later for fresh momentum.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Swiper
        ref={swiperRef}
        animateCardOpacity
        animateOverlayLabelsOpacity
        backgroundColor="transparent"
        cardHorizontalMargin={0}
        cardIndex={0}
        cardVerticalMargin={0}
        cardStyle={resolvedCardFrameStyle}
        cards={data}
        containerStyle={styles.swiperContainer}
        disableBottomSwipe
        disableTopSwipe
        onSwipedLeft={handleSwipedLeft}
        onSwipedRight={handleSwipedRight}
        onSwipedAll={handleSwipedAll}
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
        renderCard={(card) =>
          card ? (
            <SwipeDeckCard
              cardHeight={resolvedCardHeight}
              onPress={() => onPress && onPress(card)}
              user={card}
            />
          ) : null
        }
        stackSeparation={14}
        stackSize={2}
        swipeBackCard
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  swiperContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
    backgroundColor: 'transparent',
  },
  emptyTitle: {
    color: editorialColors.textPrimary,
    fontSize: typography.h2,
    fontWeight: '700',
    fontFamily: fontFamily.serifBold,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptyText: {
    color: editorialColors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
    fontSize: typography.body,
  },
  overlayReject: {
    borderColor: editorialColors.danger,
    color: editorialColors.danger,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: '700',
    fontFamily: fontFamily.serifBold,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.90)',
  },
  overlayLike: {
    borderColor: editorialColors.success,
    color: editorialColors.success,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: '700',
    fontFamily: fontFamily.serifBold,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.90)',
  },
  overlayWrapperLeft: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginTop: 40,
    marginLeft: -10,
  },
  overlayWrapperRight: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: 40,
    marginLeft: 10,
  },
});
