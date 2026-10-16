import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { CountryMark } from '@/components/country-mark';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { EmptyView, ErrorView, LoadingView } from '@/components/ui/state-views';
import { Spacing } from '@/constants/theme';
import { useCountries, useServices } from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';
import { formatMoney } from '@/lib/status';

export default function CountryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const countries = useCountries();
  const services = useServices(id);
  const country = countries.data?.find((c) => c.id === id);

  return (
    <Screen>
      <Stack.Screen options={{ title: country?.name ?? 'Services' }} />
      {country ? (
        <View style={styles.header}>
          <CountryMark code={country.code} size={52} />
          <ThemedText type="title">{country.name}</ThemedText>
          <ThemedText themeColor="textSecondary">Choose the service that fits your plans.</ThemedText>
        </View>
      ) : null}

      {services.isLoading ? (
        <LoadingView />
      ) : services.isError ? (
        <ErrorView onRetry={() => services.refetch()} />
      ) : services.data?.length === 0 ? (
        <EmptyView
          title="No services yet"
          message="Services for this country will be available soon."
        />
      ) : (
        services.data?.map((service) => (
          <Card
            key={service.id}
            onPress={() => router.push({ pathname: '/service/[id]', params: { id: service.id } })}
            accessibilityLabel={`${service.serviceName}, ${formatMoney(service.fee, service.currency)}`}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <ThemedText type="heading">{service.serviceName}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {service.summary}
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </View>
            <View style={styles.row}>
              <Badge label={formatMoney(service.fee, service.currency)} tone="info" />
              <ThemedText type="caption" themeColor="textSecondary">
                {service.processingTime}
              </ThemedText>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  flex: {
    flex: 1,
    gap: Spacing.half,
  },
});
