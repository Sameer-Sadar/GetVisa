import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ChoiceFieldProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

/** A small segmented choice, used instead of a native picker so it works on every platform. */
export function ChoiceField({ label, options, value, onChange, error }: ChoiceFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <View style={styles.row}>
        {options.map((option) => {
          const selected = option === value;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityLabel={`${label}: ${option}`}
              accessibilityState={{ selected }}
              onPress={() => onChange(option)}
              style={[
                styles.option,
                {
                  backgroundColor: selected ? theme.primarySoft : theme.card,
                  borderColor: selected ? theme.primary : theme.border,
                },
              ]}>
              <ThemedText type="smallBold" style={{ color: selected ? theme.primary : theme.text }}>
                {option}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <ThemedText type="caption" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  option: {
    minHeight: 44,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    justifyContent: 'center',
  },
});
