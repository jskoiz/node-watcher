import React from 'react';
import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { User } from '../../../api/types';
import { getAvatarInitial, getPrimaryPhotoUri } from '../../../lib/profilePhotos';
import { useTheme } from '../../../theme/useTheme';
import { PRIMARY_GOAL_OPTIONS } from './profile.helpers';
import { profileStyles as styles } from './profile.styles';

export function ProfileHero({
  primaryGoal,
  profile,
}: {
  primaryGoal: string;
  profile: User;
}) {
  const theme = useTheme();
  const primaryPhoto = getPrimaryPhotoUri(profile);
  const primaryGoalLabel = primaryGoal
    ? PRIMARY_GOAL_OPTIONS.find((o) => o.value === primaryGoal)?.label ??
      primaryGoal
    : null;

  return (
    <View style={styles.hero}>
      <View style={styles.heroPhotoWrap}>
        {primaryPhoto ? (
          <Image
            source={{ uri: primaryPhoto }}
            style={styles.heroPhoto}
            contentFit="cover"
            accessibilityLabel="Your profile photo"
          />
        ) : (
          <LinearGradient
            colors={[theme.accentPrimary, theme.subduedSurface]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroFallback}
          >
            <Text style={styles.heroFallbackText}>
              {getAvatarInitial(profile.firstName)}
            </Text>
          </LinearGradient>
        )}
        <LinearGradient
          colors={['rgba(29,24,20,0)', 'rgba(29,24,20,0.12)', 'rgba(29,24,20,0.62)']}
          style={styles.heroOverlay}
        >
          <View style={[styles.heroCopyCard, { backgroundColor: 'rgba(255,250,244,0.94)' }]}>
            <Text style={[styles.heroName, { color: theme.textPrimary }]} accessibilityRole="header">
              {profile.firstName}
              {profile.age ? `, ${profile.age}` : ''}
            </Text>
            {primaryGoalLabel ? (
              <View style={[styles.intentBadge, { backgroundColor: theme.accentSoft }]}>
                <Text style={[styles.intentBadgeText, { color: theme.accentPrimary }]}>{primaryGoalLabel}</Text>
              </View>
            ) : null}
            <Text style={[styles.heroLocation, { color: theme.textSecondary }]}>
              {profile.profile?.city || 'Location not set'}
            </Text>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}
