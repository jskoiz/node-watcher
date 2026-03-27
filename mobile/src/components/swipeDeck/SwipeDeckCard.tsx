import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { getAvatarInitial } from '../../lib/profilePhotos';
import { fontFamily } from '../../lib/fonts';
import { editorialColors, radii, spacing, typography } from '../../theme/tokens';
import AppIcon from '../ui/AppIcon';
import { buildSwipeDeckCardViewModel } from './swipeDeck.presentation';
import type { SwipeDeckCardProps } from './swipeDeck.types';

export const SwipeDeckCard = React.memo(
  ({ cardHeight, onPress, user }: SwipeDeckCardProps) => {
    const viewModel = buildSwipeDeckCardViewModel(user, cardHeight);
    const [imageFailed, setImageFailed] = React.useState(false);
    const shouldShowPhoto = Boolean(viewModel.primaryPhoto) && !imageFailed;

    React.useEffect(() => {
      setImageFailed(false);
    }, [user.id, viewModel.primaryPhoto]);

    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          { height: cardHeight, opacity: pressed ? 0.96 : 1 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`View profile of ${user.firstName || 'Someone'}${
          user.age ? `, age ${user.age}` : ''
        }`}
        accessibilityHint="Tap to view full profile. Swipe right to like, swipe left to pass."
      >
        <View style={styles.imageContainer}>
          {shouldShowPhoto ? (
            <Image
              source={{ uri: viewModel.primaryPhoto }}
              style={styles.image}
              contentFit="cover"
              contentPosition={{
                left: '48%',
                top: viewModel.compact ? '38%' : '41%',
              }}
              transition={180}
              onError={() => {
                setImageFailed(true);
              }}
              accessibilityLabel={`Photo of ${user.firstName || 'profile'}`}
            />
          ) : (
            <LinearGradient
              colors={['#F0EBE4', '#E8E2DA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.placeholderImage}
            >
              <Text style={styles.initials}>{getAvatarInitial(user.firstName)}</Text>
            </LinearGradient>
          )}

          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.0)', 'rgba(255,255,255,0.96)']}
            locations={[0, 0.42, 0.72]}
            style={styles.imageGradient}
            pointerEvents="none"
          />

          <View style={[styles.topChrome, viewModel.compact && styles.topChromeCompact]}>
            <View style={styles.badgeRow}>
              <View style={[styles.intentBadge, viewModel.compact && styles.intentBadgeCompact]}>
                <Text style={styles.intentBadgeText}>{viewModel.intentLabel}</Text>
              </View>

              {viewModel.alignmentLabel ? (
                <View style={[styles.matchBadge, viewModel.compact && styles.matchBadgeCompact]}>
                  <AppIcon name="star" size={12} color={editorialColors.matchBadgeText} />
                  <Text style={styles.matchBadgeText}>{viewModel.alignmentLabel}</Text>
                </View>
              ) : (
                <View style={[styles.presenceBadge, viewModel.compact && styles.presenceBadgeCompact]}>
                  <Text style={styles.presenceBadgeText}>{viewModel.presenceLabel}</Text>
                </View>
              )}
            </View>
          </View>

          <View
            style={[
              styles.bottomShell,
              viewModel.compact && styles.bottomShellCompact,
              viewModel.ultraCompact && styles.bottomShellUltraCompact,
            ]}
          >
            <Text style={[styles.name, viewModel.compact && styles.nameCompact]}>
              {viewModel.nameLine}
            </Text>
            <Text style={styles.metaLine}>{viewModel.locationLine}</Text>
            <Text
              style={[styles.bio, viewModel.compact && styles.bioCompact]}
              numberOfLines={viewModel.ultraCompact ? 1 : 2}
            >
              {viewModel.bio}
            </Text>
            <Text style={[styles.tempoLine, viewModel.compact && styles.tempoLineCompact]}>
              {viewModel.tempoLabel}
            </Text>

            <View style={[styles.chipRow, viewModel.compact && styles.chipRowCompact]}>
              {viewModel.chips.map((chip, index) => (
                <View key={`${chip}-${index}`} style={styles.chip}>
                  <Text style={styles.chipText}>{chip}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 28,
    backgroundColor: editorialColors.surface,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 3,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: editorialColors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 84,
    color: editorialColors.textMuted,
    fontWeight: '300',
    fontFamily: fontFamily.serifBold,
  },
  imageGradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  topChrome: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
  },
  topChromeCompact: {
    top: spacing.lg,
    left: spacing.md,
    right: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  intentBadge: {
    maxWidth: '58%',
    backgroundColor: editorialColors.badgeBg,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  intentBadgeCompact: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
  },
  intentBadgeText: {
    color: editorialColors.textPrimary,
    fontSize: typography.caption,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  presenceBadge: {
    backgroundColor: editorialColors.badgeBg,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  presenceBadgeCompact: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
  },
  presenceBadgeText: {
    color: editorialColors.textSecondary,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: editorialColors.matchBadgeBg,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  matchBadgeCompact: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
  },
  matchBadgeText: {
    color: editorialColors.matchBadgeText,
    fontSize: typography.caption,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  bottomShell: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    paddingTop: spacing.xxxl + spacing.md,
  },
  bottomShellCompact: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.xxxl,
  },
  bottomShellUltraCompact: {
    paddingBottom: spacing.sm,
    paddingTop: spacing.xxl + spacing.md,
  },
  name: {
    fontSize: 30,
    fontWeight: '700',
    fontFamily: fontFamily.serifBold,
    color: editorialColors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  nameCompact: {
    fontSize: 26,
    lineHeight: 30,
  },
  metaLine: {
    fontSize: typography.bodySmall,
    color: editorialColors.textSecondary,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  bio: {
    fontSize: 14,
    color: editorialColors.textOnImage,
    lineHeight: 21,
    marginTop: spacing.sm,
    maxWidth: '92%',
  },
  bioCompact: {
    marginTop: spacing.xs,
    maxWidth: '96%',
  },
  tempoLine: {
    fontSize: 11,
    color: editorialColors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: spacing.sm,
  },
  tempoLineCompact: {
    marginTop: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chipRowCompact: {
    marginTop: spacing.xs,
  },
  chip: {
    borderRadius: radii.pill,
    backgroundColor: 'rgba(44,36,32,0.08)',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  chipText: {
    color: editorialColors.textOnImage,
    fontSize: typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
