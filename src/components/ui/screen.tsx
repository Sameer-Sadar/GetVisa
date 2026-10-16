import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Scrolling page container: themed background, readable max width, consistent padding. */
export function Screen({ children, contentContainerStyle, ...rest }: ScrollViewProps) {
  const theme = useTheme();

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.scroll}
      {...rest}>
      <View style={[styles.content, contentContainerStyle]}>{children}</View>
    </ScrollView>
  );
}

/** Non-scrolling variant for screens that manage their own list. */
export function ScreenFrame({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return <View style={[styles.frame, { backgroundColor: theme.background }]}>{children}</View>;
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  frame: {
    flex: 1,
  },
});
