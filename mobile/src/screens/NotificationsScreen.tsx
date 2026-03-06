import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AppBackButton from '../components/ui/AppBackButton';
import { useTheme } from '../theme/useTheme';
import { radii, spacing, typography } from '../theme/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

type NotifType = 'match' | 'message' | 'invite' | 'confirmed';

interface MockNotif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  group: 'Today' | 'Earlier';
  read: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_NOTIFS: MockNotif[] = [
  {
    id: '1',
    type: 'match',
    title: 'New Match!',
    body: 'You and Sofia both love trail running. Say hi 👋',
    group: 'Today',
    read: false,
  },
  {
    id: '2',
    type: 'invite',
    title: 'Activity Invite',
    body: 'Jake invited you to his lap swim session Saturday.',
    group: 'Today',
    read: false,
  },
  {
    id: '3',
    type: 'message',
    title: 'New Message from Emma',
    body: '"Hey! Still up for yoga tomorrow? 🧘"',
    group: 'Today',
    read: true,
  },
  {
    id: '4',
    type: 'confirmed',
    title: 'Activity Confirmed',
    body: 'Your hike at Griffith Park this Sunday is confirmed. 6 people joining!',
    group: 'Earlier',
    read: true,
  },
  {
    id: '5',
    type: 'match',
    title: 'New Match!',
    body: 'You matched with Lena — she cycles 5x/week. 🚴',
    group: 'Earlier',
    read: true,
  },
  {
    id: '6',
    type: 'message',
    title: 'New Message from Mia',
    body: '"Are you free this weekend for the beach walk?"',
    group: 'Earlier',
    read: true,
  },
];

// ─── Icon map ─────────────────────────────────────────────────────────────────

const NOTIF_ICONS: Record<NotifType, string> = {
  match: '💜',
  message: '💬',
  invite: '🤝',
  confirmed: '✅',
};

const NOTIF_COLORS: Record<NotifType, string> = {
  match: '#7C6AF7',
  message: '#34D399',
  invite: '#F59E0B',
  confirmed: '#34D399',
};

// ─── NotifRow ─────────────────────────────────────────────────────────────────

function NotifRow({
  notif,
  theme,
  onDismiss,
}: {
  notif: MockNotif;
  theme: any;
  onDismiss: (id: string) => void;
}) {
  const color = NOTIF_COLORS[notif.type];
  const icon = NOTIF_ICONS[notif.type];

  return (
    <View
      style={[
        styles.notifRow,
        {
          backgroundColor: notif.read ? theme.surfaceElevated : theme.surface,
          borderColor: notif.read ? theme.border : color + '44',
          borderLeftColor: color,
        },
      ]}
    >
      {/* Icon */}
      <View style={[styles.notifIconWrap, { backgroundColor: color + '20' }]}>
        <Text style={styles.notifIcon}>{icon}</Text>
      </View>

      {/* Content */}
      <View style={styles.notifContent}>
        <Text style={[styles.notifTitle, { color: theme.textPrimary }]}>{notif.title}</Text>
        <Text style={[styles.notifBody, { color: theme.textSecondary }]}>{notif.body}</Text>
      </View>

      {/* Dismiss */}
      <TouchableOpacity
        style={styles.dismissBtn}
        onPress={() => onDismiss(notif.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.6}
      >
        <Text style={[styles.dismissText, { color: theme.textMuted }]}>✕</Text>
      </TouchableOpacity>

      {/* Unread dot */}
      {!notif.read && (
        <View style={[styles.unreadDot, { backgroundColor: color }]} />
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [notifs, setNotifs] = useState<MockNotif[]>(INITIAL_NOTIFS);

  const dismiss = (id: string) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => setNotifs([]);

  const todayNotifs = notifs.filter((n) => n.group === 'Today');
  const earlierNotifs = notifs.filter((n) => n.group === 'Earlier');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <AppBackButton onPress={() => navigation.goBack()} />
        <Text style={[styles.title, { color: theme.textPrimary }]}>Notifications</Text>
        {notifs.length > 0 && (
          <TouchableOpacity onPress={clearAll} activeOpacity={0.7}>
            <Text style={[styles.clearAll, { color: theme.textMuted }]}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>All caught up!</Text>
          <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>
            Notifications will appear here when you get matches, messages, and activity invites.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {todayNotifs.length > 0 && (
            <View style={styles.group}>
              <Text style={[styles.groupLabel, { color: theme.textMuted }]}>Today</Text>
              {todayNotifs.map((n) => (
                <NotifRow key={n.id} notif={n} theme={theme} onDismiss={dismiss} />
              ))}
            </View>
          )}
          {earlierNotifs.length > 0 && (
            <View style={styles.group}>
              <Text style={[styles.groupLabel, { color: theme.textMuted }]}>Earlier</Text>
              {earlierNotifs.map((n) => (
                <NotifRow key={n.id} notif={n} theme={theme} onDismiss={dismiss} />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.h2,
    fontWeight: '800',
    flex: 1,
    letterSpacing: -0.3,
  },
  clearAll: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },

  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: 64,
  },

  group: {
    marginBottom: spacing.lg,
  },
  groupLabel: {
    fontSize: typography.caption,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },

  // Notification row
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    position: 'relative',
  },
  notifIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifIcon: {
    fontSize: 18,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: typography.bodySmall,
    fontWeight: '800',
    marginBottom: 3,
  },
  notifBody: {
    fontSize: typography.caption,
    lineHeight: 18,
  },
  dismissBtn: {
    padding: 4,
  },
  dismissText: {
    fontSize: 14,
    fontWeight: '700',
  },
  unreadDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl || 40,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.h3,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyBody: {
    fontSize: typography.body,
    textAlign: 'center',
    lineHeight: 24,
  },
});
