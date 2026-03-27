import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { SectionBlock } from '../../../../design/primitives';
import { profileStyles as styles } from '../profile.styles';

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
