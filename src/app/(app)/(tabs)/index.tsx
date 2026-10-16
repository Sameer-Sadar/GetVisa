import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ApplicationCard } from '@/components/application-card';
import { CountryMark } from '@/components/country-mark';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { ErrorView, LoadingView } from '@/components/ui/state-views';
import { Radius, Spacing } from '@/constants/theme';
import { useApplications, useCountries, useServices } from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';
import { useCurrentUser } from '@/state/auth';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const user = useCurrentUser();
  const countries = useCountries();
  const services = useServices();
  const applications = useApplications();

  const firstName = user.name.split(' ')[0];
  const needsAction = applications.data?.find((a) => a.status === 'additional_info_required');
  const latest = applications.data?.find((a) => a.status !== 'cancelled');

  return (
    <Screen>
      <View style={styles.greeting}>
        <ThemedText type="title">Hello, {firstName}</ThemedText>
        <ThemedText themeColor="textSecondary">Where would you like to go next?</ThemedText>
      </View>

      {needsAction ? (
        <Card
          onPress={() =>
            router.push({ pathname: '/application/[id]', params: { id: needsAction.id } })
          }
          accessibilityLabel="Action needed on your case"
          style={{ backgroundColor: theme.warningSoft, borderColor: theme.warningSoft }}>
          <View style={styles.alertRow}>
            <Ionicons name="alert-circle" size={24} color={theme.warning} />
            <View style={styles.flex}>
              <ThemedText type="heading" themeColor="warning">
                Action needed
              </ThemedText>
              <ThemedText type="small" themeColor="warning">
                {needsAction.referenceNumber} needs more information from you.
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.warning} />
          </View>
        </Card>
      ) : null}

      {latest ? (
        <View style={styles.section}>
          <ThemedText type="heading">Latest case</ThemedText>
          <ApplicationCard application={latest} />
        </View>
      ) : null}

      <View style={styles.section}>
        <ThemedText type="heading">Choose a destination</ThemedText>
        {countries.isLoading ? (
          <LoadingView />
        ) : countries.isError ? (
          <ErrorView onRetry={() => countries.refetch()} />
        ) : (
          countries.data?.map((country) => {
            const count = services.data?.filter((s) => s.countryId === country.id).length;
            return (
              <Card
                key={country.id}
                onPress={() => router.push({ pathname: '/country/[id]', params: { id: country.id } })}
                accessibilityLabel={`${country.name}${count ? `, ${count} services` : ''}`}>
                <View style={styles.countryRow}>
                  <CountryMark code={country.code} />
                  <View style={styles.flex}>
                    <ThemedText type="heading">{country.name}</ThemedText>
                    {count !== undefined ? (
                      <ThemedText type="caption" themeColor="textSecondary">
                        {count} {count === 1 ? 'service' : 'services'}
                      </ThemedText>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                </View>
              </Card>
            );
          })
        )}
      </View>

      <View style={[styles.notice, { backgroundColor: theme.infoSoft }]}>
        <Ionicons name="information-circle-outline" size={20} color={theme.info} />
        <ThemedText type="caption" themeColor="info" style={styles.flex}>
          We provide consultancy and application support. We do not issue visas, and approval is decided
          by the official authority.
        </ThemedText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: {
    gap: Spacing.one,
    paddingTop: Spacing.two,
  },
  section: {
    gap: Spacing.two,
  },
  flex: {
    flex: 1,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  notice: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    alignItems: 'flex-start',
  },
});
