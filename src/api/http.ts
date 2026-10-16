import { getApiBaseUrl } from '@/api/config';
import { ApiError } from '@/api/errors';
import { clearSession, getAccessToken, getRefreshToken, persistSession } from '@/api/session';
import type { User } from '@/types';

type SessionPayload = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) return false;
      try {
        const session = await apiRequest<SessionPayload>(
          '/auth/refresh',
          { method: 'POST', body: JSON.stringify({ refreshToken }) },
          false,
          true,
        );
        await persistSession(session.accessToken, session.refreshToken);
        return true;
      } catch {
        await clearSession();
        return false;
      }
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  withAuth = false,
  skipRetry = false,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (withAuth) {
    const token = getAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${getApiBaseUrl()}${path}`;
  let response: Response;
  try {
    response = await fetch(url, { ...init, headers });
  } catch {
    throw new ApiError(
      `Cannot reach the API at ${getApiBaseUrl()}. On a phone, use the same Wi‑Fi as this PC, keep the API running, and allow port 4000 in Windows Firewall.`,
    );
  }
  if (response.status === 204) return undefined as T;

  const body = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) {
    if (response.status === 401 && withAuth && !skipRetry && (await refreshSession())) {
      return apiRequest<T>(path, init, withAuth, true);
    }
    throw new ApiError(typeof body.error === 'string' ? body.error : 'Request failed.');
  }
  return body;
}

export function postSession(path: string, body: unknown) {
  return apiRequest<SessionPayload>(path, { method: 'POST', body: JSON.stringify(body) });
}
