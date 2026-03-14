import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import AppIcon from "../components/ui/AppIcon";
import { radii, spacing, typography } from "../theme/tokens";

const BASE = "#0B1238";
const SURFACE = "rgba(10, 18, 48, 0.92)";
const SURFACE_ELEVATED = "rgba(14, 25, 61, 0.96)";
const BORDER = "rgba(134, 115, 255, 0.12)";
const PRIMARY = "#8A78FF";
const SECONDARY = "#48D6AB";
const ACCENT = "#F2AA23";
const TEXT_PRIMARY = "#F5FAFF";
const TEXT_SECONDARY = "rgba(245,250,255,0.72)";
const TEXT_MUTED = "rgba(245,250,255,0.42)";

const HERO_YOGA = require("../../assets/generated/brdg-hero-yoga-rooftop.png");
const HERO_WALK = require("../../assets/generated/brdg-hero-botanical-walk.png");
const HERO_FLATLAY = require("../../assets/generated/brdg-hero-wellness-flatlay.png");

function ScreenShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bgOrbTop} pointerEvents="none" />
      <View style={styles.bgOrbBottom} pointerEvents="none" />
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {children}
    </SafeAreaView>
  );
}

function MetricPill({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof AppIcon>["name"];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metricPill}>
      <AppIcon name={icon} size={15} color={PRIMARY} />
      <View style={styles.metricCopy}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}</Text>
      </View>
    </View>
  );
}

function Tag({
  label,
  tone = "primary",
}: {
  label: string;
  tone?: "primary" | "secondary" | "accent";
}) {
  const color =
    tone === "secondary" ? SECONDARY : tone === "accent" ? ACCENT : PRIMARY;
  return (
    <View style={[styles.tag, { backgroundColor: `${color}20`, borderColor: `${color}50` }]}>
      <Text style={[styles.tagText, { color }]}>{label}</Text>
    </View>
  );
}

export function DiscoverPreviewScreen() {
  return (
    <ScreenShell
      eyebrow="DISCOVER"
      title="Tonight's people."
      subtitle="Curated, selective, and quieter. Filters recede. The hero card does the selling."
    >
      <View style={styles.heroCard}>
        <Image source={HERO_YOGA} style={styles.heroImage} resizeMode="cover" />
        <LinearGradient
          colors={["rgba(5,10,35,0.0)", "rgba(5,10,35,0.18)", "rgba(5,10,35,0.96)"]}
          style={styles.heroOverlay}
        />
        <View style={styles.heroTopRow}>
          <View style={styles.brandChip}>
            <Text style={styles.brandChipText}>BRDG</Text>
          </View>
          <View style={styles.matchChip}>
            <AppIcon name="star" size={14} color={BASE} />
            <Text style={styles.matchChipText}>92% aligned</Text>
          </View>
        </View>
        <View style={styles.heroBottom}>
          <Text style={styles.heroName}>Leilani, 28</Text>
          <Text style={styles.heroLocation}>Waikiki · 1.4 mi away</Text>
          <View style={styles.tagRow}>
            <Tag label="Run club" tone="secondary" />
            <Tag label="Evenings" />
            <Tag label="4 miles" tone="accent" />
          </View>
          <Text style={styles.heroBio}>
            Curated chemistry, cleaner pacing, and one clear next step.
          </Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <MetricPill icon="heart" label="Intent" value="Open to both" />
        <MetricPill icon="map-pin" label="Nearby" value="Venice" />
        <MetricPill icon="calendar" label="Action" value="See details" />
      </View>
    </ScreenShell>
  );
}

export function ExplorePreviewScreen() {
  return (
    <ScreenShell
      eyebrow="EXPLORE"
      title="What's happening."
      subtitle="A cleaner browse with fewer content modes visible at once and stronger editorial framing."
    >
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
          <Image source={HERO_WALK} style={styles.sectionImage} resizeMode="cover" />
          <LinearGradient
            colors={["rgba(11,18,56,0.02)", "rgba(11,18,56,0.96)"]}
            style={styles.sectionImageOverlay}
          />
          <View style={styles.sectionBody}>
            <Text style={styles.sectionEyebrow}>FEATURED EVENT</Text>
            <Text style={styles.sectionTitle}>Ala Moana Sunrise Run Club</Text>
            <Text style={styles.sectionSub}>Featured run club of the week with location, mood, and what makes it worth showing up for.</Text>
            <View style={styles.inlineStats}>
              <Tag label="Tomorrow · 6:00 AM" tone="accent" />
              <Tag label="Running" />
              <Tag label="Venice" tone="secondary" />
            </View>
          </View>
        </View>

        <View style={styles.listCard}>
          <Text style={styles.listHeading}>Near you</Text>
          {[
            ["Run clubs", "Editorial picks this week", "8 events"],
            ["Activity spots", "Saved and worth knowing", "12 saved"],
            ["Community", "New tonight", "3 notes"],
          ].map(([title, meta, count]) => (
            <View key={title} style={styles.listRow}>
              <View style={styles.listIcon}>
                <AppIcon name="navigation" size={16} color={PRIMARY} />
              </View>
              <View style={styles.listCopy}>
                <Text style={styles.listTitle}>{title}</Text>
                <Text style={styles.listMeta}>{meta}</Text>
              </View>
              <Text style={styles.listCount}>{count}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

export function CreatePreviewScreen() {
  return (
    <ScreenShell
      eyebrow="CREATE"
      title="Invite people to move."
      subtitle="Hosting should feel like setting a scene, not filling out a utility form."
    >
      <View style={styles.sectionCard}>
        <Image source={HERO_FLATLAY} style={styles.sectionImage} resizeMode="cover" />
        <LinearGradient
          colors={["rgba(11,18,56,0.03)", "rgba(11,18,56,0.96)"]}
          style={styles.sectionImageOverlay}
        />
        <View style={styles.sectionBody}>
          <Text style={styles.sectionEyebrow}>HOST FLOW / INVITATION-FIRST</Text>
          <Text style={styles.sectionTitle}>Sunset Beach Workout</Text>
          <Text style={styles.sectionSub}>
            Ala Moana Magic Island · Tomorrow · 6:30 PM
          </Text>
          <View style={styles.tagRow}>
            <Tag label="Run" tone="secondary" />
            <Tag label="Evening" />
            <Tag label="Intermediate" tone="accent" />
          </View>
        </View>
      </View>

      <View style={styles.formPreview}>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Activity</Text>
          <Text style={styles.formValue}>Beach conditioning + mobility</Text>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Who it’s for</Text>
          <Text style={styles.formValue}>People open to chemistry and momentum</Text>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Details</Text>
          <Text style={styles.formValue}>
            Warm-up jog, light circuit, then coffee if the vibe is right.
          </Text>
        </View>
      </View>
    </ScreenShell>
  );
}

export function InboxPreviewScreen() {
  const rows = [
    ["Kai", "Still good for the sunrise run and coffee after?", "2m", PRIMARY],
    ["Malia", "I’m in for Kailua paddle. Want to split a board?", "14m", SECONDARY],
    ["Devon", "Climb night has one spot left if you want in.", "1h", ACCENT],
  ] as const;

  return (
    <ScreenShell
      eyebrow="INBOX"
      title="Your circle."
      subtitle="Inbox should feel more like relationship momentum than a default messages list."
    >
      <View style={styles.listCard}>
        {rows.map(([name, message, time, color]) => (
          <View key={name} style={styles.chatRow}>
            <View style={[styles.chatAvatar, { backgroundColor: `${color}25`, borderColor: `${color}55` }]}>
              <Text style={[styles.chatAvatarText, { color }]}>{name[0]}</Text>
            </View>
            <View style={styles.chatCopy}>
              <View style={styles.chatTop}>
                <Text style={styles.chatName}>{name}</Text>
                <Text style={styles.chatTime}>{time}</Text>
              </View>
              <Text style={styles.chatMessage}>{message}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.metricsRow}>
        <MetricPill icon="message-square" label="Unread" value="2 threads" />
        <MetricPill icon="users" label="Chemistry" value="Intent-aware" />
      </View>
    </ScreenShell>
  );
}

export function ProfilePreviewScreen() {
  return (
    <ScreenShell
      eyebrow="PROFILE"
      title="Move with intent."
      subtitle="Profiles should feel like elevated identity surfaces, not stacked prompts and badges."
    >
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>A</Text>
          </View>
          <View style={styles.profileHeaderCopy}>
            <Text style={styles.profileName}>Hayden, 28</Text>
            <Text style={styles.profileLocation}>Venice Beach · Early runs</Text>
          </View>
        </View>

        <Text style={styles.profileBio}>
          Stronger coffee, cleaner plans, and movement that turns into dinner.
        </Text>

        <View style={styles.tagRow}>
          <Tag label="Runner" />
          <Tag label="Available tonight" tone="secondary" />
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pace</Text>
            <Text style={styles.statValue}>7:40 / mile</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Prefers</Text>
            <Text style={styles.statValue}>Night runs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Intent</Text>
            <Text style={styles.statValue}>Meet after</Text>
          </View>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BASE,
  },
  bgOrbTop: {
    position: "absolute",
    top: -110,
    right: -40,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "#2A39B9",
    opacity: 0.22,
  },
  bgOrbBottom: {
    position: "absolute",
    bottom: -140,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#00B997",
    opacity: 0.14,
  },
  header: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  eyebrow: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 3,
    marginBottom: spacing.sm,
  },
  title: {
    color: TEXT_PRIMARY,
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 38,
    letterSpacing: -1.5,
  },
  subtitle: {
    color: TEXT_SECONDARY,
    fontSize: typography.body,
    lineHeight: 23,
    marginTop: spacing.md,
  },
  heroCard: {
    marginHorizontal: spacing.xxl,
    marginTop: spacing.md,
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BORDER,
    minHeight: 440,
    backgroundColor: SURFACE,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.lg,
  },
  brandChip: {
    backgroundColor: "rgba(8,13,40,0.72)",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  brandChipText: {
    color: TEXT_PRIMARY,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  matchChip: {
    backgroundColor: PRIMARY,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  matchChipText: {
    color: BASE,
    fontWeight: "900",
    fontSize: 12,
  },
  heroBottom: {
    marginTop: "auto",
    padding: spacing.xxl,
  },
  heroName: {
    color: TEXT_PRIMARY,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  heroLocation: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    marginTop: spacing.xs,
  },
  heroBio: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    lineHeight: 24,
    marginTop: spacing.md,
  },
  metricsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.xxl,
    marginTop: spacing.lg,
  },
  metricPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: SURFACE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  metricCopy: {
    flex: 1,
  },
  metricLabel: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  metricValue: {
    color: TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tag: {
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: 130,
    gap: spacing.lg,
  },
  sectionCard: {
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: SURFACE,
    minHeight: 300,
  },
  sectionImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  sectionImageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  sectionBody: {
    marginTop: "auto",
    padding: spacing.xxl,
  },
  sectionEyebrow: {
    color: PRIMARY,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
  },
  sectionTitle: {
    color: TEXT_PRIMARY,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 31,
    marginTop: spacing.sm,
  },
  sectionSub: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  inlineStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  listCard: {
    backgroundColor: SURFACE_ELEVATED,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER,
    padding: spacing.lg,
  },
  listHeading: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: spacing.md,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  listIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(113,245,215,0.12)",
    borderWidth: 1,
    borderColor: "rgba(113,245,215,0.28)",
  },
  listCopy: {
    flex: 1,
  },
  listTitle: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: "700",
  },
  listMeta: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    marginTop: 2,
  },
  listCount: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: "700",
    width: 78,
    textAlign: "right",
  },
  formPreview: {
    marginHorizontal: spacing.xxl,
    marginTop: spacing.lg,
    backgroundColor: SURFACE_ELEVATED,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BORDER,
    padding: spacing.lg,
    gap: spacing.md,
  },
  formRow: {
    gap: spacing.xs,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  formLabel: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  formValue: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "600",
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  chatAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  chatAvatarText: {
    fontSize: 20,
    fontWeight: "800",
  },
  chatCopy: {
    flex: 1,
  },
  chatTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatName: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: "800",
  },
  chatTime: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: "700",
  },
  chatMessage: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  profileCard: {
    marginHorizontal: spacing.xxl,
    marginTop: spacing.md,
    backgroundColor: SURFACE_ELEVATED,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BORDER,
    padding: spacing.xxl,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  profileAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(113,245,215,0.16)",
    borderWidth: 1,
    borderColor: "rgba(113,245,215,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarText: {
    color: PRIMARY,
    fontSize: 34,
    fontWeight: "900",
  },
  profileHeaderCopy: {
    flex: 1,
  },
  profileName: {
    color: TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: "900",
  },
  profileLocation: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  profileBio: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    lineHeight: 23,
    marginTop: spacing.lg,
  },
  statsGrid: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  statCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statLabel: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  statValue: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 0,
  },
});
