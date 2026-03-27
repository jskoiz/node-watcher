import { StyleSheet } from 'react-native';
import { spacing, typography } from '../../../theme/tokens';

export const createHeaderStyles = StyleSheet.create({
  header: {
    paddingTop: spacing.sm,
  },
  eyebrow: {
    letterSpacing: 1.8,
  },
  title: {
    fontSize: 32,
    letterSpacing: -1,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: typography.bodySmall,
    fontWeight: '500',
    lineHeight: 20,
    maxWidth: 320,
  },
});
