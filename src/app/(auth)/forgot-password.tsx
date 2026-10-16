import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { z } from 'zod';

import * as api from '@/api';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const schema = z.object({ email: z.email('Enter a valid email address.') });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [sent, setSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const onSubmit = handleSubmit(async ({ email }) => {
    await api.requestPasswordReset(email);
    setSent(true);
  });

  if (sent) {
    return (
      <Screen>
        <View style={styles.sent}>
          <Ionicons name="mail-open-outline" size={44} color={theme.primary} />
          <ThemedText type="subtitle">Check your email</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.centered}>
            If an account exists for that address, we have sent a link to reset your password.
          </ThemedText>
        </View>
        <Button label="Back to sign in" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ThemedText themeColor="textSecondary">
        Enter the email you registered with and we will send you a reset link.
      </ThemedText>
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
            onSubmitEditing={onSubmit}
          />
        )}
      />
      <Button label="Send reset link" onPress={onSubmit} loading={isSubmitting} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sent: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
  centered: {
    textAlign: 'center',
  },
});
