import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { toneColors, type Tone } from '@/lib/status';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const theme = useTheme();
  const colors = toneColors[tone];

  return (
    <View style={[styles.badge, { backgroundColor: theme[colors.bg] }]}>
      <ThemedText type="caption" style={[styles.text, { color: theme[colors.fg] }]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
  },
  text: {
    fontWeight: 700,
  },
});
