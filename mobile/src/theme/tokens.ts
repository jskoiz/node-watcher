export const lightTheme = {
  // Neutral ladder
  background: '#FAF6EF',
  surface: '#FDF9F4',
  surfaceElevated: '#FFFFFF',
  stroke: '#DED4C7',
  strokeStrong: '#BDAF9B',
  textPrimary: '#261F19',
  textSecondary: '#544A40',
  textMuted: '#786C5F',
  textInverse: '#FFFDF9',

  // Semantic surfaces and selection
  selectedFill: '#E8D8C1',
  selectedText: '#261F19',
  fieldSurface: '#F6EFE7',
  chipSurface: '#F1E8DE',
  subduedSurface: '#F4EDE4',

  // Editorial emphasis
  accentPrimary: '#C4A882',
  accentSoft: '#ECDDCA',

  // Legacy accent family retained for compatibility where warm emphasis
  // is not yet adopted. Phase 3 should converge usage intentionally.
  accent: '#8B7A9C',
  accentSubtle: 'rgba(139,122,156,0.14)',

  // Primary — warm gold
  primary: '#C4A882',
  primaryPressed: '#B09672',
  primarySubtle: '#E8D8C1',

  // Energy — soft blush
  energy: '#D4A59A',
  energySubtle: 'rgba(212,165,154,0.10)',

  // Semantic
  danger: '#C97070',
  dangerSubtle: 'rgba(201,112,112,0.08)',
  success: '#8BAA7A',
  warning: '#C4A882',

  // Button
  buttonPrimary: '#1F1813',

  // Fixed
  white: '#FFFFFF',
  black: '#000000',

  // Shadows
  shadowColor: '#000000',
  shadowColorDark: '#000000',

  // Compatibility aliases. Keep these during the token migration so Phase 2
  // does not force a primitive/screen refactor.
  backgroundSoft: '#F4EDE4',
  surfaceGlass: '#F6EFE7',
  border: '#DED4C7',
  borderSoft: '#DED4C7',
  borderFocus: '#C4A882',
};

export type Theme = typeof lightTheme;

export const gradients = {
  appBg: ['#FAF6EF', '#F4EDE4'],
  appBgDark: ['#FAF6EF', '#EDE2D4'],
  cardChrome: ['rgba(255,255,255,0.96)', 'rgba(253,249,244,0.86)'],
  spotlight: ['rgba(196,168,130,0.08)', 'rgba(139,122,156,0.03)'],
  photoOverlay: ['transparent', 'rgba(253,249,244,0.94)'],
  cardOverlay: ['transparent', 'rgba(253,249,244,0.0)', 'rgba(253,249,244,0.96)'],
};

export const editorialColors = {
  background: lightTheme.background,
  surface: lightTheme.surface,
  border: lightTheme.stroke,
  textPrimary: lightTheme.textPrimary,
  textSecondary: lightTheme.textSecondary,
  textMuted: lightTheme.textMuted,
  textOnImage: '#3D352E',
  success: lightTheme.success,
  danger: lightTheme.danger,
  badgeBg: 'rgba(253,249,244,0.86)',
  matchBadgeBg: '#F0E8D8',
  matchBadgeText: '#6B5A40',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  rowPadding: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
};

export const radii = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 34,
  sheet: 38,
  pill: 999,
};

export const typography = {
  display: 42,
  h1: 30,
  h2: 24,
  h3: 20,
  body: 16,
  bodySmall: 14,
  caption: 12,
};

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  glow: {
    shadowColor: '#C4A882',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
    elevation: 3,
  },
};
