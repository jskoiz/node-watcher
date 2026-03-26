import React from 'react';
import { Text, View } from 'react-native';
import AppIcon from '../../../components/ui/AppIcon';
import { useTheme } from '../../../theme/useTheme';
import { eventDetailStyles as styles } from './eventDetail.styles';

export function EventDetailMetaRow({
  icon,
  label,
  sub,
}: {
  icon: React.ComponentProps<typeof AppIcon>['name'];
  label: string;
  sub?: string;
}) {
  const theme = useTheme();
  const fullLabel = sub ? `${label}, ${sub}` : label;

  return (
    <View style={styles.metaRow} accessibilityLabel={fullLabel}>
      <View
        style={[styles.metaIconWrap, { backgroundColor: theme.surfaceElevated }]}
        accessible={false}
        accessibilityElementsHidden={true}
        importantForAccessibility="no-hide-descendants"
      >
        <AppIcon name={icon} size={15} color={theme.primary} />
      </View>
      <View>
        <Text style={[styles.metaLabel, { color: theme.textPrimary }]}>{label}</Text>
        {sub ? <Text style={[styles.metaSub, { color: theme.textSecondary }]}>{sub}</Text> : null}
      </View>
    </View>
  );
}
