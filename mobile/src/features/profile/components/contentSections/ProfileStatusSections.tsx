import React from 'react';
import { Text, View } from 'react-native';
import type { ProfileCompletenessMissingItem } from '../../../../api/types';
import { CompletenessBar } from '../CompletenessBar';
import { profileStyles as styles } from '../profile.styles';

export function ProfileCompletenessSection({
  completenessMissing,
  completenessScore,
  editMode,
  onSave,
}: {
  completenessScore: number;
  completenessMissing: ProfileCompletenessMissingItem[];
  editMode: boolean;
  onSave: () => void;
}) {
  return (
    <CompletenessBar
      score={completenessScore}
      missing={completenessMissing}
      onPressMissing={() => {
        if (!editMode) onSave();
      }}
    />
  );
}

export function ProfileErrorBanner({
  errorMessage,
}: {
  errorMessage: string | null;
}) {
  return errorMessage ? (
    <View style={styles.errorBanner}>
      <Text style={styles.errorText}>{errorMessage}</Text>
    </View>
  ) : null;
}

