import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const REFRESH_KEY = 'vc.refreshToken';

let accessToken: string | null = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

async function canUseSecureStore() {
  if (Platform.OS === 'web') return false;
  return SecureStore.isAvailableAsync();
}

export async function getRefreshToken() {
  if (await canUseSecureStore()) {
    return SecureStore.getItemAsync(REFRESH_KEY);
  }
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export async function persistSession(nextAccessToken: string, refreshToken: string) {
  accessToken = nextAccessToken;
  if (await canUseSecureStore()) {
    await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
    return;
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(REFRESH_KEY, refreshToken);
  }
}

export async function clearSession() {
  accessToken = null;
  if (await canUseSecureStore()) {
    await SecureStore.deleteItemAsync(REFRESH_KEY);
    return;
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(REFRESH_KEY);
  }
}
