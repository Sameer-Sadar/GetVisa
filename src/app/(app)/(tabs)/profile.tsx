import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import { z } from 'zod';

import * as api from '@/api';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { confirmAction, showMessage } from '@/lib/confirm';
import { useAuth, useCurrentUser } from '@/state/auth';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your full name.'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{7,20}$/, 'Enter a valid phone number, e.g. +92 300 1234567.'),
});
type FormValues = z.infer<typeof schema>;

const LEGAL_ROWS = [
  { label: 'Privacy policy', icon: 'shield-checkmark-outline' as const },
  { label: 'Terms of service', icon: 'reader-outline' as const },
  { label: 'Help and support', icon: 'help-buoy-outline' as const },
];

export default function ProfileScreen() {
  const theme = useTheme();
  const user = useCurrentUser();
  const { updateUser, signOut } = useAuth();
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: user.name, phone: user.phone },
  });

  const save = useMutation({
    mutationFn: (values: FormValues) => api.updateProfile(user.id, values),
    onSuccess: (updated) => {
      updateUser(updated);
      reset({ name: updated.name, phone: updated.phone });
      setSaved(true);
    },
    onError: (e) => setServerError(e instanceof Error ? e.message : 'Could not save your profile.'),
  });

  const onSubmit = handleSubmit((values) => {
    setSaved(false);
    setServerError(null);
    save.mutate(values);
  });

  return (
    <Screen>
      <View style={styles.identity}>
        <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
          <ThemedText type="subtitle" themeColor="primary">
            {user.name.charAt(0).toUpperCase()}
          </ThemedText>
        </View>
        <View style={styles.flex}>
          <ThemedText type="heading">{user.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {user.email}
          </ThemedText>
        </View>
        <Badge label="Applicant" tone="info" />
      </View>

      <Card>
        <ThemedText type="heading">Personal details</ThemedText>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Full name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
              autoComplete="name"
            />
          )}
        />
        <TextField label="Email" value={user.email} editable={false} hint="Contact support to change your email." />
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Phone number"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.phone?.message}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          )}
        />
        {serverError ? (
          <ThemedText type="small" themeColor="danger" accessibilityLiveRegion="polite">
            {serverError}
          </ThemedText>
        ) : null}
        {saved && !isDirty ? (
          <ThemedText type="small" themeColor="success" accessibilityLiveRegion="polite">
            Profile saved.
          </ThemedText>
        ) : null}
        <Button label="Save changes" onPress={onSubmit} loading={save.isPending} disabled={!isDirty} />
      </Card>

      <Card>
        {LEGAL_ROWS.map((row, index) => (
          <Pressable
            key={row.label}
            accessibilityRole="button"
            onPress={() =>
              showMessage(row.label, 'This page will be provided before the production release.')
            }
            style={[
              styles.legalRow,
              index > 0 && { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth },
            ]}>
            <Ionicons name={row.icon} size={22} color={theme.textSecondary} />
            <ThemedText style={styles.flex}>{row.label}</ThemedText>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </Pressable>
        ))}
      </Card>

      <Button
        label="Sign out"
        variant="danger"
        onPress={() =>
          confirmAction('Sign out?', 'You will need to sign in again to see your cases.', 'Sign out', () => {
            void signOut();
          })
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
});
