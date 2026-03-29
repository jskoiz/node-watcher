import {
  useFonts,
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '@expo-google-fonts/instrument-serif';

export const fontFamily = {
  serif: 'InstrumentSerif_400Regular',
  serifSemiBold: 'InstrumentSerif_400Regular', // Instrument Serif has a single weight
  serifBold: 'InstrumentSerif_400Regular',
  serifItalic: 'InstrumentSerif_400Regular_Italic',
  sans: undefined, // system default (SF Pro / Roboto)
} as const;

// Intent-level aliases keep the serif restrained to editorial emphasis.
// Utility UI should continue to use `uiSans`.
export const fontIntent = {
  editorialHeadline: fontFamily.serifBold,
  editorialAccent: fontFamily.serifSemiBold,
  editorialBody: fontFamily.serif,
  uiSans: fontFamily.sans,
} as const;

export function useFontsLoaded(): boolean {
  const [loaded] = useFonts({
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
  });
  return loaded;
}
