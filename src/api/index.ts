/**
 * Hybrid client API.
 *
 * Auth, profile, catalogue, applications, documents, and notifications call the
 * Express service. Payments stay on the in-memory mock until the payments phase.
 */

import { ApiError } from '@/api/errors';
import { apiRequest, postSession } from '@/api/http';
import { clearSession, getRefreshToken, persistSession } from '@/api/session';
import { withServiceDefaults } from '@/lib/service-defaults';
import type {
  AppNotification,
  Application,
  Country,
  Payment,
  PaymentStatus,
  User,
  VisaService,
} from '@/types';

const LATENCY_MS = 450;
const wait = <T,>(value: T, ms = LATENCY_MS) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

let idCounter = 100;
const nextId = (prefix: string) => `${prefix}-${++idCounter}`;
const now = () => new Date().toISOString();

export { ApiError } from '@/api/errors';

/* ------------------------------------------------------------------ payments mock */

const payments: Payment[] = [
  {
    id: 'p-1',
    applicationId: 'a-1',
    provider: 'international_gateway',
    amount: 95,
    currency: 'USD',
    status: 'paid',
    receiptNumber: 'RCPT-0001',
    createdAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
  },
];

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function latestMockPayment(applicationId: string) {
  return payments
    .filter((payment) => payment.applicationId === applicationId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

function withMockPaymentStatus(application: Application): Application {
  const payment = latestMockPayment(application.id);
  if (!payment) return application;
  return { ...application, paymentStatus: payment.status };
}

async function bindMockPayments() {
  try {
    const applications = await apiRequest<Application[]>('/applications', {}, true);
    const demo = applications.find((application) => application.referenceNumber === 'VC-2026-0001');
    if (!demo) return;
    for (const payment of payments) {
      if (payment.applicationId === 'a-1' || payment.receiptNumber === 'RCPT-0001') {
        payment.applicationId = demo.id;
      }
    }
  } catch {
    // Catalogue/auth still work if the applications list is unavailable.
  }
}

/* ------------------------------------------------------------------ auth (live API) */

async function storeSessionAndBindMock(session: {
  user: User;
  accessToken: string;
  refreshToken: string;
}) {
  await persistSession(session.accessToken, session.refreshToken);
  await bindMockPayments();
  return session.user;
}

export async function login(email: string, password: string): Promise<User> {
  const session = await postSession('/auth/login', { email, password });
  return storeSessionAndBindMock(session);
}

export async function register(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<User> {
  const session = await postSession('/auth/register', input);
  return storeSessionAndBindMock(session);
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
}

export async function restoreSession(): Promise<User | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;
  try {
    const session = await postSession('/auth/refresh', { refreshToken });
    return storeSessionAndBindMock(session);
  } catch {
    await clearSession();
    return null;
  }
}

export async function logout(): Promise<void> {
  const refreshToken = await getRefreshToken();
  try {
    if (refreshToken) {
      await apiRequest('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) });
    }
  } catch {
    // Always clear the local session even if the network call fails.
  }
  await clearSession();
}

/* ------------------------------------------------------------------ profile (live API) */

export async function updateProfile(
  _userId: string,
  patch: Pick<User, 'name' | 'phone'>,
): Promise<User> {
  return apiRequest<User>('/users/me', { method: 'PATCH', body: JSON.stringify(patch) }, true);
}

/* ------------------------------------------------------------------ catalogue (live API) */

export async function getCountries(): Promise<Country[]> {
  return apiRequest<Country[]>('/countries', {}, true);
}

export async function getVisaServices(countryId?: string): Promise<VisaService[]> {
  const query = countryId ? `?countryId=${encodeURIComponent(countryId)}` : '';
  const services = await apiRequest<VisaService[]>(`/visa-services${query}`, {}, true);
  return services.map(withServiceDefaults);
}

export async function getVisaService(id: string): Promise<VisaService> {
  const service = await apiRequest<VisaService>(`/visa-services/${encodeURIComponent(id)}`, {}, true);
  return withServiceDefaults(service);
}

/* ------------------------------------------------------------------ applications (live API) */

export async function listApplications(_userId: string): Promise<Application[]> {
  const applications = await apiRequest<Application[]>('/applications', {}, true);
  return applications.map(withMockPaymentStatus);
}

export async function getApplication(id: string, _userId: string): Promise<Application> {
  const application = await apiRequest<Application>(`/applications/${encodeURIComponent(id)}`, {}, true);
  return withMockPaymentStatus(application);
}

export async function saveDraft(input: {
  id?: string;
  userId: string;
  visaServiceId: string;
  formData: Record<string, string>;
}): Promise<Application> {
  if (input.id) {
    return apiRequest<Application>(
      `/applications/${encodeURIComponent(input.id)}`,
      { method: 'PATCH', body: JSON.stringify({ formData: input.formData }) },
      true,
    );
  }
  return apiRequest<Application>(
    '/applications',
    { method: 'POST', body: JSON.stringify({ visaServiceId: input.visaServiceId, formData: input.formData }) },
    true,
  );
}

export async function submitApplication(id: string, _userId: string): Promise<Application> {
  return apiRequest<Application>(`/applications/${encodeURIComponent(id)}/submit`, { method: 'POST' }, true);
}

export async function respondToInformationRequest(id: string, _userId: string): Promise<Application> {
  return apiRequest<Application>(`/applications/${encodeURIComponent(id)}/respond`, { method: 'POST' }, true);
}

export async function cancelApplication(id: string, _userId: string): Promise<Application> {
  return apiRequest<Application>(`/applications/${encodeURIComponent(id)}/cancel`, { method: 'POST' }, true);
}

export async function uploadDocument(input: {
  applicationId: string;
  userId: string;
  documentType: string;
  fileName: string;
  sizeBytes: number;
}): Promise<Application> {
  return apiRequest<Application>(
    `/applications/${encodeURIComponent(input.applicationId)}/documents`,
    {
      method: 'POST',
      body: JSON.stringify({
        documentType: input.documentType,
        fileName: input.fileName,
        sizeBytes: input.sizeBytes,
      }),
    },
    true,
  );
}

export async function simulateStaffUpdate(id: string, _userId: string): Promise<Application> {
  return apiRequest<Application>(
    `/applications/${encodeURIComponent(id)}/simulate-staff`,
    { method: 'POST' },
    true,
  );
}

/* ------------------------------------------------------------------ payments (mock) */

export async function getPaymentForApplication(
  applicationId: string,
  userId: string,
): Promise<Payment | null> {
  await getApplication(applicationId, userId);
  const latest = latestMockPayment(applicationId);
  return wait(latest ? clone(latest) : null);
}

/** `POST /payments/checkout`: the backend creates a checkout and the app opens the hosted page. */
export async function createCheckout(input: {
  applicationId: string;
  userId: string;
  provider: Payment['provider'];
}): Promise<Payment> {
  const application = await getApplication(input.applicationId, input.userId);
  if (application.status === 'draft') throw new ApiError('Submit the application before paying.');
  if (application.paymentStatus === 'paid') throw new ApiError('This application is already paid.');
  const pending = payments
    .filter((payment) => payment.applicationId === input.applicationId && payment.status === 'pending')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  if (pending) return wait(clone(pending));
  const service = await getVisaService(application.visaServiceId);
  const payment: Payment = {
    id: nextId('p'),
    applicationId: input.applicationId,
    provider: input.provider,
    amount: service.fee,
    currency: service.currency,
    status: 'pending',
    receiptNumber: null,
    createdAt: now(),
  };
  payments.push(payment);
  return wait(clone(payment));
}

/**
 * Stands in for the provider's signed webhook (`POST /webhooks/payments/:provider`).
 * Idempotent: replaying the same outcome has no further effect. The app never treats a
 * success screen as proof of payment; it re-reads the status from the server afterwards.
 */
export async function simulateProviderWebhook(
  paymentId: string,
  outcome: Extract<PaymentStatus, 'paid' | 'failed'>,
): Promise<void> {
  const payment = payments.find((item) => item.id === paymentId);
  if (!payment) throw new ApiError('Payment not found.');
  if (payment.status !== 'pending') return wait(undefined);
  payment.status = outcome;
  if (outcome === 'paid') {
    payment.receiptNumber = `RCPT-${String(payments.filter((item) => item.receiptNumber).length + 1).padStart(4, '0')}`;
  }
  return wait(undefined, 1200);
}

/* ------------------------------------------------------------------ notifications (live API) */

export async function listNotifications(_userId: string): Promise<AppNotification[]> {
  return apiRequest<AppNotification[]>('/notifications', {}, true);
}

export async function markNotificationRead(id: string, _userId: string): Promise<void> {
  await apiRequest(`/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' }, true);
}

export async function markAllNotificationsRead(_userId: string): Promise<void> {
  await apiRequest('/notifications/read-all', { method: 'POST' }, true);
}
