import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import * as api from '@/api';
import { DocumentChecklist } from '@/components/document-checklist';
import { ThemedText } from '@/components/themed-text';
import { Timeline } from '@/components/timeline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { ErrorView, LoadingView } from '@/components/ui/state-views';
import { Radius, Spacing } from '@/constants/theme';
import { useApplication, usePayment, useService } from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';
import { confirmAction } from '@/lib/confirm';
import { applicationStatusMeta, formatMoney, paymentStatusMeta } from '@/lib/status';
import { useCurrentUser } from '@/state/auth';
import type { Application } from '@/types';

function mask(value: string) {
  return value.length <= 4 ? '••••' : `••••${value.slice(-4)}`;
}

export default function ApplicationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const application = useApplication(id);
  const service = useService(application.data?.visaServiceId ?? '');
  const payment = usePayment(id);

  const refreshAll = (updated: Application) => {
    queryClient.setQueryData(['application', user.id, updated.id], updated);
    queryClient.invalidateQueries({ queryKey: ['applications', user.id] });
    queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
  };

  const run = useMutation({
    mutationFn: (action: () => Promise<Application>) => action(),
    onMutate: () => setActionError(null),
    onSuccess: refreshAll,
    onError: (error) => setActionError(error instanceof Error ? error.message : 'Something went wrong.'),
  });

  if (application.isLoading) return <LoadingView />;
  if (application.isError || !application.data) {
    return <ErrorView message="We could not find this case." onRetry={() => application.refetch()} />;
  }
  if (!service.data) return service.isError ? <ErrorView onRetry={() => service.refetch()} /> : <LoadingView />;

  const data = application.data;
  const svc = service.data;
  const status = applicationStatusMeta[data.status];
  const paymentMeta = paymentStatusMeta[data.paymentStatus];
  const isDraft = data.status === 'draft';
  const needsInfo = data.status === 'additional_info_required';
  const isClosed = ['consultancy_completed', 'cancelled', 'rejected'].includes(data.status);
  const canUpload = isDraft || needsInfo;
  const requiredMissing = svc.checklist.filter(
    (item) => item.required && !data.documents.some((d) => d.documentType === item.type),
  );
  const stillNeedsReplacement = data.documents.some((d) => d.reviewStatus === 'replacement_requested');
  const canPay = !isDraft && data.status !== 'cancelled' && (data.paymentStatus === 'unpaid' || data.paymentStatus === 'failed');

  return (
    <Screen>
      <Stack.Screen options={{ title: data.referenceNumber ?? 'Draft application' }} />

      <View style={styles.header}>
        <ThemedText type="title">{svc.serviceName}</ThemedText>
        <View style={styles.badges}>
          <Badge label={status.label} tone={status.tone} />
          {!isDraft && data.status !== 'cancelled' ? <Badge label={paymentMeta.label} tone={paymentMeta.tone} /> : null}
        </View>
      </View>

      {needsInfo ? (
        <View style={[styles.banner, { backgroundColor: theme.warningSoft }]}>
          <Ionicons name="alert-circle" size={22} color={theme.warning} />
          <ThemedText type="small" themeColor="warning" style={styles.flex}>
            We need more information. Replace the files marked below, then tell us when you are done.
          </ThemedText>
        </View>
      ) : null}

      {isDraft ? (
        <Card>
          <ThemedText type="heading">Step 2 of 3: documents</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Upload the required documents, then submit your application for review.
          </ThemedText>
          <Button
            label="Edit my details"
            variant="secondary"
            onPress={() =>
              router.push({
                pathname: '/apply/[serviceId]',
                params: { serviceId: svc.id, draftId: data.id },
              })
            }
          />
        </Card>
      ) : null}

      <DocumentChecklist application={data} service={svc} canUpload={canUpload} />

      {isDraft ? (
        <View style={styles.actions}>
          {requiredMissing.length > 0 ? (
            <ThemedText type="caption" themeColor="textSecondary">
              Still needed: {requiredMissing.map((m) => m.label).join(', ')}
            </ThemedText>
          ) : null}
          <Button
            label="Submit application"
            loading={run.isPending}
            disabled={requiredMissing.length > 0}
            onPress={() => run.mutate(() => api.submitApplication(data.id, user.id))}
          />
        </View>
      ) : null}

      {needsInfo ? (
        <Button
          label="I have sent the requested information"
          loading={run.isPending}
          disabled={stillNeedsReplacement}
          onPress={() => run.mutate(() => api.respondToInformationRequest(data.id, user.id))}
        />
      ) : null}
      {needsInfo && stillNeedsReplacement ? (
        <ThemedText type="caption" themeColor="textSecondary">
          Replace the flagged file first to continue.
        </ThemedText>
      ) : null}

      {!isDraft && data.status !== 'cancelled' ? (
        <Card>
          <ThemedText type="heading">Payment</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Consultancy fee: {formatMoney(svc.fee, svc.currency)}
          </ThemedText>
          {payment.data?.status === 'paid' && payment.data.receiptNumber ? (
            <View style={styles.receipt}>
              <Ionicons name="receipt-outline" size={20} color={theme.success} />
              <ThemedText type="smallBold" themeColor="success">
                Receipt {payment.data.receiptNumber}
              </ThemedText>
            </View>
          ) : null}
          {data.paymentStatus === 'pending' ? (
            <ThemedText type="small" themeColor="warning">
              Waiting for confirmation from the payment provider.
            </ThemedText>
          ) : null}
          {canPay ? (
            <Button
              label={data.paymentStatus === 'failed' ? 'Try payment again' : 'Pay consultancy fee'}
              onPress={() =>
                router.push({ pathname: '/payment/[applicationId]', params: { applicationId: data.id } })
              }
            />
          ) : null}
          {data.paymentStatus === 'pending' ? (
            <Button
              label="Check payment status"
              variant="secondary"
              onPress={() =>
                router.push({ pathname: '/payment/[applicationId]', params: { applicationId: data.id } })
              }
            />
          ) : null}
        </Card>
      ) : null}

      <Card>
        <ThemedText type="heading">Your details</ThemedText>
        {svc.formFields.every((field) => !data.formData[field.key]) ? (
          <ThemedText type="small" themeColor="textSecondary">
            No details saved yet. Tap Edit my details to complete the form.
          </ThemedText>
        ) : (
          svc.formFields.map((field) => {
            const value = data.formData[field.key];
            if (!value) return null;
            return (
              <View key={field.key} style={styles.detailRow}>
                <ThemedText type="caption" themeColor="textSecondary">
                  {field.label}
                </ThemedText>
                <ThemedText type="small">{field.sensitive ? mask(value) : value}</ThemedText>
              </View>
            );
          })
        )}
      </Card>

      <Timeline events={data.timeline} />

      {actionError ? (
        <View style={[styles.banner, { backgroundColor: theme.dangerSoft }]} accessibilityLiveRegion="polite">
          <ThemedText type="small" themeColor="danger" style={styles.flex}>
            {actionError}
          </ThemedText>
        </View>
      ) : null}

      {__DEV__ && !isDraft && !isClosed ? (
        <Card style={{ borderStyle: 'dashed' }}>
          <ThemedText type="smallBold">Prototype tools</ThemedText>
          <ThemedText type="caption" themeColor="textSecondary">
            Plays the part of staff in the admin dashboard so you can see how updates reach the applicant.
          </ThemedText>
          <Button
            label="Simulate staff update"
            variant="secondary"
            loading={run.isPending}
            onPress={() => run.mutate(() => api.simulateStaffUpdate(data.id, user.id))}
          />
        </Card>
      ) : null}

      {!isClosed ? (
        <Button
          label={isDraft ? 'Discard application' : 'Cancel application'}
          variant="danger"
          disabled={run.isPending}
          onPress={() =>
            confirmAction(
              isDraft ? 'Discard this application?' : 'Cancel this application?',
              'This cannot be undone.',
              isDraft ? 'Discard' : 'Cancel application',
              () =>
                run.mutate(() => api.cancelApplication(data.id, user.id), {
                  onSuccess: () => router.back(),
                }),
            )
          }
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.two,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  banner: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  actions: {
    gap: Spacing.two,
  },
  receipt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  detailRow: {
    gap: Spacing.half,
  },
});
