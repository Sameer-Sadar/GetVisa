import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/state/auth';

const schema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name.'),
    email: z.email('Enter a valid email address.'),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[0-9 ()-]{7,20}$/, 'Enter a valid phone number, e.g. +92 300 1234567.'),
    password: z
      .string()
      .min(8, 'Use at least 8 characters.')
      .regex(/[A-Za-z]/, 'Include at least one letter.')
      .regex(/[0-9]/, 'Include at least one number.'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });
type FormValues = z.infer<typeof schema>;

export default function RegisterScreen() {
  const theme = useTheme();
  const { signUp } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async ({ name, email, phone, password }) => {
    setServerError(null);
    try {
      await signUp({ name, email, phone, password });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Could not create the account.');
    }
  });

  return (
    <Screen>
      <ThemedText themeColor="textSecondary">
        Create an account to start a consultancy case. We only ask for what we need.
      </ThemedText>

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
            textContentType="name"
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
        )}
      />
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
            textContentType="telephoneNumber"
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
            hint="At least 8 characters, with a letter and a number."
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Confirm password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.confirmPassword?.message}
            secureTextEntry
            autoComplete="new-password"
            onSubmitEditing={onSubmit}
          />
        )}
      />

      {serverError ? (
        <View style={[styles.alert, { backgroundColor: theme.dangerSoft }]} accessibilityLiveRegion="polite">
          <ThemedText type="small" themeColor="danger">
            {serverError}
          </ThemedText>
        </View>
      ) : null}

      <Button label="Create account" onPress={onSubmit} loading={isSubmitting} />

      <ThemedText type="caption" themeColor="textSecondary">
        By continuing you agree to the Terms of Service and Privacy Policy.
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  alert: {
    padding: Spacing.three,
    borderRadius: Radius.md,
  },
});
