import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { profileStyles as styles } from './profile.styles';

export function ProfileEditBar({
  editMode,
  isSaving,
  onCancelEdit,
  onSave,
}: {
  editMode: boolean;
  isSaving: boolean;
  onCancelEdit: () => void;
  onSave: () => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.editBar}>
      <Pressable
        onPress={onSave}
        disabled={isSaving}
        style={[
          styles.editBtnWrap,
          { backgroundColor: '#1F1915' },
          editMode ? styles.editBtnActive : null,
        ]}
        accessibilityRole="button"
        accessibilityLabel={editMode ? 'Save profile' : 'Edit profile'}
      >
        <Text style={[styles.editBtnText, { color: theme.background }, editMode ? styles.editBtnTextActive : null]}>
          {isSaving ? 'Saving...' : editMode ? 'Save' : 'Edit Profile'}
        </Text>
      </Pressable>
      {editMode ? (
        <Pressable onPress={onCancelEdit} style={[styles.cancelBtn, { backgroundColor: theme.chipSurface }]}>
          <Text style={[styles.cancelBtnText, { color: theme.textMuted }]}>Cancel</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
