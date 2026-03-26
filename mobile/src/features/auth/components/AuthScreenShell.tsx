import React, { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBackdrop from '../../../components/ui/AppBackdrop';
import { GlassView } from '../../../design/primitives';
import { useTheme } from '../../../theme/useTheme';
import { radii, spacing, typography } from '../../../theme/tokens';

type AuthScreenShellProps = {
  card?: ReactNode;
  children?: ReactNode;
  formCardStyle?: StyleProp<ViewStyle>;
  formHeader?: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
  hero?: ReactNode;
  leading?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function AuthScreenShell({
  card,
  children,
  contentContainerStyle,
  formCardStyle,
  formHeader,
  footer,
  header,
  hero,
  leading,
}: AuthScreenShellProps) {
  const theme = useTheme();
  const screenHeader = header ?? hero;
  const resolvedCard = children || formHeader ? (
    <GlassView tier="frosted" borderRadius={radii.xxl} specularHighlight style={formCardStyle}>
      {formHeader}
      {children}
    </GlassView>
  ) : card;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.content, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AppBackdrop />
          {leading}
          {screenHeader}
          {resolvedCard}
          {footer}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type AuthFooterLinkRowProps = {
  prompt: string;
  linkLabel: string;
  onPress: () => void;
  accessibilityLabel: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AuthFooterLinkRow({
  accessibilityLabel,
  disabled,
  linkLabel,
  onPress,
  prompt,
  style,
}: AuthFooterLinkRowProps) {
  const theme = useTheme();

  return (
    <View style={[styles.linkRow, style]}>
      <Text style={[styles.linkPrompt, { color: theme.textMuted }]}>{prompt}</Text>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="link"
        disabled={disabled}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        onPress={onPress}
        style={styles.linkPressable}
      >
        <Text style={[styles.linkLabel, { color: theme.accent }]}>{linkLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkPrompt: {
    fontSize: typography.body,
  },
  linkPressable: {
    minHeight: 44,
    justifyContent: 'center',
  },
  linkLabel: {
    fontSize: typography.body,
    fontWeight: '700',
  },
});
