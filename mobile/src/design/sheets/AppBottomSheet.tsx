import React, { PropsWithChildren, useEffect, useMemo } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type { BottomSheetModal as BottomSheetModalType } from '@gorhom/bottom-sheet';
import type { RefObject } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from '../../components/ui/AppIcon';
import { useTheme } from '../../theme/useTheme';
import { radii, spacing, typography } from '../../theme/tokens';

export function AppBottomSheet({
  children,
  contentContainerStyle,
  onClose,
  refObject,
  scrollable = true,
  snapPoints = ['70%'],
  subtitle,
  title,
  visible,
}: PropsWithChildren<{
  contentContainerStyle?: StyleProp<ViewStyle>;
  onClose: () => void;
  refObject: RefObject<BottomSheetModalType | null>;
  scrollable?: boolean;
  snapPoints?: Array<string | number>;
  subtitle?: string;
  title: string;
  visible: boolean;
}>) {
  let insets = { top: 0, right: 0, bottom: 0, left: 0 };
  try {
    insets = useSafeAreaInsets();
  } catch {
    // Tests may render sheets without a SafeAreaProvider.
  }
  const theme = useTheme();
  const resolvedSnapPoints = useMemo(() => snapPoints, [snapPoints]);
  const resolvedContentContainerStyle = useMemo(
    () =>
      StyleSheet.flatten([
        styles.contentContainer,
        { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.lg },
        contentContainerStyle,
      ]),
    [contentContainerStyle, insets.bottom],
  );

  useEffect(() => {
    const modal = refObject.current;
    if (!modal) return;

    if (visible) {
      modal.present();
    } else {
      modal.dismiss();
    }
  }, [refObject, visible]);

  return (
    <BottomSheetModal
      ref={refObject}
      index={0}
      onDismiss={onClose}
      snapPoints={resolvedSnapPoints}
      enablePanDownToClose
      backgroundStyle={[styles.sheetBackground, { backgroundColor: theme.surface }]}
      handleIndicatorStyle={[styles.handleIndicator, { backgroundColor: theme.borderSoft }]}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.55} />
      )}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text> : null}
        </View>
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [
            styles.closeButton,
            {
              backgroundColor: theme.surfaceElevated,
              borderColor: theme.border,
              opacity: pressed ? 0.76 : 1,
            },
          ]}
        >
          <AppIcon name="x" size={16} color={theme.textPrimary} />
        </Pressable>
      </View>
      {scrollable ? (
        <BottomSheetScrollView
          style={styles.content}
          contentContainerStyle={resolvedContentContainerStyle}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </BottomSheetScrollView>
      ) : (
        <BottomSheetView style={resolvedContentContainerStyle}>
          {children}
        </BottomSheetView>
      )}
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handleIndicator: {
    width: 46,
    height: 5,
    borderRadius: radii.pill,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    fontSize: typography.h3,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
});
