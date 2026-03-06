import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { discoveryApi, type DiscoveryFiltersInput } from '../services/api';
import SwipeDeck from '../components/SwipeDeck';
import MatchAnimation from '../components/MatchAnimation';
import { normalizeApiError } from '../api/errors';
import type { User } from '../api/types';
import AppState from '../components/ui/AppState';
import AppButton from '../components/ui/AppButton';
import { useTheme } from '../theme/useTheme';
import { radii, spacing, typography } from '../theme/tokens';

type SessionIntent = 'dating' | 'workout' | 'both';

const INTENT_OPTIONS: Array<{ value: SessionIntent; label: string; color: string }> = [
  { value: 'dating', label: '❤️ Dating', color: '#F87171' },
  { value: 'workout', label: '💪 Workout', color: '#7C6AF7' },
  { value: 'both', label: '🔀 Both', color: '#34D399' },
];

const goalOptions = ['strength', 'weight_loss', 'endurance', 'mobility'];
const intensityOptions = ['low', 'moderate', 'high'];
const availabilityOptions: Array<'morning' | 'evening'> = ['morning', 'evening'];

function getGreeting(name?: string) {
  const hour = new Date().getHours();
  const timeWord = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
  return `${timeWord}${name ? `, ${name}` : ''}`;
}

const FILTER_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'strength', label: '🏋️ Strength' },
  { id: 'running', label: '🏃 Running' },
  { id: 'yoga', label: '🧘 Yoga' },
  { id: 'hiking', label: '⛰️ Hiking' },
  { id: 'cycling', label: '🚴 Cycling' },
];

export default function HomeScreen({ navigation }: any) {
  const theme = useTheme();
  const user = useAuthStore((state) => state.user);
  const [feed, setFeed] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<User | null>(null);
  const [matchData, setMatchData] = useState<{ id: string } | null>(null);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sessionIntent, setSessionIntent] = useState<SessionIntent>('both');

  const [distanceKm, setDistanceKm] = useState('50');
  const [minAge, setMinAge] = useState('21');
  const [maxAge, setMaxAge] = useState('45');
  const [goals, setGoals] = useState<string[]>([]);
  const [intensity, setIntensity] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Array<'morning' | 'evening'>>([]);

  useEffect(() => {
    if (user && !user.isOnboarded) {
      setTimeout(() => navigation.navigate('Onboarding'), 100);
      return;
    }
    fetchFeed();
  }, [user]);

  const currentFilters = (): DiscoveryFiltersInput => ({
    distanceKm: Number(distanceKm) || undefined,
    minAge: Number(minAge) || undefined,
    maxAge: Number(maxAge) || undefined,
    goals: goals.length ? goals : undefined,
    intensity: intensity.length ? intensity : undefined,
    availability: availability.length ? availability : undefined,
  });

  const fetchFeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await discoveryApi.feed(currentFilters());
      setFeed(response.data || []);
    } catch (err) {
      setError(normalizeApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeLeft = async (profile: User) => {
    try { await discoveryApi.pass(profile.id); } catch {}
  };

  const handleSwipeRight = async (profile: User) => {
    try {
      const response = await discoveryApi.like(profile.id);
      if (response.data.status === 'match' && response.data.match) {
        setMatchedProfile(profile);
        setMatchData(response.data.match);
        setShowMatch(true);
      }
    } catch {}
  };

  const handleUndo = async () => {
    try {
      const response = await discoveryApi.undo();
      if (response.data.status === 'undone') await fetchFeed();
    } catch {}
  };

  const toggleValue = <T extends string>(current: T[], value: T, setter: (arr: T[]) => void) => {
    if (current.includes(value)) setter(current.filter((v) => v !== value));
    else setter([...current, value]);
  };

  const handleMatchAnimationFinish = () => {
    setShowMatch(false);
    if (matchedProfile && matchData)
      navigation.navigate('Chat', { matchId: matchData.id, user: matchedProfile });
    setMatchedProfile(null);
    setMatchData(null);
  };

  const cycleIntent = () => {
    const order: SessionIntent[] = ['both', 'dating', 'workout'];
    const idx = order.indexOf(sessionIntent);
    setSessionIntent(order[(idx + 1) % order.length]);
  };

  const intentOption = INTENT_OPTIONS.find(o => o.value === sessionIntent) || INTENT_OPTIONS[2];
  const activeFilterCount = goals.length + intensity.length + availability.length;

  if (loading) return <AppState title="Tuning your feed" description="Finding people who match your pace." loading />;
  if (error) return <AppState title="Couldn't load discovery" description={error} actionLabel="Try again" onAction={fetchFeed} isError />;

  return (
    <SafeAreaView style={styles.container}>
      {/* Ambient background glow */}
      <View style={styles.glowTopLeft} pointerEvents="none" />
      <View style={styles.glowBottomRight} pointerEvents="none" />

      {/* Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greetingEyebrow}>BRDG</Text>
          <Text style={styles.greeting}>
            {getGreeting(user?.firstName)} ✦
          </Text>
        </View>

        {/* Intent badge — tappable, pill with gradient border */}
        <Pressable onPress={cycleIntent} style={styles.intentBadgeWrap}>
          <LinearGradient
            colors={[intentOption.color + '55', intentOption.color + '22']}
            style={styles.intentBadge}
          >
            <Text style={[styles.intentBadgeText, { color: intentOption.color }]}>
              {intentOption.label}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Filter pills — horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterPillsRow}
        style={styles.filterPillsScroll}
      >
        {FILTER_CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => setActiveFilter(cat.id)}
            style={[
              styles.filterPill,
              activeFilter === cat.id
                ? styles.filterPillActive
                : styles.filterPillInactive,
            ]}
          >
            <Text
              style={[
                styles.filterPillText,
                { color: activeFilter === cat.id ? '#FFFFFF' : 'rgba(255,255,255,0.45)' },
              ]}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
        {/* Advanced filters button */}
        <Pressable
          onPress={() => setShowFiltersModal(true)}
          style={[
            styles.filterPill,
            activeFilterCount > 0 ? styles.filterPillActiveAccent : styles.filterPillInactive,
          ]}
        >
          <Text style={[styles.filterPillText, { color: activeFilterCount > 0 ? '#34D399' : 'rgba(255,255,255,0.4)' }]}>
            {activeFilterCount > 0 ? `⚙️ Filters (${activeFilterCount})` : '⚙️ More'}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Swipe deck */}
      <View style={styles.deckArea}>
        {feed.length === 0 ? (
          <AppState
            title="You're all caught up"
            description="Pull again in a bit or explore events nearby."
            actionLabel="Refresh"
            onAction={fetchFeed}
          />
        ) : (
          <SwipeDeck
            data={feed}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onPress={(profile) => navigation.navigate('ProfileDetail', { user: profile })}
          />
        )}
      </View>

      <MatchAnimation visible={showMatch} onFinish={handleMatchAnimationFinish} />

      {/* Advanced Filters Modal */}
      <Modal
        visible={showFiltersModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFiltersModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Filters</Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
            <Text style={styles.filterSectionLabel}>Distance & Age</Text>
            <View style={styles.filterInputRow}>
              <TextInput
                style={styles.miniInput}
                value={distanceKm}
                onChangeText={setDistanceKm}
                placeholder="km"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="numeric"
              />
              <TextInput
                style={styles.miniInput}
                value={minAge}
                onChangeText={setMinAge}
                placeholder="Min age"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="numeric"
              />
              <TextInput
                style={styles.miniInput}
                value={maxAge}
                onChangeText={setMaxAge}
                placeholder="Max age"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.filterSectionLabel}>Goals</Text>
            <View style={styles.pillWrap}>
              {goalOptions.map((g) => (
                <ModalFilterPill key={g} label={g} active={goals.includes(g)} onPress={() => toggleValue(goals, g, setGoals)} />
              ))}
            </View>

            <Text style={styles.filterSectionLabel}>Intensity</Text>
            <View style={styles.pillWrap}>
              {intensityOptions.map((i) => (
                <ModalFilterPill key={i} label={i} active={intensity.includes(i)} onPress={() => toggleValue(intensity, i, setIntensity)} />
              ))}
            </View>

            <Text style={styles.filterSectionLabel}>Availability</Text>
            <View style={styles.pillWrap}>
              {availabilityOptions.map((a) => (
                <ModalFilterPill key={a} label={a} active={availability.includes(a)} onPress={() => toggleValue(availability, a, setAvailability)} />
              ))}
            </View>

            <View style={styles.modalActions}>
              <AppButton
                label="↩ Undo swipe"
                onPress={() => { handleUndo(); setShowFiltersModal(false); }}
                variant="ghost"
                style={{ flex: 1 }}
              />
              <AppButton
                label="Apply"
                onPress={() => { fetchFeed(); setShowFiltersModal(false); }}
                variant="primary"
                style={{ flex: 1 }}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function ModalFilterPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterPill,
        active ? styles.filterPillActive : styles.filterPillInactive,
      ]}
    >
      <Text style={[styles.filterPillText, { color: active ? '#FFFFFF' : 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const BASE = '#0D1117';
const SURFACE = '#161B22';
const SURFACE_ELEVATED = '#1C2128';
const BORDER = 'rgba(255,255,255,0.08)';
const PRIMARY = '#7C6AF7';
const ACCENT = '#34D399';
const TEXT_PRIMARY = '#F0F6FC';
const TEXT_MUTED = 'rgba(240,246,252,0.45)';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BASE,
  },

  // Ambient glows
  glowTopLeft: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: PRIMARY,
    opacity: 0.07,
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: 100,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: ACCENT,
    opacity: 0.06,
  },

  // Header
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  greetingEyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
    color: PRIMARY,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  greeting: {
    fontSize: typography.h3,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    letterSpacing: -0.3,
  },

  // Intent badge
  intentBadgeWrap: {
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  intentBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  intentBadgeText: {
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // Filter pills
  filterPillsScroll: {
    maxHeight: 52,
    flexGrow: 0,
  },
  filterPillsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    alignItems: 'center',
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  filterPillActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  filterPillActiveAccent: {
    backgroundColor: 'rgba(52,211,153,0.15)',
    borderColor: 'rgba(52,211,153,0.4)',
  },
  filterPillInactive: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: BORDER,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Deck
  deckArea: {
    flex: 1,
    marginTop: spacing.xs,
  },

  // Modal
  modalContainer: {
    flex: 1,
    paddingTop: spacing.lg,
    backgroundColor: '#0D1117',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.h2,
    fontWeight: '900',
    letterSpacing: -0.8,
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.lg,
    color: TEXT_PRIMARY,
  },
  modalContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: 80,
  },
  filterSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: TEXT_MUTED,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  filterInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  miniInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: typography.bodySmall,
    backgroundColor: SURFACE_ELEVATED,
    borderColor: BORDER,
    color: TEXT_PRIMARY,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xxl,
  },
});
