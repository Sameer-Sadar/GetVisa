/**
 * GetVisa light royal theme: ivory surfaces, navy text, royal-blue chrome, gold CTAs.
 * Dark tokens are kept unused; the app is locked to light via useTheme().
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0B1F4A',
    background: '#FAF7F0',
    backgroundElement: '#EEE8DC',
    backgroundSelected: '#E4DCCB',
    textSecondary: '#4A5872',
    card: '#FFFFFF',
    border: '#D9D2C4',
    primary: '#0242A5',
    primarySoft: '#E8EEF6',
    onPrimary: '#FFFFFF',
    accent: '#E0B93A',
    accentSoft: '#FBF4D6',
    onAccent: '#0B1F4A',
    success: '#15803D',
    successSoft: '#DCFCE7',
    warning: '#B45309',
    warningSoft: '#FEF3C7',
    danger: '#B91C1C',
    dangerSoft: '#FEE2E2',
    info: '#0E7490',
    infoSoft: '#CFFAFE',
  },
  dark: {
    text: '#F1F5F9',
    background: '#070F22',
    backgroundElement: '#12203A',
    backgroundSelected: '#1B2E52',
    textSecondary: '#9AA6BA',
    card: '#0D1A33',
    border: '#24365A',
    primary: '#5B9CFF',
    primarySoft: '#12265A',
    onPrimary: '#071226',
    accent: '#F7BE3D',
    accentSoft: '#3A2E0A',
    onAccent: '#0B1F4A',
    success: '#4ADE80',
    successSoft: '#12351F',
    warning: '#FBBF24',
    warningSoft: '#3A2A0A',
    danger: '#F87171',
    dangerSoft: '#3D1515',
    info: '#22D3EE',
    infoSoft: '#0B3340',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const MaxContentWidth = 720;

export const APP_NAME = 'GetVisa';
