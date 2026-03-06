import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import client from '../api/client';
import { normalizeApiError } from '../api/errors';
import AppBackButton from '../components/ui/AppBackButton';
import AppButton from '../components/ui/AppButton';
import { useTheme } from '../theme/useTheme';
import { radii, spacing, typography } from '../theme/tokens';
import { type SessionIntent } from '../store/intentStore';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HERO_HEIGHT = 420;

const BASE = '#0D1117';
const SURFACE = '#161B22';
const PRIMARY = '#7C6AF7';
const ACCENT = '#34D399';
const BORDER = 'rgba(255,255,255,0.08)';
const TEXT_PRIMARY = '#F0F6FC';
const TEXT_MUTED = 'rgba(240,246,252,0.45)';

export default function ProfileDetailScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { user } = route.params as any;
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const primaryPhoto = user.photos?.find((p: any) => p.isPrimary)?.storageKey || user.photoUrl;
  const activityTags: string[] = (user.fitnessProfile?.favoriteActivities || '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);

  const intent: SessionIntent | null =
    user.profile?.intentDating && user.profile?.intentWorkout ? 'both' :
    user.profile?.intentDating ? 'dating' :
    user.profile?.intentWorkout ? 'workout' :
    null;

  const intentDisplay =
    intent === 'dating' ? '❤️ Dating' :
    intent === 'workout' ? '💪 Workout Partner' :
    intent === 'both' ? '🔀 Dating + Workout' :
    null;

  const ACTIVITY_EMOJI_MAP: Record<string, string> = {
    lifting: '🏋️', yoga: '🧘', surfing: '🏄', hiking: '🥾', running: '🏃',
    cycling: '🚴', beach: '🏖️', climbing: '🧗', skiing: '⛷️', swimming: '🏊',
    boxing: '🥊', crossfit: '🤸',
  };

  const handleSuggestActivity = () => {
    const firstActivity = activityTags[0] || 'a workout';
    const suggestion = `🏃 Let's plan ${firstActivity} together!`;
    navigation.navigate('Chat', { matchId: user.id, user, prefillMessage: suggestion });
  };

  const handlePass = async () => {
    setSubmitting(true);
    try {
      await client.post(`/discovery/pass/${user.id}`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Could not pass profile', normalizeApiError(error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async () => {
    setSubmitting(true);
    try {
      await client.post(`/discovery/like/${user.id}`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Could not like profile', normalizeApiError(error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Full-bleed hero image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: primaryPhoto || 'https://via.placeholder.com/400x500' }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Rich gradient overlay bottom */}
          <LinearGradient
            colors={['transparent', 'rgba(13,17,23,0.7)', 'rgba(13,17,23,0.98)']}
            locations={[0, 0.55, 1]}
            style={styles.heroGradient}
          />

          {/* Back button overlay */}
          <View style={styles.backButtonOverlay}>
            <AppBackButton onPress={() => navigation.goBack()} style={{ marginBottom: 0 }} />
          </View>

          {/* Name overlay */}
          <View style={styles.heroNameOverlay}>
            {intentDisplay && (
              <View style={styles.intentPill}>
                <Text style={styles.intentPillText}>{intentDisplay}</Text>
              </View>
            )}
            <Text style={styles.heroName}>
              {user.firstName || 'Someone'}{user.age ? `, ${user.age}` : ''}
            </Text>
            <Text style={styles.heroLocation}>
              📍 {user.profile?.city || 'Nearby'}
            </Text>

            {/* Activity tags */}
            {activityTags.length > 0 && (
              <View style={styles.tagRow}>
                {activityTags.slice(0, 4).map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>
                      {ACTIVITY_EMOJI_MAP[tag.toLowerCase()] || '🏃'} {tag}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Content area — no card/border, just dark surface seamlessly */}
        <View style={styles.contentArea}>

          {/* About */}
          {!!user.profile?.bio && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>About</Text>
              <Text style={styles.bio}>{user.profile.bio}</Text>
            </View>
          )}

          {/* Fitness details */}
          {user.fitnessProfile && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Fitness Profile</Text>
              <View style={styles.metaGrid}>
                {user.fitnessProfile.intensityLevel ? (
                  <MetaChip label="intensity" value={user.fitnessProfile.intensityLevel} />
                ) : null}
                {user.fitnessProfile.weeklyFrequencyBand ? (
                  <MetaChip label="frequency" value={`${user.fitnessProfile.weeklyFrequencyBand}x/wk`} />
                ) : null}
                {user.fitnessProfile.primaryGoal ? (
                  <MetaChip label="goal" value={user.fitnessProfile.primaryGoal} />
                ) : null}
              </View>
            </View>
          )}

          {/* Movement Identity section */}
          {activityTags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Movement Identity</Text>
              <View style={styles.activityPills}>
                {activityTags.map((tag, i) => {
                  const emoji = ACTIVITY_EMOJI_MAP[tag.toLowerCase()] || '🏃';
                  const isAccent = i % 2 === 0;
                  return (
                    <View
                      key={tag}
                      style={[
                        styles.activityPill,
                        {
                          backgroundColor: isAccent ? 'rgba(52,211,153,0.12)' : 'rgba(124,106,247,0.12)',
                          borderColor: isAccent ? 'rgba(52,211,153,0.4)' : 'rgba(124,106,247,0.4)',
                        },
                      ]}
                    >
                      <Text style={styles.activityPillEmoji}>{emoji}</Text>
                      <Text
                        style={[
                          styles.activityPillText,
                          { color: isAccent ? ACCENT : PRIMARY },
                        ]}
                      >
                        {tag}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Suggest Activity button */}
              <Pressable
                onPress={handleSuggestActivity}
                style={styles.suggestBtn}
              >
                <LinearGradient
                  colors={['rgba(52,211,153,0.15)', 'rgba(52,211,153,0.05)']}
                  style={styles.suggestBtnInner}
                >
                  <Text style={styles.suggestBtnText}>
                    🎯 Suggest an Activity
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Pinned action buttons */}
      <LinearGradient
        colors={['rgba(13,17,23,0)', 'rgba(13,17,23,0.95)', '#0D1117']}
        style={styles.actionBar}
      >
        <View style={styles.actionRow}>
          <AppButton
            label="Pass"
            variant="secondary"
            onPress={handlePass}
            disabled={submitting}
            style={styles.actionBtn}
          />
          <AppButton
            label="Like ✦"
            variant="primary"
            onPress={handleLike}
            disabled={submitting}
            loading={submitting}
            style={styles.actionBtnPrimary}
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaChip}>
      <Text style={styles.metaChipLabel}>{label}</Text>
      <Text style={styles.metaChipValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BASE,
  },
  scrollContent: {
    paddingBottom: 130,
  },

  // Hero
  heroContainer: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT * 0.75,
  },
  backButtonOverlay: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    backgroundColor: 'rgba(13,17,23,0.6)',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  heroNameOverlay: {
    position: 'absolute',
    bottom: spacing.xxl,
    left: spacing.xxl,
    right: spacing.xxl,
  },
  intentPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(124,106,247,0.25)',
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(124,106,247,0.5)',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginBottom: spacing.sm,
  },
  intentPillText: {
    color: PRIMARY,
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heroName: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroLocation: {
    fontSize: typography.bodySmall,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Content
  contentArea: {
    backgroundColor: BASE,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    fontWeight: '800',
    color: PRIMARY,
    marginBottom: spacing.md,
  },
  bio: {
    fontSize: typography.body,
    lineHeight: 28,
    color: TEXT_PRIMARY,
    opacity: 0.88,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaChip: {
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: 'rgba(124,106,247,0.1)',
    borderColor: 'rgba(124,106,247,0.35)',
  },
  metaChipLabel: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: TEXT_MUTED,
    marginBottom: 2,
  },
  metaChipValue: {
    fontSize: typography.bodySmall,
    fontWeight: '800',
    textTransform: 'capitalize',
    color: PRIMARY,
  },

  // Activity pills
  activityPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  activityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    gap: 5,
  },
  activityPillEmoji: {
    fontSize: 14,
  },
  activityPillText: {
    fontSize: typography.bodySmall,
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  // Suggest btn
  suggestBtn: {
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(52,211,153,0.4)',
    overflow: 'hidden',
  },
  suggestBtnInner: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  suggestBtnText: {
    fontSize: typography.body,
    fontWeight: '800',
    color: ACCENT,
  },

  // Action bar
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 24,
    paddingBottom: spacing.xxl,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  actionBtn: {
    flex: 1,
  },
  actionBtnPrimary: {
    flex: 2,
  },
});
