import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import AppBackdrop from "../components/ui/AppBackdrop";
import AppIcon from "../components/ui/AppIcon";
import AppButton from "../components/ui/AppButton";
import { radii, spacing, typography } from "../theme/tokens";
import { useTheme } from "../theme/useTheme";

const PREVIEW_SCENARIOS = [
  "auth-login",
  "home-empty",
  "home-populated",
  "chat-thread",
  "notifications",
  "profile-edit",
  "create-flow",
] as const;

type PreviewScenario = (typeof PREVIEW_SCENARIOS)[number];

function resolveScenario(rawValue: string | undefined): PreviewScenario {
  const normalized = rawValue?.trim();
  if (
    normalized &&
    PREVIEW_SCENARIOS.includes(normalized as PreviewScenario)
  ) {
    return normalized as PreviewScenario;
  }

  return "home-populated";
}

function PreviewShell({
  scenario,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  scenario: PreviewScenario;
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      testID={`codex-preview-${scenario}`}
    >
      <AppBackdrop />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.headerCard,
            { backgroundColor: theme.surfaceGlass, borderColor: theme.border },
          ]}
        >
          <View style={styles.headerRow}>
            <Text style={[styles.eyebrow, { color: theme.accent }]}>
              {eyebrow}
            </Text>
            <View
              style={[
                styles.scenarioChip,
                {
                  backgroundColor: theme.primarySubtle,
                  borderColor: theme.primary,
                },
              ]}
            >
              <Text style={[styles.scenarioChipText, { color: theme.primary }]}>
                {scenario}
              </Text>
            </View>
          </View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </Text>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof AppIcon>["name"];
  label: string;
  value: string;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.metaRow,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View
        style={[
          styles.metaIconWrap,
          { backgroundColor: theme.primarySubtle, borderColor: theme.primary },
        ]}
      >
        <AppIcon name={icon} size={16} color={theme.primary} />
      </View>
      <View style={styles.metaCopy}>
        <Text style={[styles.metaLabel, { color: theme.textMuted }]}>{label}</Text>
        <Text style={[styles.metaValue, { color: theme.textPrimary }]}>{value}</Text>
      </View>
    </View>
  );
}

function PrimaryPreviewButton({
  label,
  variant = "primary",
}: {
  label: string;
  variant?: "primary" | "accent" | "secondary";
}) {
  return (
    <AppButton
      label={label}
      onPress={() => undefined}
      variant={variant}
      style={styles.primaryButton}
      testID="codex-preview-primary-cta"
    />
  );
}

function LoginPreview() {
  const theme = useTheme();

  return (
    <PreviewShell
      scenario="auth-login"
      eyebrow="AUTH"
      title="Login surface"
      subtitle="Use this to validate the unauthenticated first-run state and primary sign-in CTA."
    >
      <View
        style={[
          styles.panel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.panelTitle, { color: theme.textPrimary }]}>
          Welcome back
        </Text>
        <Text style={[styles.panelBody, { color: theme.textSecondary }]}>
          Meet people who move like you do.
        </Text>
        <TextInput
          editable={false}
          testID="codex-preview-email"
          value="preview.lana@brdg.local"
          style={[
            styles.input,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.textPrimary },
          ]}
        />
        <TextInput
          editable={false}
          testID="codex-preview-password"
          value="PreviewPass123!"
          style={[
            styles.input,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.textPrimary },
          ]}
        />
        <PrimaryPreviewButton label="Sign in" />
      </View>
    </PreviewShell>
  );
}

function HomeEmptyPreview() {
  const theme = useTheme();

  return (
    <PreviewShell
      scenario="home-empty"
      eyebrow="DISCOVERY"
      title="Empty feed"
      subtitle="Stable empty-state coverage for discovery and the refresh action."
    >
      <View style={styles.metaGrid}>
        <MetaRow icon="compass" label="Intent" value="Open to both" />
        <MetaRow icon="sliders" label="Filters" value="Minimal" />
      </View>
      <View
        style={[
          styles.heroEmpty,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View
          style={[
            styles.emptyIconWrap,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
          ]}
        >
          <AppIcon name="compass" size={26} color={theme.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
          You&apos;re all caught up
        </Text>
        <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>
          Refresh in a bit or reset the backend preview scenario to repopulate discovery.
        </Text>
        <PrimaryPreviewButton label="Refresh feed" variant="secondary" />
      </View>
    </PreviewShell>
  );
}

function HomePopulatedPreview() {
  const theme = useTheme();

  return (
    <PreviewShell
      scenario="home-populated"
      eyebrow="DISCOVERY"
      title="Populated feed"
      subtitle="Use this for swipe-card spacing, hero copy, and primary discovery CTA checks."
    >
      <View style={styles.metaGrid}>
        <MetaRow icon="users" label="Feed" value="12 profiles nearby" />
        <MetaRow icon="activity" label="Pace" value="Moderate to high" />
      </View>
      <LinearGradient
        colors={["rgba(124,106,247,0.30)", "rgba(52,211,153,0.18)", "rgba(28,35,48,0.96)"]}
        style={[
          styles.heroCard,
          { borderColor: theme.border, backgroundColor: theme.surface },
        ]}
      >
        <View style={styles.heroTop}>
          <Text style={[styles.heroBadge, { color: theme.accent }]}>92% aligned</Text>
          <Text style={[styles.heroDistance, { color: theme.textMuted }]}>
            1.4 mi away
          </Text>
        </View>
        <Text style={[styles.heroName, { color: theme.textPrimary }]}>
          Leilani, 28
        </Text>
        <Text style={[styles.heroLocation, { color: theme.textSecondary }]}>
          Waikiki · Run club · Evenings
        </Text>
        <Text style={[styles.heroBody, { color: theme.textSecondary }]}>
          Curated chemistry, cleaner pacing, and one obvious next step.
        </Text>
        <PrimaryPreviewButton label="Open profile" />
      </LinearGradient>
    </PreviewShell>
  );
}

function ChatThreadPreview() {
  const theme = useTheme();

  return (
    <PreviewShell
      scenario="chat-thread"
      eyebrow="CHAT"
      title="Conversation thread"
      subtitle="Deterministic chat validation for message layout, composer spacing, and send CTA placement."
    >
      <View
        style={[
          styles.panel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View style={styles.chatHeader}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: theme.primarySubtle, borderColor: theme.primary },
            ]}
          >
            <Text style={[styles.avatarText, { color: theme.primary }]}>M</Text>
          </View>
          <View>
            <Text style={[styles.panelTitle, { color: theme.textPrimary }]}>
              Mason
            </Text>
            <Text style={[styles.panelBody, { color: theme.textSecondary }]}>
              Match conversation
            </Text>
          </View>
        </View>
        <View style={styles.chatList}>
          <View
            style={[
              styles.themBubble,
              { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.bubbleText, { color: theme.textPrimary }]}>
              Coffee after the sunrise run?
            </Text>
          </View>
          <View style={[styles.meBubble, { backgroundColor: theme.primary }]}>
            <Text style={[styles.bubbleText, { color: theme.white }]}>
              Yes. Magic Island at 8 works for me.
            </Text>
          </View>
        </View>
        <TextInput
          editable={false}
          value="Locked preview composer"
          style={[
            styles.input,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.textPrimary },
          ]}
        />
        <PrimaryPreviewButton label="Send message" />
      </View>
    </PreviewShell>
  );
}

function NotificationsPreview() {
  const theme = useTheme();

  return (
    <PreviewShell
      scenario="notifications"
      eyebrow="INBOX"
      title="Notifications list"
      subtitle="Use this for grouped notification cards and the clear-all affordance."
    >
      <View style={styles.metaGrid}>
        <MetaRow icon="bell" label="Unread" value="2 items" />
        <MetaRow icon="calendar" label="Latest" value="Event RSVP" />
      </View>
      <View
        style={[
          styles.panel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View
          style={[
            styles.notificationCard,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.primary },
          ]}
        >
          <Text style={[styles.notificationTitle, { color: theme.textPrimary }]}>
            New message
          </Text>
          <Text style={[styles.notificationBody, { color: theme.textSecondary }]}>
            Mason sent a follow-up about tomorrow&apos;s run.
          </Text>
        </View>
        <View
          style={[
            styles.notificationCard,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.accent },
          ]}
        >
          <Text style={[styles.notificationTitle, { color: theme.textPrimary }]}>
            New RSVP
          </Text>
          <Text style={[styles.notificationBody, { color: theme.textSecondary }]}>
            Someone joined your beach workout invite.
          </Text>
        </View>
        <PrimaryPreviewButton label="Clear all" variant="secondary" />
      </View>
    </PreviewShell>
  );
}

function ProfileEditPreview() {
  const theme = useTheme();

  return (
    <PreviewShell
      scenario="profile-edit"
      eyebrow="PROFILE"
      title="Edit profile"
      subtitle="Stable edit-mode layout with the save action exposed for UI inspection."
    >
      <View
        style={[
          styles.panel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <TextInput
          editable={false}
          value="Honolulu"
          style={[
            styles.input,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.textPrimary },
          ]}
        />
        <TextInput
          editable={false}
          multiline
          value="Morning runner. Looking for dates, workouts, and quiet beach walks."
          style={[
            styles.input,
            styles.multilineInput,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.textPrimary },
          ]}
        />
        <View style={styles.tokenRow}>
          {["Running", "Yoga", "Beach"].map((item) => (
            <View
              key={item}
              style={[
                styles.token,
                { backgroundColor: theme.primarySubtle, borderColor: theme.primary },
              ]}
            >
              <Text style={[styles.tokenText, { color: theme.primary }]}>{item}</Text>
            </View>
          ))}
        </View>
        <PrimaryPreviewButton label="Save profile" />
      </View>
    </PreviewShell>
  );
}

function CreateFlowPreview() {
  const theme = useTheme();

  return (
    <PreviewShell
      scenario="create-flow"
      eyebrow="CREATE"
      title="Event creation"
      subtitle="Deterministic invite builder state with a live-looking primary publish action."
    >
      <View
        style={[
          styles.panel,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View style={styles.tokenRow}>
          {["Run", "Tomorrow", "Evening", "Intermediate"].map((item) => (
            <View
              key={item}
              style={[
                styles.token,
                { backgroundColor: theme.accentSubtle, borderColor: theme.accent },
              ]}
            >
              <Text style={[styles.tokenText, { color: theme.accent }]}>{item}</Text>
            </View>
          ))}
        </View>
        <TextInput
          editable={false}
          value="Magic Island"
          style={[
            styles.input,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.textPrimary },
          ]}
        />
        <TextInput
          editable={false}
          multiline
          value="Easy pace. Bring water. No pressure if you just want to walk the first mile."
          style={[
            styles.input,
            styles.multilineInput,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.border, color: theme.textPrimary },
          ]}
        />
        <PrimaryPreviewButton label="Post activity" variant="accent" />
      </View>
    </PreviewShell>
  );
}

export default function CodexPreviewScreen() {
  const scenario = resolveScenario(process.env.EXPO_PUBLIC_PREVIEW_SCENARIO);

  switch (scenario) {
    case "auth-login":
      return <LoginPreview />;
    case "home-empty":
      return <HomeEmptyPreview />;
    case "chat-thread":
      return <ChatThreadPreview />;
    case "notifications":
      return <NotificationsPreview />;
    case "profile-edit":
      return <ProfileEditPreview />;
    case "create-flow":
      return <CreateFlowPreview />;
    case "home-populated":
    default:
      return <HomePopulatedPreview />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xxl,
    gap: spacing.lg,
  },
  headerCard: {
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  eyebrow: {
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  scenarioChip: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  scenarioChipText: {
    fontSize: typography.caption,
    fontWeight: "700",
  },
  title: {
    fontSize: typography.h2,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
  panel: {
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.xxl,
    gap: spacing.md,
  },
  panelTitle: {
    fontSize: typography.h3,
    fontWeight: "800",
  },
  panelBody: {
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.body,
  },
  multilineInput: {
    minHeight: 112,
    textAlignVertical: "top",
  },
  primaryButton: {
    marginTop: spacing.sm,
  },
  metaGrid: {
    gap: spacing.md,
  },
  metaRow: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  metaIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  metaCopy: {
    gap: 2,
  },
  metaLabel: {
    fontSize: typography.caption,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  metaValue: {
    fontSize: typography.body,
    fontWeight: "700",
  },
  heroEmpty: {
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.xxxl,
    alignItems: "center",
    gap: spacing.md,
  },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: typography.h3,
    fontWeight: "800",
  },
  emptyBody: {
    fontSize: typography.bodySmall,
    lineHeight: 22,
    textAlign: "center",
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.xxxl,
    minHeight: 280,
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroBadge: {
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  heroDistance: {
    fontSize: typography.caption,
    fontWeight: "700",
  },
  heroName: {
    fontSize: typography.h1,
    fontWeight: "800",
  },
  heroLocation: {
    fontSize: typography.body,
    fontWeight: "600",
  },
  heroBody: {
    fontSize: typography.bodySmall,
    lineHeight: 22,
    maxWidth: 320,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: typography.body,
    fontWeight: "800",
  },
  chatList: {
    gap: spacing.md,
  },
  themBubble: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.lg,
    maxWidth: "85%",
  },
  meBubble: {
    alignSelf: "flex-end",
    borderRadius: radii.lg,
    padding: spacing.lg,
    maxWidth: "85%",
  },
  bubbleText: {
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
  notificationCard: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  notificationTitle: {
    fontSize: typography.body,
    fontWeight: "700",
  },
  notificationBody: {
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
  tokenRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  token: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  tokenText: {
    fontSize: typography.caption,
    fontWeight: "700",
  },
});
