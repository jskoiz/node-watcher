import React from 'react';
import { Alert, Switch, Text, TouchableOpacity, View } from 'react-native';
import { buildInfo } from '../../../config/buildInfo';
import { Card, SectionBlock } from '../../../design/primitives';
import { useTheme } from '../../../theme/useTheme';
import { profileStyles as styles } from './profile.styles';

function SettingsRow({
  accessory = '›',
  icon,
  label,
  onPress,
  testID,
}: {
  accessory?: string;
  icon: string;
  label: string;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <TouchableOpacity
      testID={testID}
      style={[styles.settingsRow, { minHeight: 48 }]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.settingsIcon} importantForAccessibility="no">
        {icon}
      </Text>
      <Text style={styles.settingsLabel}>{label}</Text>
      <Text style={styles.settingsArrow} importantForAccessibility="no">
        {accessory}
      </Text>
    </TouchableOpacity>
  );
}

function SettingsToggleRow({
  icon,
  label,
  onValueChange,
  testID,
  thumbColor,
  trackColor,
  value,
}: {
  icon: string;
  label: string;
  onValueChange: (value: boolean) => void;
  testID?: string;
  thumbColor: string;
  trackColor: { false: string; true: string };
  value: boolean;
}) {
  return (
    <View
      testID={testID}
      style={[styles.settingsRow, { minHeight: 48 }]}
      accessibilityLabel={label}
    >
      <Text style={styles.settingsIcon} importantForAccessibility="no">
        {icon}
      </Text>
      <Text style={styles.settingsLabel}>{label}</Text>
      <Switch
        testID={testID ? `${testID}-switch` : undefined}
        value={value}
        onValueChange={onValueChange}
        trackColor={trackColor}
        thumbColor={thumbColor}
      />
    </View>
  );
}

function BuildInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.buildInfoRow}>
      <Text style={styles.buildInfoLabel}>{label}</Text>
      <Text selectable style={styles.buildInfoValue}>
        {value}
      </Text>
    </View>
  );
}

function BuildProvenancePanel() {
  const buildRows = [
    { label: 'App env', value: buildInfo.appEnv },
    { label: 'Version', value: `${buildInfo.version} (${buildInfo.iosBuildNumber})` },
    { label: 'Branch', value: buildInfo.gitBranch },
    { label: 'Git SHA', value: buildInfo.gitSha },
    { label: 'API URL', value: buildInfo.apiBaseUrl || 'not set' },
    { label: 'Built at', value: buildInfo.buildDate },
    { label: 'Release path', value: buildInfo.releaseMode },
  ];

  return (
    <Card testID="build-provenance-panel" style={styles.buildInfoCard}>
      {buildRows.map((row, index) => (
        <View key={row.label}>
          <BuildInfoRow label={row.label} value={row.value} />
          {index < buildRows.length - 1 ? (
            <View style={styles.buildInfoDivider} />
          ) : null}
        </View>
      ))}
    </Card>
  );
}

export function ProfileSettingsSection({
  deletingAccount,
  hapticsOn,
  navigation,
  onConfirmDeleteAccount,
  onToggleBuildInfo,
  onToggleHaptics,
  showBuildInfo,
}: {
  deletingAccount: boolean;
  hapticsOn: boolean;
  navigation: { navigate: (screen: string, params?: Record<string, unknown>) => void };
  onConfirmDeleteAccount: () => void;
  onToggleBuildInfo: () => void;
  onToggleHaptics: (enabled: boolean) => void;
  showBuildInfo: boolean;
}) {
  const theme = useTheme();

  return (
    <SectionBlock eyebrow="Settings">
      <Card style={styles.settingsCard}>
        <SettingsRow
          icon="👤"
          label={deletingAccount ? 'Account (Deleting...)' : 'Account'}
          onPress={onConfirmDeleteAccount}
          testID="account-settings-row"
        />
        <View style={styles.fieldDivider} />
        <SettingsRow
          icon="🔒"
          label="Privacy"
          onPress={() =>
            Alert.alert('Coming Soon', 'This feature is not yet available.')
          }
        />
        <View style={styles.fieldDivider} />
        <SettingsRow
          icon="🔔"
          label="Notifications"
          onPress={() => navigation.navigate('Notifications')}
        />
        <View style={styles.fieldDivider} />
        <SettingsToggleRow
          testID="haptic-feedback-toggle"
          icon="📳"
          label="Haptic Feedback"
          value={hapticsOn}
          onValueChange={onToggleHaptics}
          trackColor={{ false: theme.chipSurface, true: theme.selectedFill }}
          thumbColor={theme.selectedText}
        />
        <View style={styles.fieldDivider} />
        <SettingsRow
          testID="build-provenance-toggle"
          icon="🧾"
          label="Build provenance"
          accessory={showBuildInfo ? '⌄' : '›'}
          onPress={onToggleBuildInfo}
        />
        {showBuildInfo ? (
          <>
            <View style={styles.fieldDivider} />
            <BuildProvenancePanel />
          </>
        ) : null}
      </Card>
    </SectionBlock>
  );
}
