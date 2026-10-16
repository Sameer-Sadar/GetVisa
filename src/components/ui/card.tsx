import { Pressable, StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CardProps = ViewProps & {
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function Card({ onPress, style, children, accessibilityLabel, ...rest }: CardProps) {
  const theme = useTheme();
  const cardStyle = [styles.card, { backgroundColor: theme.card, borderColor: theme.border }, style];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}>
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.85,
  },
});
