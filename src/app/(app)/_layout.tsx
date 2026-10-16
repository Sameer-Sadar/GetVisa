import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="country/[id]" options={{ title: 'Services', headerBackTitle: 'Back' }} />
      <Stack.Screen name="service/[id]" options={{ title: 'Service details', headerBackTitle: 'Back' }} />
      <Stack.Screen name="apply/[serviceId]" options={{ title: 'Application', headerBackTitle: 'Back' }} />
      <Stack.Screen name="application/[id]" options={{ title: 'Case details', headerBackTitle: 'Back' }} />
      <Stack.Screen
        name="payment/[applicationId]"
        options={{ title: 'Payment', headerBackTitle: 'Back', presentation: 'modal' }}
      />
    </Stack>
  );
}
