import { StyleSheet } from 'react-native';
import { lightTheme, spacing, typography } from '../../../theme/tokens';

const CHIP_SURFACE = lightTheme.chipSurface;
const FIELD_SURFACE = lightTheme.fieldSurface;
const TEXT_PRIMARY = lightTheme.textPrimary;

export const createDetailsStyles = StyleSheet.create({
  textInput: {
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.body,
    backgroundColor: FIELD_SURFACE,
    color: TEXT_PRIMARY,
  },
  textArea: {
    minHeight: 80,
    paddingTop: spacing.md,
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 0,
    backgroundColor: CHIP_SURFACE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    lineHeight: 26,
  },
});
