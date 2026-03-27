/**
 * Liquid Glass material definitions.
 *
 * Glass is intentionally restricted to focal/premium moments such as hero
 * accents, overlays, and select navigation chrome. It is not the default
 * treatment for everyday controls or cards.
 */

export type GlassTier = 'thin' | 'light' | 'medium' | 'thick' | 'frosted';
export type GlassTintKey = 'tintedPrimary' | 'tintedAccent';

export interface GlassMaterial {
  background: string;
  blur: number;
  border: string;
}

export const glass: Record<GlassTier | GlassTintKey, GlassMaterial> = {
  thin:    { background: 'rgba(253,249,244,0.14)', blur: 10, border: 'rgba(255,255,255,0.18)' },
  light:   { background: 'rgba(253,249,244,0.22)', blur: 18, border: 'rgba(255,255,255,0.20)' },
  medium:  { background: 'rgba(253,249,244,0.38)', blur: 24, border: 'rgba(255,255,255,0.24)' },
  thick:   { background: 'rgba(253,249,244,0.62)', blur: 30, border: 'rgba(255,255,255,0.28)' },
  frosted: { background: 'rgba(253,249,244,0.80)', blur: 34, border: 'rgba(255,255,255,0.30)' },

  tintedPrimary: { background: 'rgba(196,168,130,0.12)', blur: 18, border: 'rgba(196,168,130,0.16)' },
  tintedAccent:  { background: 'rgba(139,122,156,0.10)', blur: 18, border: 'rgba(139,122,156,0.14)' },
};

/** Shadows tuned for glass elements — softer and more diffused than standard card shadows. */
export const glassShadows = {
  standard: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  subtle: {
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
} as const;

/** Solid fallback backgrounds used when Reduce Transparency is enabled. */
export const glassFallbacks: Record<GlassTier, string> = {
  thin:    '#F6EFE7',
  light:   '#F4EDE4',
  medium:  '#F1E8DE',
  thick:   '#FDF9F4',
  frosted: '#FFFFFF',
};
