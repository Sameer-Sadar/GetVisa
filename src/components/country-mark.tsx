import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Windows (and some Android fonts) render flag emojis as the country code letters,
 * so we always show a designed code badge instead of relying on emoji glyphs.
 */
export function CountryMark({ code, size = 44 }: { code: string; size?: number }) {
  const theme = useTheme();

  return (
    <View
      accessibilityLabel={code}
      style={[
        styles.mark,
        {
          width: size,
          height: size,
          borderRadius: Radius.md,
          backgroundColor: theme.primarySoft,
        },
      ]}>
      <ThemedText type="smallBold" themeColor="primary">
        {code}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
