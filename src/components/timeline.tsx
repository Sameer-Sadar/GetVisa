import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDateTime } from '@/lib/status';
import type { TimelineEvent } from '@/types';

export function Timeline({ events }: { events: TimelineEvent[] }) {
  const theme = useTheme();
  const ordered = [...events].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <Card>
      <ThemedText type="heading">Case history</ThemedText>
      {ordered.map((event, index) => {
        const isLatest = index === 0;
        const isLast = index === ordered.length - 1;
        return (
          <View key={event.id} style={styles.row} accessible accessibilityLabel={`${event.title}, ${formatDateTime(event.at)}`}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: isLatest ? theme.primary : theme.backgroundSelected },
                ]}
              />
              {!isLast ? <View style={[styles.line, { backgroundColor: theme.border }]} /> : null}
            </View>
            <View style={styles.body}>
              <ThemedText type="smallBold">{event.title}</ThemedText>
              {event.detail ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {event.detail}
                </ThemedText>
              ) : null}
              <ThemedText type="caption" themeColor="textSecondary">
                {formatDateTime(event.at)}
              </ThemedText>
            </View>
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  rail: {
    alignItems: 'center',
    width: 14,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 5,
  },
  line: {
    flex: 1,
    width: 2,
    marginTop: Spacing.one,
  },
  body: {
    flex: 1,
    gap: Spacing.half,
    paddingBottom: Spacing.three,
  },
});
