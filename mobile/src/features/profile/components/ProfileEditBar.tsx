import React from 'react';
import { Pressable, Text, View } from 'react-native';
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
  return (
    <View style={styles.editBar}>
      <Pressable
        onPress={onSave}
        disabled={isSaving}
        style={[styles.editBtnWrap, editMode ? styles.editBtnActive : null]}
        accessibilityRole="button"
        accessibilityLabel={editMode ? 'Save profile' : 'Edit profile'}
      >
        <Text style={[styles.editBtnText, editMode ? styles.editBtnTextActive : null]}>
          {isSaving ? 'Saving...' : editMode ? 'Save' : 'Edit Profile'}
        </Text>
      </Pressable>
      {editMode ? (
        <Pressable onPress={onCancelEdit} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

