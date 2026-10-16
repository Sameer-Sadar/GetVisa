import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { ErrorView, LoadingView } from '@/components/ui/state-views';
import { Spacing } from '@/constants/theme';
import { useApplications, useCountries, useService } from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';
import { isSameService } from '@/lib/catalogue';
import { formatMoney } from '@/lib/status';

function Bullet({ text, icon = 'checkmark-circle' }: { text: string; icon?: 'checkmark-circle' | 'document-outline' }) {
  const theme = useTheme();
  return (
    <View style={styles.bullet}>
      <Ionicons name={icon} size={18} color={theme.primary} style={styles.bulletIcon} />
      <ThemedText type="small" style={styles.flex}>
        {text}
      </ThemedText>
    </View>
  );
}

export default function ServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const service = useService(id);
  const countries = useCountries();
  const applications = useApplications();

  if (service.isLoading) return <LoadingView />;
  if (service.isError || !service.data) return <ErrorView onRetry={() => service.refetch()} />;

  const data = service.data;
  const country = countries.data?.find((c) => c.id === data.countryId);
  const draft = applications.data?.find((a) => isSameService(data, a.visaServiceId) && a.status === 'draft');

  const start = () =>
    router.push({
      pathname: '/apply/[serviceId]',
      params: draft ? { serviceId: data.id, draftId: draft.id } : { serviceId: data.id },
    });

  return (
    <Screen>
      <Stack.Screen options={{ title: country?.name ?? 'Service details' }} />
      <View style={styles.header}>
        <ThemedText type="title">{data.serviceName}</ThemedText>
        <ThemedText themeColor="textSecondary">{data.summary}</ThemedText>
      </View>

      <Card>
        <View style={styles.facts}>
          <View style={styles.fact}>
            <ThemedText type="caption" themeColor="textSecondary">
              Consultancy fee
            </ThemedText>
            <ThemedText type="subtitle">{formatMoney(data.fee, data.currency)}</ThemedText>
          </View>
          <View style={styles.fact}>
            <ThemedText type="caption" themeColor="textSecondary">
              Our work takes
            </ThemedText>
            <ThemedText type="heading">{data.processingTime}</ThemedText>
          </View>
        </View>
        <ThemedText type="caption" themeColor="textSecondary">
          The fee covers our consultancy service only. Government and embassy fees are separate.
        </ThemedText>
      </Card>

      <Card>
        <ThemedText type="heading">Who this is for</ThemedText>
        {data.eligibilityInfo.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            Details for this service will appear here.
          </ThemedText>
        ) : (
          data.eligibilityInfo.map((line) => <Bullet key={line} text={line} />)
        )}
      </Card>

      <Card>
        <ThemedText type="heading">Documents you will need</ThemedText>
        {data.checklist.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            Required documents will appear here.
          </ThemedText>
        ) : (
          data.checklist.map((item) => (
            <Bullet
              key={item.type}
              icon="document-outline"
              text={`${item.label}${item.required ? '' : ' (optional)'}`}
            />
          ))
        )}
      </Card>

      <Button label={draft ? 'Continue your draft' : 'Start application'} onPress={start} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one,
  },
  facts: {
    flexDirection: 'row',
    gap: Spacing.four,
    flexWrap: 'wrap',
  },
  fact: {
    gap: Spacing.half,
    flexShrink: 1,
  },
  bullet: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  bulletIcon: {
    marginTop: 1,
  },
  flex: {
    flex: 1,
  },
});
