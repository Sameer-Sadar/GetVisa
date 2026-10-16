import { Image, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { APP_NAME, Spacing } from '@/constants/theme';

export function BrandMark({ subtitle }: { subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      <Image
        accessibilityIgnoresInvertColors
        accessibilityLabel={APP_NAME}
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
      />
      <ThemedText type="title">{APP_NAME}</ThemedText>
      {subtitle ? (
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 20,
  },
  subtitle: {
    textAlign: 'center',
  },
});
