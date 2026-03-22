import { StyleSheet } from 'react-native';
import { lightTheme, spacing, typography } from '../../../theme/tokens';

const PRIMARY = lightTheme.primary;
const TEXT_PRIMARY = lightTheme.textPrimary;
const TEXT_MUTED = lightTheme.textMuted;

export const createHeaderStyles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    color: PRIMARY,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
    color: TEXT_PRIMARY,
    lineHeight: 34,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.bodySmall,
    fontWeight: '500',
    color: TEXT_MUTED,
    lineHeight: 20,
    maxWidth: 300,
  },
});
