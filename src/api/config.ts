import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Base URL for `/api/v1`.
 *
 * Physical phones cannot use localhost or the Android emulator alias 10.0.2.2.
 * In Expo Go we reuse Metro’s LAN host (the same IP as the QR code).
 */
export function getApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '');
  }

  const lanHost = lanHostFromExpo();
  if (Constants.isDevice && lanHost) {
    return `http://${lanHost}:4000/api/v1`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000/api/v1';
  }

  return 'http://localhost:4000/api/v1';
}

function lanHostFromExpo() {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return null;
  const host = hostUri.split(':')[0]?.trim();
  if (!host || host === 'localhost' || host === '127.0.0.1') return null;
  return host;
}
