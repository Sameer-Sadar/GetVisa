import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import * as api from '@/api';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { ErrorView, LoadingView } from '@/components/ui/state-views';
import { Radius, Spacing } from '@/constants/theme';
import { useApplication, usePayment, useService } from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';
import { formatMoney } from '@/lib/status';
import { useCurrentUser } from '@/state/auth';
import type { Application, Payment } from '@/types';

type Provider = Payment['provider'];

const METHODS: { provider: Provider; title: string; description: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  {
    provider: 'local_gateway',
    title: 'Local payment',
    description: 'Bank transfer, mobile wallet or local card',
    icon: 'wallet-outline',
  },
  {
    provider: 'international_gateway',
    title: 'International card',
    description: 'Visa, Mastercard and other international cards',
    icon: 'card-outline',
  },
];

export default function PaymentScreen() {
  const { applicationId } = useLocalSearchParams<{ applicationId: string }>();
  const router = useRouter();
  const theme = useTheme();
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const [provider, setProvider] = useState<Provider>('local_gateway');
  const [error, setError] = useState<string | null>(null);

  const application = useApplication(applicationId);
  const service = useService(application.data?.visaServiceId ?? '');
  const payment = usePayment(applicationId);

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['application', user.id, applicationId] }),
      queryClient.invalidateQueries({ queryKey: ['payment', user.id, applicationId] }),
      queryClient.invalidateQueries({ queryKey: ['applications', user.id] }),
      queryClient.invalidateQueries({ queryKey: ['notifications', user.id] }),
    ]);
  };

  const checkout = useMutation({
    mutationFn: () => api.createCheckout({ applicationId, userId: user.id, provider }),
    onMutate: () => setError(null),
    onSuccess: async (created) => {
      queryClient.setQueryData(['payment', user.id, applicationId], created);
      queryClient.setQueryData(['application', user.id, applicationId], (current: Application | undefined) =>
        current ? { ...current, paymentStatus: 'pending' as const } : current,
      );
      await refresh();
    },
    onError: (e) => setError(e instanceof Error ? e.message : 'Could not start checkout.'),
  });

  const webhook = useMutation({
    mutationFn: (outcome: 'paid' | 'failed') => {
      const paymentId = payment.data?.id ?? checkout.data?.id;
      if (!paymentId) throw new Error('No payment in progress.');
      return api.simulateProviderWebhook(paymentId, outcome);
    },
    onSuccess: refresh,
    onError: (e) => setError(e instanceof Error ? e.message : 'Could not update the payment.'),
  });

  if (application.isLoading || payment.isLoading) return <LoadingView />;
  if (application.isError || !application.data || !service.data) {
    return <ErrorView onRetry={() => application.refetch()} />;
  }

  const svc = service.data;
  const total = formatMoney(svc.fee, svc.currency);
  const status = application.data.paymentStatus;
  const current = payment.data;

  if (status === 'paid') {
    return (
      <Screen>
        <View style={styles.result}>
          <Ionicons name="checkmark-circle" size={64} color={theme.success} />
          <ThemedText type="subtitle">Payment confirmed</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.centered}>
            We received {total}. Your receipt number is {current?.receiptNumber}.
          </ThemedText>
        </View>
        <Button label="Back to my case" onPress={() => router.back()} />
      </Screen>
    );
  }

  if (status === 'pending' && current) {
    return (
      <Screen>
        <Card>
          <View style={styles.hostedHeader}>
            <Ionicons name="shield-checkmark" size={22} color={theme.primary} />
            <ThemedText type="heading">Secure checkout</ThemedText>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            {current.provider === 'local_gateway' ? 'Local payment' : 'International card'} · {total}
          </ThemedText>
          <View style={[styles.protoNote, { backgroundColor: theme.warningSoft }]}>
            <ThemedText type="caption" themeColor="warning">
              Prototype: this stands in for the payment provider&apos;s hosted page. In the real app the
              provider collects payment details, so we never see or store raw card data.
            </ThemedText>
          </View>
          <Button
            label={`Pay ${total}`}
            loading={webhook.isPending && webhook.variables === 'paid'}
            disabled={webhook.isPending}
            onPress={() => webhook.mutate('paid')}
          />
          <Button
            label="Simulate a failed payment"
            variant="secondary"
            loading={webhook.isPending && webhook.variables === 'failed'}
            disabled={webhook.isPending}
            onPress={() => webhook.mutate('failed')}
          />
        </Card>
        {error ? (
          <ThemedText type="small" themeColor="danger" accessibilityLiveRegion="polite">
            {error}
          </ThemedText>
        ) : null}
        <ThemedText type="caption" themeColor="textSecondary">
          Your case is marked as paid only after the provider confirms the payment to our server.
        </ThemedText>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card>
        <ThemedText type="caption" themeColor="textSecondary">
          {svc.serviceName}
        </ThemedText>
        <ThemedText type="title">{total}</ThemedText>
        <ThemedText type="caption" themeColor="textSecondary">
          Consultancy fee only. Government and embassy fees are not included.
        </ThemedText>
      </Card>

      {status === 'failed' ? (
        <View style={[styles.protoNote, { backgroundColor: theme.dangerSoft }]} accessibilityLiveRegion="polite">
          <ThemedText type="small" themeColor="danger">
            Your last payment did not go through and no money was taken. You can try again.
          </ThemedText>
        </View>
      ) : null}

      <ThemedText type="heading">Choose how to pay</ThemedText>
      {METHODS.map((method) => {
        const selected = provider === method.provider;
        return (
          <Pressable
            key={method.provider}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => setProvider(method.provider)}
            style={[
              styles.method,
              {
                backgroundColor: selected ? theme.primarySoft : theme.card,
                borderColor: selected ? theme.primary : theme.border,
              },
            ]}>
            <Ionicons name={method.icon} size={24} color={selected ? theme.primary : theme.textSecondary} />
            <View style={styles.flex}>
              <ThemedText type="smallBold">{method.title}</ThemedText>
              <ThemedText type="caption" themeColor="textSecondary">
                {method.description}
              </ThemedText>
            </View>
            <Ionicons
              name={selected ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={selected ? theme.primary : theme.textSecondary}
            />
          </Pressable>
        );
      })}

      {error ? (
        <ThemedText type="small" themeColor="danger" accessibilityLiveRegion="polite">
          {error}
        </ThemedText>
      ) : null}

      <Button label="Continue to secure checkout" loading={checkout.isPending} onPress={() => checkout.mutate()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    gap: Spacing.half,
  },
  centered: {
    textAlign: 'center',
  },
  result: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.five,
  },
  hostedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  protoNote: {
    padding: Spacing.three,
    borderRadius: Radius.md,
  },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
});
