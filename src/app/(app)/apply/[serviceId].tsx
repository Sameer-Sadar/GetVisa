import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import * as api from '@/api';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { ChoiceField } from '@/components/ui/choice-field';
import { Screen } from '@/components/ui/screen';
import { ErrorView, LoadingView } from '@/components/ui/state-views';
import { TextField } from '@/components/ui/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { useApplication, useService } from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';
import { buildFormSchema, emptyFormValues, type ApplicationFormValues } from '@/lib/form-schema';
import { useCurrentUser } from '@/state/auth';
import type { Application, FormField, VisaService } from '@/types';

export default function ApplyScreen() {
  const { serviceId, draftId } = useLocalSearchParams<{ serviceId: string; draftId?: string }>();
  const service = useService(serviceId);
  const draft = useApplication(draftId);

  if (service.isLoading || (draftId && draft.isLoading)) return <LoadingView />;
  if (service.isError || !service.data) return <ErrorView onRetry={() => service.refetch()} />;
  if (draftId && (draft.isError || !draft.data)) return <ErrorView onRetry={() => draft.refetch()} />;

  return <ApplyForm service={service.data} draft={draft.data} />;
}

function ApplyForm({ service, draft }: { service: VisaService; draft?: Application }) {
  const router = useRouter();
  const theme = useTheme();
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const schema = useMemo(() => buildFormSchema(service.formFields), [service.formFields]);
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<ApplicationFormValues>,
    defaultValues: emptyFormValues(service.formFields, draft?.formData),
  });

  // Once the first save creates the draft, later saves update that same record.
  const [draftId, setDraftId] = useState(draft?.id);

  const save = useMutation({
    mutationFn: (formData: ApplicationFormValues) =>
      api.saveDraft({ id: draftId, userId: user.id, visaServiceId: service.id, formData }),
    onSuccess: (application) => {
      setDraftId(application.id);
      queryClient.invalidateQueries({ queryKey: ['applications', user.id] });
      queryClient.invalidateQueries({ queryKey: ['application', user.id, application.id] });
    },
    onError: (error) => setServerError(error instanceof Error ? error.message : 'Could not save.'),
  });

  /** Drafts can be saved incomplete, so this skips validation on purpose. */
  const saveDraft = async () => {
    setServerError(null);
    setSavedNotice(false);
    await save.mutateAsync(getValues()).then(() => setSavedNotice(true)).catch(() => {});
  };

  const saveAndContinue = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const application = await save.mutateAsync(values);
      router.replace({ pathname: '/application/[id]', params: { id: application.id } });
    } catch {
      // surfaced through onError
    }
  });

  return (
    <Screen>
      <Stack.Screen options={{ title: service.serviceName }} />
      <ThemedText themeColor="textSecondary">
        Step 1 of 3: your details. Next you will upload documents, then submit.
      </ThemedText>

      <View style={[styles.notice, { backgroundColor: theme.infoSoft }]}>
        <Ionicons name="lock-closed-outline" size={18} color={theme.info} />
        <ThemedText type="caption" themeColor="info" style={styles.flex}>
          Passport details are stored securely and only authorised staff can see them.
        </ThemedText>
      </View>

      {service.formFields.map((field) => (
        <FormFieldInput
          key={field.key}
          field={field}
          control={control}
          error={errors[field.key]?.message as string | undefined}
        />
      ))}

      {serverError ? (
        <View style={[styles.alert, { backgroundColor: theme.dangerSoft }]} accessibilityLiveRegion="polite">
          <ThemedText type="small" themeColor="danger">
            {serverError}
          </ThemedText>
        </View>
      ) : null}
      {savedNotice ? (
        <ThemedText type="small" themeColor="success" accessibilityLiveRegion="polite">
          Draft saved. You can come back to it from My cases.
        </ThemedText>
      ) : null}

      <Button label="Save and continue" onPress={saveAndContinue} loading={save.isPending} />
      <Button label="Save draft" variant="secondary" onPress={saveDraft} disabled={save.isPending} />
    </Screen>
  );
}

function FormFieldInput({
  field,
  control,
  error,
}: {
  field: FormField;
  control: ReturnType<typeof useForm<ApplicationFormValues>>['control'];
  error?: string;
}) {
  const label = field.required ? field.label : `${field.label} (optional)`;

  return (
    <Controller
      control={control}
      name={field.key}
      render={({ field: { onChange, onBlur, value } }) => {
        if (field.type === 'select') {
          return (
            <ChoiceField
              label={label}
              options={field.options ?? []}
              value={value}
              onChange={onChange}
              error={error}
            />
          );
        }
        return (
          <TextField
            label={label}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={error}
            placeholder={field.placeholder}
            multiline={field.type === 'textarea'}
            keyboardType={
              field.type === 'number' ? 'number-pad' : field.type === 'date' ? 'numbers-and-punctuation' : 'default'
            }
            autoCapitalize={field.sensitive ? 'characters' : 'sentences'}
            autoCorrect={!field.sensitive}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  notice: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  alert: {
    padding: Spacing.three,
    borderRadius: Radius.md,
  },
});
