import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function LoadingView({ label = 'Loading...' }: { label?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.center} accessibilityLiveRegion="polite">
      <ActivityIndicator color={theme.primary} />
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Ionicons name="cloud-offline-outline" size={36} color="#94A3B8" />
      <ThemedText type="heading">Something went wrong</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
        {message ?? 'We could not load this. Check your connection and try again.'}
      </ThemedText>
      {onRetry ? <Button label="Try again" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

export function EmptyView({
  icon = 'file-tray-outline',
  title,
  message,
  action,
}: {
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  message?: string;
  action?: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={styles.center}>
      <Ionicons name={icon} size={40} color={theme.textSecondary} />
      <ThemedText type="heading">{title}</ThemedText>
      {message ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
          {message}
        </ThemedText>
      ) : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.five,
  },
  centerText: {
    textAlign: 'center',
  },
});
