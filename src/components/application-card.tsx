import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useServices } from '@/hooks/use-api';
import { isSameService } from '@/lib/catalogue';
import { applicationStatusMeta, formatDate, paymentStatusMeta } from '@/lib/status';
import type { Application } from '@/types';

export function ApplicationCard({ application }: { application: Application }) {
  const router = useRouter();
  const theme = useTheme();
  const { data: services } = useServices();
  const service = services?.find((s) => isSameService(s, application.visaServiceId));
  const status = applicationStatusMeta[application.status];
  const payment = paymentStatusMeta[application.paymentStatus];
  const showPayment = application.status !== 'draft' && application.status !== 'cancelled';

  return (
    <Card
      onPress={() => router.push({ pathname: '/application/[id]', params: { id: application.id } })}
      accessibilityLabel={`${service?.serviceName ?? 'Application'}, ${status.label}`}>
      <View style={styles.row}>
        <View style={styles.flex}>
          <ThemedText type="heading">{service?.serviceName ?? 'Visa consultancy'}</ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            {application.referenceNumber ?? 'Not submitted yet'} · Updated {formatDate(application.updatedAt)}
          </ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
      </View>
      <View style={styles.badges}>
        <Badge label={status.label} tone={status.tone} />
        {showPayment ? <Badge label={payment.label} tone={payment.tone} /> : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  flex: {
    flex: 1,
    gap: Spacing.half,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
