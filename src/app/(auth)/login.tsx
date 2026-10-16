import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { BrandMark } from '@/components/brand-mark';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/state/auth';

const schema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});
type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const theme = useTheme();
  const { signIn } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setServerError(null);
    try {
      await signIn(email, password);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Could not sign in. Try again.');
    }
  });

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: theme.background }]}>
      <Screen>
        <View style={styles.hero}>
          <BrandMark subtitle="Apply, upload documents, pay and track your case in one place." />
        </View>

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
              placeholder="you@example.com"
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
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
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

        <Button label="Sign in" onPress={onSubmit} loading={isSubmitting} />

        <View style={styles.links}>
          <Link href="/forgot-password" style={styles.link}>
            <ThemedText type="linkPrimary">Forgot password?</ThemedText>
          </Link>
          <Link href="/register" style={styles.link}>
            <ThemedText type="linkPrimary">Create an account</ThemedText>
          </Link>
        </View>

        <View style={[styles.demo, { backgroundColor: theme.accentSoft }]}>
          <ThemedText type="smallBold" themeColor="primary">
            Prototype demo account
          </ThemedText>
          <ThemedText type="small">demo@visa.app / Password123</ThemedText>
          <Button
            label="Fill demo credentials"
            variant="ghost"
            onPress={() => {
              setValue('email', 'demo@visa.app', { shouldValidate: true });
              setValue('password', 'Password123', { shouldValidate: true });
            }}
          />
        </View>
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
  alert: {
    padding: Spacing.three,
    borderRadius: Radius.md,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  link: {
    paddingVertical: Spacing.one,
  },
  demo: {
    padding: Spacing.three,
    borderRadius: Radius.lg,
    gap: Spacing.one,
  },
});
