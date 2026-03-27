import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular_Italic,
} from '@expo-google-fonts/playfair-display';

export const fontFamily = {
  serif: 'PlayfairDisplay_400Regular',
  serifSemiBold: 'PlayfairDisplay_600SemiBold',
  serifBold: 'PlayfairDisplay_700Bold',
  serifItalic: 'PlayfairDisplay_400Regular_Italic',
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
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
  });
  return loaded;
}
