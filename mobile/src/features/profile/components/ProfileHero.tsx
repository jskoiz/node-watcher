import React from 'react';
import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { User } from '../../../api/types';
import { getAvatarInitial, getPrimaryPhotoUri } from '../../../lib/profilePhotos';
import { PRIMARY_GOAL_OPTIONS } from './profile.helpers';
import { profileStyles as styles } from './profile.styles';

export function ProfileHero({
  primaryGoal,
  profile,
}: {
  primaryGoal: string;
  profile: User;
}) {
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
            colors={['#C4A882', '#B8A9C4']}
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
          colors={['transparent', '#FDFBF8']}
          style={styles.heroOverlay}
        >
          <View style={styles.heroCopyCard}>
            <Text style={styles.heroName} accessibilityRole="header">
              {profile.firstName}
              {profile.age ? `, ${profile.age}` : ''}
            </Text>
            {primaryGoalLabel ? (
              <View style={styles.intentBadge}>
                <Text style={styles.intentBadgeText}>{primaryGoalLabel}</Text>
              </View>
            ) : null}
            <Text style={styles.heroLocation}>
              {profile.profile?.city || 'Location not set'}
            </Text>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

