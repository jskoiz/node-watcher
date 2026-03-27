import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { AppNotification } from '../../../api/types';
import AppIcon from '../../../components/ui/AppIcon';
import type { Theme } from '../../../theme/tokens';
import { radii, spacing, typography } from '../../../theme/tokens';
import { getNotificationMeta } from '../notificationPresentation';

interface NotificationRowProps {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
  onNavigate: (notification: AppNotification) => void;
  theme: Theme;
}

export function NotificationRow({
  notification,
  onMarkRead,
  onNavigate,
  theme,
}: NotificationRowProps) {
  const { color, icon } = getNotificationMeta(notification.type);
  const isRead = Boolean(notification.readAt);

  return (
    <TouchableOpacity
      style={[
        styles.row,
        {
          backgroundColor: isRead ? theme.surface : theme.accentSoft,
          minHeight: 56,
        },
      ]}
      onPress={() => {
        if (!isRead) {
          onMarkRead(notification.id);
        }
        onNavigate(notification);
      }}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${notification.title}. ${notification.body}`}
      accessibilityHint={isRead ? 'Already read' : 'Tap to mark as read'}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${color}20` }]}>
        <AppIcon name={icon} size={18} color={color} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {notification.title}
        </Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          {notification.body}
        </Text>
      </View>

      {!isRead ? (
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => onMarkRead(notification.id)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.6}
          accessibilityRole="button"
          accessibilityLabel="Mark as read"
        >
          <AppIcon name="check" size={16} color={color} />
        </TouchableOpacity>
      ) : null}

      {!isRead ? (
        <View style={[styles.unreadDot, { backgroundColor: color }]} />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    position: 'relative',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: typography.bodySmall,
    fontWeight: '800',
    marginBottom: 3,
  },
  body: {
    fontSize: typography.caption,
    lineHeight: 18,
  },
  dismissButton: {
    padding: 4,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
