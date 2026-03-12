import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { normalizeApiError } from '../api/errors';
import { eventsApi } from '../services/api';
import { radii, spacing, typography } from '../theme/tokens';

const BASE = '#0D1117';
const SURFACE = '#161B22';
const SURFACE_ELEVATED = '#1C2128';
const BORDER = 'rgba(255,255,255,0.07)';
const PRIMARY = '#7C6AF7';
const ACCENT = '#34D399';
const TEXT_PRIMARY = '#F0F6FC';
const TEXT_SECONDARY = 'rgba(240,246,252,0.6)';
const TEXT_MUTED = 'rgba(240,246,252,0.38)';
const ENERGY = '#F59E0B';
const ERROR = '#F87171';

const ACTIVITY_TYPES = [
  { emoji: '🏃', label: 'Run', color: ACCENT },
  { emoji: '🧘', label: 'Yoga', color: PRIMARY },
  { emoji: '🏋️', label: 'Lift', color: '#F87171' },
  { emoji: '🥾', label: 'Hike', color: ENERGY },
  { emoji: '🏖️', label: 'Beach', color: '#60A5FA' },
  { emoji: '🚴', label: 'Cycle', color: '#34D399' },
  { emoji: '🏄', label: 'Surf', color: '#38BDF8' },
  { emoji: '🧗', label: 'Climb', color: '#FB923C' },
  { emoji: '🥊', label: 'Box', color: '#F87171' },
  { emoji: '🏊', label: 'Swim', color: '#60A5FA' },
] as const;

const WHEN_OPTIONS = ['Today', 'Tomorrow', 'This Weekend', 'Next Week'] as const;
const TIME_OPTIONS = ['Morning', 'Afternoon', 'Evening'] as const;
const SKILL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'] as const;

function ActivityTile({
  activity,
  selected,
  onPress,
}: {
  activity: (typeof ACTIVITY_TYPES)[number];
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.activityTileWrap}>
      <View
        style={[
          styles.activityTile,
          selected
            ? { borderColor: activity.color, backgroundColor: activity.color + '20' }
            : { borderColor: BORDER, backgroundColor: SURFACE },
        ]}
      >
        <Text style={styles.activityEmoji}>{activity.emoji}</Text>
      </View>
      <Text style={[styles.activityLabel, { color: selected ? activity.color : TEXT_MUTED }]}>
        {activity.label}
      </Text>
    </Pressable>
  );
}

function Pill({
  label,
  active,
  onPress,
  accentColor = PRIMARY,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  accentColor?: string;
}) {
  if (active) {
    return (
      <Pressable onPress={onPress} style={styles.pillWrap}>
        <LinearGradient
          colors={[accentColor + 'CC', accentColor + '88']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.pillActive}
        >
          <Text style={styles.pillTextActive}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} style={[styles.pillInactive]}>
      <Text style={styles.pillTextInactive}>{label}</Text>
    </Pressable>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

function buildStartDate(selectedWhen: string, selectedTime: string) {
  const now = new Date();
  const start = new Date(now);

  if (selectedWhen === 'Tomorrow') {
    start.setDate(start.getDate() + 1);
  } else if (selectedWhen === 'This Weekend') {
    const currentDay = start.getDay();
    const daysUntilSaturday = (6 - currentDay + 7) % 7;
    start.setDate(start.getDate() + daysUntilSaturday);
  } else if (selectedWhen === 'Next Week') {
    start.setDate(start.getDate() + 7);
  }

  if (selectedTime === 'Morning') {
    start.setHours(9, 0, 0, 0);
  } else if (selectedTime === 'Afternoon') {
    start.setHours(14, 0, 0, 0);
  } else {
    start.setHours(18, 0, 0, 0);
  }

  if (start <= now) {
    start.setDate(start.getDate() + 1);
  }

  return start;
}

function buildTitle(activity: string, where: string) {
  return where.trim() ? `${activity} at ${where.trim()}` : `${activity} meetup`;
}

function buildDescription({
  note,
  skillLevel,
  spots,
  selectedWhen,
  selectedTime,
}: {
  note: string;
  skillLevel: string | null;
  spots: number;
  selectedWhen: string;
  selectedTime: string;
}) {
  const parts = [
    note.trim(),
    skillLevel ? `Skill level: ${skillLevel}.` : null,
    `Open spots: ${spots}.`,
    `${selectedWhen} ${selectedTime.toLowerCase()}.`,
  ].filter(Boolean);

  return parts.join(' ');
}

export default function CreateScreen({ navigation }: any) {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [selectedWhen, setSelectedWhen] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [where, setWhere] = useState('');
  const [skillLevel, setSkillLevel] = useState<string | null>(null);
  const [spots, setSpots] = useState(2);
  const [note, setNote] = useState('');
  const [posting, setPosting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastCreatedTitle, setLastCreatedTitle] = useState<string | null>(null);

  const activityObj = useMemo(
    () => ACTIVITY_TYPES.find((a) => a.label === selectedActivity),
    [selectedActivity],
  );
  const selectedColor = activityObj?.color ?? PRIMARY;

  const resetForm = () => {
    setSelectedActivity(null);
    setSelectedWhen(null);
    setSelectedTime(null);
    setWhere('');
    setSkillLevel(null);
    setSpots(2);
    setNote('');
  };

  const handlePost = async () => {
    if (posting) return;

    if (!selectedActivity) {
      Alert.alert('Pick an activity', 'Choose what you want to do first.');
      return;
    }
    if (!selectedWhen) {
      Alert.alert('When?', 'Choose a day for your activity.');
      return;
    }
    if (!selectedTime) {
      Alert.alert('What time?', 'Choose a time window for your activity.');
      return;
    }
    if (!where.trim()) {
      Alert.alert('Add a location', 'Tell people where to meet.');
      return;
    }

    setPosting(true);
    setSubmitError(null);
    setLastCreatedTitle(null);

    const startsAt = buildStartDate(selectedWhen, selectedTime);
    const endsAt = new Date(startsAt.getTime() + 2 * 60 * 60 * 1000);
    const title = buildTitle(selectedActivity, where);

    try {
      const response = await eventsApi.create({
        title,
        location: where.trim(),
        category: selectedActivity,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        description: buildDescription({
          note,
          skillLevel,
          spots,
          selectedWhen,
          selectedTime,
        }),
      });

      const createdEvent = response.data;
      setLastCreatedTitle(createdEvent.title);
      resetForm();

      Alert.alert('🎉 Activity posted!', 'Your invite is live now.', [
        {
          text: 'View event',
          onPress: () => navigation?.navigate('EventDetail', { eventId: createdEvent.id }),
        },
        {
          text: 'Done',
          style: 'default',
        },
      ]);
    } catch (error) {
      setSubmitError(normalizeApiError(error).message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.ambientGlow, { backgroundColor: selectedColor }]} pointerEvents="none" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>CREATE</Text>
          <Text style={styles.title}>{`Start\nSomething.`}</Text>
          <Text style={styles.subtitle}>Invite people to move with you</Text>
        </View>

        <View style={styles.activitySection}>
          {activityObj ? (
            <View style={styles.selectedPreview}>
              <LinearGradient
                colors={[selectedColor + '40', selectedColor + '10', 'transparent']}
                style={styles.selectedPreviewGradient}
              >
                <Text style={styles.selectedPreviewEmoji}>{activityObj.emoji}</Text>
                <Text style={[styles.selectedPreviewLabel, { color: selectedColor }]}>
                  {activityObj.label}
                </Text>
              </LinearGradient>
            </View>
          ) : (
            <View style={styles.selectedPreviewEmpty}>
              <Text style={styles.selectedPreviewEmptyText}>Pick an activity ↓</Text>
            </View>
          )}

          <View style={styles.activityGrid}>
            {ACTIVITY_TYPES.map((a) => (
              <ActivityTile
                key={a.label}
                activity={a}
                selected={selectedActivity === a.label}
                onPress={() => setSelectedActivity(a.label)}
              />
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <SectionLabel label="When?" />
          <View style={styles.pillRow}>
            {WHEN_OPTIONS.map((w) => (
              <Pill
                key={w}
                label={w}
                active={selectedWhen === w}
                onPress={() => setSelectedWhen(w)}
                accentColor={PRIMARY}
              />
            ))}
          </View>
          <View style={[styles.pillRow, { marginTop: spacing.sm }]}>
            {TIME_OPTIONS.map((t) => (
              <Pill
                key={t}
                label={t}
                active={selectedTime === t}
                onPress={() => setSelectedTime(t)}
                accentColor={ENERGY}
              />
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <SectionLabel label="Where?" />
          <TextInput
            style={styles.textInput}
            placeholder="Runyon Canyon, Venice Beach..."
            placeholderTextColor={TEXT_MUTED}
            value={where}
            onChangeText={setWhere}
          />
        </View>

        <View style={styles.formSection}>
          <SectionLabel label="Skill level" />
          <View style={styles.pillRow}>
            {SKILL_OPTIONS.map((s) => (
              <Pill
                key={s}
                label={s}
                active={skillLevel === s}
                onPress={() => setSkillLevel(s)}
                accentColor={ACCENT}
              />
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <SectionLabel label="Spots available" />
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setSpots(Math.max(1, spots - 1))}
              activeOpacity={0.7}
              disabled={posting}
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.stepperValueWrap}>
              <Text style={styles.stepperValue}>{spots}</Text>
              <Text style={styles.stepperSub}>open spots</Text>
            </View>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setSpots(Math.min(10, spots + 1))}
              activeOpacity={0.7}
              disabled={posting}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formSection}>
          <SectionLabel label="Add a note" />
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Easy pace, bring water, no experience needed..."
            placeholderTextColor={TEXT_MUTED}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {submitError ? (
          <View style={styles.feedbackWrap}>
            <Text style={styles.feedbackError}>⚠️ {submitError}</Text>
          </View>
        ) : null}

        {lastCreatedTitle ? (
          <View style={styles.feedbackWrap}>
            <Text style={styles.feedbackSuccess}>✅ Posted: {lastCreatedTitle}</Text>
          </View>
        ) : null}

        <Pressable onPress={handlePost} disabled={posting} style={styles.postBtnWrap}>
          <LinearGradient
            colors={posting ? [ACCENT + '80', ACCENT + '40'] : [selectedColor, selectedColor + 'BB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.postBtn, posting && styles.postBtnDisabled]}
          >
            <Text style={styles.postBtnText}>
              {posting ? 'Posting...' : `🚀  Post ${selectedActivity ?? 'Activity'}`}
            </Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BASE,
  },
  ambientGlow: {
    position: 'absolute',
    top: 80,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.05,
  },
  scrollContent: {
    paddingBottom: 64,
  },
  header: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3.5,
    color: PRIMARY,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1.5,
    color: TEXT_PRIMARY,
    lineHeight: 48,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.bodySmall,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  activitySection: {
    marginBottom: spacing.lg,
  },
  selectedPreview: {
    marginHorizontal: spacing.xxl,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: BORDER,
  },
  selectedPreviewGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  selectedPreviewEmoji: {
    fontSize: 52,
  },
  selectedPreviewLabel: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  selectedPreviewEmpty: {
    marginHorizontal: spacing.xxl,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    borderStyle: 'dashed',
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  selectedPreviewEmptyText: {
    color: TEXT_MUTED,
    fontSize: typography.bodySmall,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xxl,
    gap: 12,
  },
  activityTileWrap: {
    alignItems: 'center',
    gap: 5,
  },
  activityTile: {
    width: 62,
    height: 62,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityEmoji: {
    fontSize: 26,
  },
  activityLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  formSection: {
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: TEXT_MUTED,
    marginBottom: spacing.md,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pillWrap: {
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  pillActive: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radii.pill,
  },
  pillTextActive: {
    fontSize: typography.bodySmall,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  pillInactive: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  pillTextInactive: {
    fontSize: typography.bodySmall,
    fontWeight: '700',
    color: TEXT_MUTED,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.body,
    backgroundColor: SURFACE_ELEVATED,
    borderColor: BORDER,
    color: TEXT_PRIMARY,
  },
  textArea: {
    minHeight: 80,
    paddingTop: spacing.md,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: SURFACE_ELEVATED,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    lineHeight: 26,
  },
  stepperValueWrap: {
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: 40,
    fontWeight: '900',
    color: TEXT_PRIMARY,
    letterSpacing: -1,
    lineHeight: 44,
  },
  stepperSub: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_MUTED,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  feedbackWrap: {
    marginHorizontal: spacing.xxl,
    marginBottom: spacing.md,
  },
  feedbackError: {
    color: ERROR,
    fontSize: typography.bodySmall,
    fontWeight: '700',
    lineHeight: 20,
  },
  feedbackSuccess: {
    color: ACCENT,
    fontSize: typography.bodySmall,
    fontWeight: '700',
    lineHeight: 20,
  },
  postBtnWrap: {
    marginHorizontal: spacing.xxl,
    marginTop: spacing.md,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  postBtn: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: radii.pill,
  },
  postBtnDisabled: {
    opacity: 0.8,
  },
  postBtnText: {
    fontSize: typography.body,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
