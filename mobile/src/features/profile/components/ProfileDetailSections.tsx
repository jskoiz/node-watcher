import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import AppBackButton from '../../../components/ui/AppBackButton';
import AppIcon from '../../../components/ui/AppIcon';
import { Button, Chip, SectionBlock } from '../../../design/primitives';
import { fontIntent } from '../../../lib/fonts';
import { useTheme } from '../../../theme/useTheme';
import { spacing } from '../../../theme/tokens';
import { profileDetailStyles as styles } from './profileDetail.styles';

export type ProfileDetailRow = {
  label: string;
  value: string;
};

export function ProfileDetailHero({
  activityTags,
  age,
  city,
  firstName,
  intentDisplay,
  onBack,
  onBlock,
  onReport,
  photoUri,
}: {
  activityTags: string[];
  age?: number | null;
  city?: string | null;
  firstName?: string | null;
  intentDisplay: string | null;
  onBack: () => void;
  onBlock: () => void;
  onReport: () => void;
  photoUri?: string | null;
}) {
  const theme = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  const dismissMenu = () => setMenuVisible(false);

  return (
    <View style={styles.heroContainer}>
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={styles.heroImage}
          contentFit="cover"
          accessibilityLabel={`Photo of ${firstName || 'profile'}`}
          accessibilityRole="image"
        />
      ) : (
        <LinearGradient
          colors={[theme.surfaceElevated, theme.subduedSurface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroFallback}
          accessibilityLabel={`Avatar for ${firstName || 'profile'}`}
          accessibilityRole="image"
        >
          <Text
            style={[styles.heroFallbackText, { color: theme.textMuted }]}
            importantForAccessibility="no"
          >
            {firstName?.[0] || '?'}
          </Text>
        </LinearGradient>
      )}

      <LinearGradient
        colors={['transparent', theme.background, theme.background]}
        locations={[0, 0.55, 1]}
        style={styles.heroGradient}
      />

      <View style={styles.backButtonOverlay}>
        <AppBackButton onPress={onBack} style={{ marginBottom: 0 }} />
      </View>

      <View style={styles.overflowButtonOverlay}>
        <Pressable
          onPress={() => setMenuVisible((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel="More options"
          accessibilityHint={menuVisible ? 'Closes the profile actions menu' : 'Opens profile actions'}
          accessibilityState={{ expanded: menuVisible }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={[styles.overflowButton, { backgroundColor: theme.surface }]}
        >
          <AppIcon name="more-vertical" size={18} color={theme.textPrimary} />
        </Pressable>
        {menuVisible && (
          <Modal transparent animationType="none" visible onRequestClose={dismissMenu} accessibilityViewIsModal>
            <Pressable style={styles.overflowBackdrop} onPress={dismissMenu}>
              <View style={[styles.overflowMenu, { backgroundColor: theme.surfaceElevated }]}>
                <Pressable
                  onPress={() => {
                    dismissMenu();
                    onReport();
                  }}
                  style={styles.overflowMenuItem}
                  accessibilityRole="button"
                  accessibilityLabel="Report profile"
                >
                  <AppIcon name="flag" size={16} color={theme.textPrimary} />
                  <Text style={[styles.overflowMenuText, { color: theme.textPrimary }]}>Report</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    dismissMenu();
                    onBlock();
                  }}
                  style={styles.overflowMenuItem}
                  accessibilityRole="button"
                  accessibilityLabel="Block profile"
                >
                  <AppIcon name="slash" size={16} color={theme.danger} />
                  <Text style={[styles.overflowMenuText, { color: theme.danger }]}>Block</Text>
                </Pressable>
              </View>
            </Pressable>
          </Modal>
        )}
      </View>

      <View style={styles.heroNameOverlay}>
        {intentDisplay && (
          <Chip
            label={intentDisplay}
            active
            interactive={false}
            style={styles.intentPill}
            textStyle={styles.intentPillText}
          />
        )}
        <Text style={[styles.heroName, { color: theme.textPrimary, fontFamily: fontIntent.editorialHeadline }]}>
          {firstName || 'Someone'}{age ? `, ${age}` : ''}
        </Text>
        <View style={styles.locationRow}>
          <AppIcon name="map-pin" size={14} color={theme.textMuted} />
          <Text style={[styles.heroLocation, { color: theme.textMuted }]}>
            {city || 'Nearby'}
          </Text>
        </View>

        {activityTags.length > 0 && (
          <View
            style={styles.tagRow}
            accessibilityLabel={`Activities: ${activityTags.slice(0, 4).join(', ')}`}
          >
            {activityTags.slice(0, 4).map((tag, index) => (
              <Chip
                key={`${tag}-${index}`}
                label={tag}
                interactive={false}
                style={styles.tag}
                textStyle={styles.tagText}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

export function ProfileDetailInfo({
  activityTags,
  bio,
  disabled = false,
  onSuggestActivity,
  structuredRows,
  weeklyFrequencyBand,
}: {
  activityTags: string[];
  bio?: string | null;
  disabled?: boolean;
  onSuggestActivity: () => void;
  structuredRows: ProfileDetailRow[];
  weeklyFrequencyBand?: string | null;
}) {
  const theme = useTheme();

  return (
    <View style={styles.contentArea}>
      {!!bio && (
        <SectionBlock
          eyebrow="About"
          spacingMode="tight"
          inset={false}
          eyebrowStyle={[styles.sectionLabel, { color: theme.accentPrimary }]}
        >
          <Text style={[styles.bio, { color: theme.textPrimary }]}>{bio}</Text>
        </SectionBlock>
      )}

      <SectionBlock
        eyebrow="Details"
        spacingMode="tight"
        inset={false}
        eyebrowStyle={[styles.sectionLabel, { color: theme.accentPrimary }]}
      >
        <View style={styles.metaPanel}>
          {weeklyFrequencyBand ? (
            <View
              style={[
                styles.metaIntroCard,
                { backgroundColor: theme.subduedSurface },
              ]}
            >
              <Text style={[styles.metaIntroText, { color: theme.textPrimary }]}>
                Moves {weeklyFrequencyBand}x per week.
              </Text>
            </View>
          ) : null}

          {structuredRows.map((row) => (
            <StructuredRow key={row.label} label={row.label} value={row.value} />
          ))}
        </View>
      </SectionBlock>

      {activityTags.length > 0 && (
        <SectionBlock
          eyebrow="Movement identity"
          spacingMode="tight"
          inset={false}
          eyebrowStyle={[styles.sectionLabel, { color: theme.accentPrimary }]}
        >
          <View
            style={styles.activityPills}
            accessibilityLabel={`Movement identity: ${activityTags.slice(0, 3).join(', ')}`}
          >
            {activityTags.slice(0, 3).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                interactive={false}
                style={styles.activityPill}
                textStyle={styles.activityPillText}
              />
            ))}
          </View>
        </SectionBlock>
      )}

      <Button
        label="Suggest an activity"
        onPress={onSuggestActivity}
        variant="accent"
        disabled={disabled}
        style={styles.suggestBtn}
      />
    </View>
  );
}

export function ProfileDetailActions({
  bottomInset,
  onLike,
  onPass,
  submitting,
}: {
  bottomInset: number;
  onLike: () => void;
  onPass: () => void;
  submitting: boolean;
}) {
  const theme = useTheme();

  return (
    <View
      testID="profile-detail-actions"
      style={[
        styles.actionBar,
        {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingBottom: Math.max(bottomInset, spacing.xxl),
        },
      ]}
    >
      <View style={styles.actionRow}>
        <Button
          label="Pass"
          variant="secondary"
          onPress={onPass}
          disabled={submitting}
          style={styles.actionBtn}
        />
        <Button
          label="Like"
          variant="primary"
          onPress={onLike}
          disabled={submitting}
          loading={submitting}
          style={styles.actionBtnPrimary}
        />
      </View>
    </View>
  );
}

function StructuredRow({ label, value }: ProfileDetailRow) {
  const theme = useTheme();

  return (
    <View
      style={[styles.structuredRow, { backgroundColor: theme.subduedSurface }]}
      accessibilityLabel={`${label}: ${value}`}
    >
      <Text
        style={[styles.structuredLabel, { color: theme.textMuted }]}
        importantForAccessibility="no"
      >
        {label}
      </Text>
      <Text
        style={[styles.structuredValue, { color: theme.textPrimary }]}
        importantForAccessibility="no"
      >
        {value}
      </Text>
    </View>
  );
}
