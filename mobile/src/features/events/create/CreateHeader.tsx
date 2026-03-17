import React from 'react';
import { Text, View } from 'react-native';
import { createStyles as styles } from './create.styles';

export function CreateHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.eyebrow}>CREATE</Text>
      <Text style={styles.title}>{`Create\nan event`}</Text>
      <Text style={styles.subtitle}>Choose an activity, set the details, and invite others.</Text>
    </View>
  );
}

