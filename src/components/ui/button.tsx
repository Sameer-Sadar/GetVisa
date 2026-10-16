import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  icon?: React.ReactNode;
};

export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  icon,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const palette = {
    primary: { bg: theme.accent, fg: theme.onAccent, border: theme.accent },
    secondary: { bg: theme.card, fg: theme.primary, border: theme.primary },
    ghost: { bg: 'transparent', fg: theme.primary, border: 'transparent' },
    danger: { bg: theme.dangerSoft, fg: theme.danger, border: theme.dangerSoft },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      style={(state) => [
        styles.base,
        { backgroundColor: palette.bg, borderColor: palette.border },
        state.pressed && styles.pressed,
        isDisabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={palette.fg} /> : icon}
        <ThemedText type="smallBold" style={[styles.label, { color: palette.fg }]}>
          {label}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  label: {
    fontSize: 16,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
