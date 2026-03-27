import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Button, Card, SectionBlock } from '../../../../design/primitives';
import { profileStyles as styles } from '../profile.styles';

export function ProfileAccountDeletionSection({
  deletingAccount,
  onConfirmDeleteAccount,
}: {
  deletingAccount: boolean;
  onConfirmDeleteAccount: () => void;
}) {
  return (
    <SectionBlock eyebrow="Account deletion">
      <Card style={styles.dangerCard}>
        <Text style={styles.dangerTitle}>Delete your account</Text>
        <Text style={styles.dangerBody}>
          This permanently deletes your profile and all data.
        </Text>
        <Button
          label={deletingAccount ? 'Deleting...' : 'Delete account'}
          onPress={onConfirmDeleteAccount}
          disabled={deletingAccount}
          variant="danger"
          style={styles.deleteAccountBtn}
        />
      </Card>
    </SectionBlock>
  );
}

export function ProfileLogoutButton({ onLogout }: { onLogout: () => void }) {
  return (
    <TouchableOpacity
      onPress={onLogout}
      style={[styles.logoutBtn, { minHeight: 48 }]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Log out"
      testID="logout-button"
    >
      <Text style={styles.logoutText}>Log out</Text>
    </TouchableOpacity>
  );
}
