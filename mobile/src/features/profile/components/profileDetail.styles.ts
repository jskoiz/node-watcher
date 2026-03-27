import { Dimensions, StyleSheet } from 'react-native';
import { screenLayout } from '../../../design/primitives';
import { radii, spacing, typography } from '../../../theme/tokens';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HERO_HEIGHT = 420;

export const profileDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 132,
  },
  heroContainer: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroFallbackText: {
    fontSize: 96,
    fontWeight: '900',
    letterSpacing: -4,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT * 0.75,
  },
  backButtonOverlay: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
  },
  overflowButtonOverlay: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    zIndex: 10,
  },
  overflowButton: {
    borderRadius: radii.pill,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowBackdrop: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 88,
    paddingRight: spacing.lg,
  },
  overflowMenu: {
    borderRadius: radii.lg,
    paddingVertical: spacing.xs,
    minWidth: 160,
  },
  overflowMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  overflowMenuText: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  heroNameOverlay: {
    position: 'absolute',
    bottom: spacing.xxl,
    left: screenLayout.gutter,
    right: screenLayout.gutter,
  },
  intentPill: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  intentPillText: {
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heroName: {
    fontSize: 40,
    letterSpacing: -1,
    marginBottom: spacing.xs,
    lineHeight: 44,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  heroLocation: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    alignSelf: 'flex-start',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  contentArea: {
    paddingHorizontal: screenLayout.gutter,
    paddingTop: spacing.xl,
  },
  sectionLabel: {
    letterSpacing: 1.6,
  },
  bio: {
    fontSize: typography.body,
    lineHeight: 28,
  },
  metaPanel: {
    gap: spacing.sm,
  },
  metaIntroCard: {
    borderRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  metaIntroText: {
    lineHeight: 22,
    fontSize: typography.bodySmall,
  },
  activityPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  activityPill: {
    alignSelf: 'flex-start',
  },
  activityPillText: {
    fontSize: typography.bodySmall,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  structuredRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  structuredLabel: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  structuredValue: {
    fontSize: typography.bodySmall,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  suggestBtn: {
    marginTop: spacing.sm,
    marginBottom: 120,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 24,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: screenLayout.gutter,
  },
  actionBtn: {
    flex: 1,
  },
  actionBtnPrimary: {
    flex: 2,
  },
});
