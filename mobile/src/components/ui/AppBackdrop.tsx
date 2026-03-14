import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/useTheme';

export default function AppBackdrop() {
  const theme = useTheme();

  return (
    <View pointerEvents="none" style={styles.container}>
      <LinearGradient
        colors={['rgba(255,255,255,0.015)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topVeil}
      />
      <View style={[styles.halo, styles.haloPrimary, { backgroundColor: theme.primary }]} />
      <View style={[styles.halo, styles.haloAccent, { backgroundColor: theme.accent }]} />
      <View style={[styles.beam, styles.beamPrimary, { backgroundColor: theme.primary }]} />
      <View style={[styles.beam, styles.beamAccent, { backgroundColor: theme.accent }]} />
      <View style={[styles.gridLine, styles.gridTop, { backgroundColor: theme.border }]} />
      <View style={[styles.gridLine, styles.gridMid, { backgroundColor: theme.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  topVeil: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  halo: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.08,
    transform: [{ scaleX: 1.35 }],
  },
  haloPrimary: {
    width: 260,
    height: 260,
    top: -112,
    right: -84,
  },
  haloAccent: {
    width: 240,
    height: 240,
    bottom: 76,
    left: -118,
  },
  beam: {
    position: 'absolute',
    width: 1,
    borderRadius: 999,
    opacity: 0.14,
  },
  beamPrimary: {
    top: 84,
    bottom: 96,
    right: '32%',
  },
  beamAccent: {
    top: 168,
    bottom: -10,
    left: '18%',
    opacity: 0.09,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    opacity: 0.18,
  },
  gridTop: {
    top: 72,
  },
  gridMid: {
    top: '52%',
  },
});
