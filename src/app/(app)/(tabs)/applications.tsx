import { useRouter } from 'expo-router';
import { RefreshControl, StyleSheet, View } from 'react-native';

import { ApplicationCard } from '@/components/application-card';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { EmptyView, ErrorView, LoadingView } from '@/components/ui/state-views';
import { Spacing } from '@/constants/theme';
import { useApplications } from '@/hooks/use-api';

export default function ApplicationsScreen() {
  const router = useRouter();
  const applications = useApplications();

  const active = applications.data?.filter((a) => !['consultancy_completed', 'cancelled', 'rejected'].includes(a.status));
  const closed = applications.data?.filter((a) => ['consultancy_completed', 'cancelled', 'rejected'].includes(a.status));

  return (
    <Screen
      refreshControl={
        <RefreshControl refreshing={applications.isRefetching} onRefresh={() => applications.refetch()} />
      }>
      {applications.isLoading ? (
        <LoadingView />
      ) : applications.isError ? (
        <ErrorView onRetry={() => applications.refetch()} />
      ) : applications.data?.length === 0 ? (
        <EmptyView
          icon="document-text-outline"
          title="No cases yet"
          message="Start an application and track its progress here."
          action={<Button label="Browse destinations" onPress={() => router.navigate('/')} />}
        />
      ) : (
        <>
          {active && active.length > 0 ? (
            <View style={styles.section}>
              <ThemedText type="heading">In progress</ThemedText>
              {active.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </View>
          ) : null}
          {closed && closed.length > 0 ? (
            <View style={styles.section}>
              <ThemedText type="heading">Closed</ThemedText>
              {closed.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </View>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
});
