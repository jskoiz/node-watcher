import { Dimensions, StyleSheet } from 'react-native';
import { screenLayout } from '../../../design/primitives';
import { lightTheme, radii, spacing, typography } from '../../../theme/tokens';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PHOTO_GALLERY_WIDTH = SCREEN_WIDTH - spacing.xxl * 2;
const PHOTO_SECONDARY_CARD_WIDTH = (PHOTO_GALLERY_WIDTH - spacing.sm) / 2;

// Static references for StyleSheet (module-level); components use useTheme() for reactivity
const BASE = lightTheme.background;
const SURFACE = lightTheme.surface;
const SURFACE_ELEVATED = lightTheme.surfaceElevated;
const SUBDUED_SURFACE = lightTheme.subduedSurface;
const FIELD_SURFACE = lightTheme.fieldSurface;
const CHIP_SURFACE = lightTheme.chipSurface;
const STROKE = lightTheme.stroke;
const PRIMARY = lightTheme.accentPrimary;
const SELECTED_FILL = lightTheme.selectedFill;
const SELECTED_TEXT = lightTheme.selectedText;
const ACCENT_SOFT = lightTheme.accentSoft;
const TEXT_PRIMARY = lightTheme.textPrimary;
const TEXT_SECONDARY = lightTheme.textSecondary;
const TEXT_MUTED = lightTheme.textMuted;
const DANGER = lightTheme.danger;

const SOFT_SHADOW = {
  shadowColor: '#B0A89E',
  shadowOpacity: 0.1,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
} as const;

export const profileStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BASE },
  heroBg: {
    position: 'absolute',
    top: -80,
    left: SCREEN_WIDTH / 2 - 150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#E8DFD0',
    opacity: 0.04,
  },
  scrollContent: { paddingBottom: 112 },
  hero: { marginBottom: spacing.lg },
  heroPhotoWrap: {
    width: SCREEN_WIDTH,
    height: 260,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: 'hidden',
    backgroundColor: SURFACE_ELEVATED,
  },
  heroPhoto: { width: '100%', height: '100%' },
  heroFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroFallbackText: { fontSize: 64, fontWeight: '900', color: '#FFFFFF' },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
    paddingBottom: 0,
    paddingTop: 84,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: 'hidden',
  },
  heroCopyCard: {
    alignSelf: 'flex-start',
    maxWidth: '82%',
    marginLeft: screenLayout.gutter,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderRadius: 24,
    borderBottomLeftRadius: 0,
  },
  heroName: { fontSize: 28, fontWeight: '900', letterSpacing: -0.8, color: TEXT_PRIMARY, marginBottom: spacing.xs },
  intentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: ACCENT_SOFT,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    marginBottom: spacing.xs,
  },
  intentBadgeText: { fontSize: typography.bodySmall, fontWeight: '800', color: PRIMARY },
  heroLocation: { fontSize: typography.bodySmall, color: TEXT_SECONDARY, fontWeight: '600' },
  ambientStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg, paddingTop: spacing.lg },
  ambientStat: { alignItems: 'center' },
  ambientStatNum: { fontSize: 32, fontWeight: '900', letterSpacing: -1, lineHeight: 36, color: TEXT_PRIMARY },
  ambientStatLabel: { fontSize: 10, fontWeight: '700', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 2 },
  ambientStatDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: STROKE },
  editBar: {
    flexDirection: 'row',
    paddingHorizontal: screenLayout.gutter,
    marginBottom: screenLayout.sectionGap,
    gap: spacing.sm,
    alignItems: 'center',
  },
  editBtnWrap: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  editBtnActive: { opacity: 0.92 },
  editBtnText: { fontSize: typography.bodySmall, fontWeight: '900', letterSpacing: 0.2 },
  editBtnTextActive: { color: '#FFF8F0' },
  cancelBtn: { paddingHorizontal: spacing.md, paddingVertical: 11, borderRadius: radii.pill },
  cancelBtnText: { fontSize: typography.bodySmall, fontWeight: '700' },
  tagCloud: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radii.pill },
  tagPillText: { fontSize: 13, fontWeight: '700', color: TEXT_PRIMARY },
  fieldsCard: { backgroundColor: SURFACE, borderRadius: 20, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, ...SOFT_SHADOW },
  fieldRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.md },
  fieldLabel: { fontSize: typography.bodySmall, fontWeight: '700', width: 100, color: TEXT_MUTED, textTransform: 'capitalize' },
  fieldValue: { flex: 1, fontSize: typography.bodySmall, fontWeight: '600', textTransform: 'capitalize', color: TEXT_PRIMARY },
  fieldInput: {
    flex: 1,
    fontSize: typography.bodySmall,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderColor: STROKE,
    backgroundColor: FIELD_SURFACE,
    color: TEXT_PRIMARY,
  },
  fieldInputMultiline: { minHeight: 86, paddingTop: spacing.sm },
  fieldDivider: { height: 1, backgroundColor: STROKE },
  photoManager: { gap: spacing.md },
  photoIntro: { gap: spacing.xs, padding: spacing.md, borderRadius: 18, backgroundColor: SUBDUED_SURFACE },
  photoIntroTitle: { fontSize: typography.bodySmall, fontWeight: '800', color: TEXT_PRIMARY },
  photoIntroBody: { fontSize: typography.caption, lineHeight: 18, color: TEXT_SECONDARY },
  photoProgressTrack: { height: 6, borderRadius: radii.pill, backgroundColor: STROKE, overflow: 'hidden', marginTop: 2 },
  photoProgressFill: { height: '100%', borderRadius: radii.pill, backgroundColor: PRIMARY },
  photoGrid: { gap: spacing.md },
  photoSecondaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  photoEmptyCard: { borderRadius: 18, backgroundColor: SURFACE, padding: spacing.lg, gap: spacing.xs },
  photoEmptyTitle: { fontSize: typography.bodySmall, fontWeight: '800', color: TEXT_PRIMARY },
  photoEmptyBody: { fontSize: typography.caption, lineHeight: 18, color: TEXT_SECONDARY },
  photoGalleryCardShell: {
    borderRadius: 24,
  },
  photoGalleryCardShellPrimary: { width: '100%' },
  photoGalleryCardShellSecondary: { width: PHOTO_SECONDARY_CARD_WIDTH },
  photoGalleryCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: SURFACE,
    ...SOFT_SHADOW,
  },
  photoCardActive: {
    backgroundColor: SURFACE_ELEVATED,
  },
  photoMedia: { position: 'relative' },
  photoGalleryImage: { width: '100%', backgroundColor: BASE },
  photoGalleryImagePrimary: { height: 252 },
  photoGalleryImageSecondary: { aspectRatio: 1 },
  photoBadgeRow: { position: 'absolute', top: spacing.sm, left: spacing.sm },
  photoMeta: { gap: spacing.sm, padding: spacing.md },
  photoHeaderMeta: { flex: 1, gap: 2 },
  photoLabel: { fontSize: typography.bodySmall, fontWeight: '800', color: TEXT_PRIMARY },
  photoSlotText: { fontSize: typography.caption, color: TEXT_MUTED, fontWeight: '600' },
  photoSlotPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(253,251,248,0.9)',
  },
  photoSlotPillText: { fontSize: 11, fontWeight: '800', color: TEXT_SECONDARY, letterSpacing: 0.3 },
  photoPrimaryPill: { backgroundColor: 'rgba(253,251,248,0.96)' },
  photoPrimaryPillText: { color: PRIMARY },
  photoInlineStatus: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.sm, paddingVertical: 8, borderRadius: 12, backgroundColor: ACCENT_SOFT },
  photoInlineStatusText: { fontSize: typography.caption, fontWeight: '700', color: TEXT_PRIMARY },
  photoActionsCompact: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  photoActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CHIP_SURFACE,
  },
  photoActionButtonDanger: {
    backgroundColor: 'rgba(201,112,112,0.08)',
  },
  photoActionButtonDisabled: { opacity: 0.7 },
  settingsCard: { backgroundColor: SURFACE, borderRadius: 20, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, ...SOFT_SHADOW },
  settingsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: spacing.md },
  settingsIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  settingsLabel: { flex: 1, fontSize: typography.body, fontWeight: '700', color: TEXT_PRIMARY },
  settingsArrow: { fontSize: 22, fontWeight: '300', color: TEXT_MUTED },
  buildInfoCard: { paddingTop: spacing.sm, gap: spacing.xs },
  buildInfoRow: { gap: 4, paddingVertical: spacing.sm },
  buildInfoLabel: { fontSize: typography.bodySmall, fontWeight: '700', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: 0.6 },
  buildInfoValue: { fontSize: typography.bodySmall, lineHeight: 20, color: TEXT_PRIMARY, fontWeight: '600' },
  buildInfoDivider: { height: 1, backgroundColor: STROKE },
  errorBanner: {
    marginHorizontal: screenLayout.gutter,
    borderRadius: 18,
    padding: spacing.md,
    marginBottom: screenLayout.sectionGapTight,
    backgroundColor: 'rgba(201,112,112,0.08)',
  },
  errorText: { fontSize: typography.bodySmall, fontWeight: '600', color: DANGER },
  logoutBtn: { alignItems: 'center', paddingVertical: spacing.xl, marginTop: spacing.sm },
  logoutText: { fontSize: typography.body, fontWeight: '800', color: DANGER, letterSpacing: 0.2 },
});
