import type { ThemeColor } from '@/constants/theme';
import type { ApplicationStatus, DocumentReviewStatus, PaymentStatus } from '@/types';

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export const toneColors: Record<Tone, { fg: ThemeColor; bg: ThemeColor }> = {
  neutral: { fg: 'textSecondary', bg: 'backgroundElement' },
  info: { fg: 'info', bg: 'infoSoft' },
  success: { fg: 'success', bg: 'successSoft' },
  warning: { fg: 'warning', bg: 'warningSoft' },
  danger: { fg: 'danger', bg: 'dangerSoft' },
};

export const applicationStatusMeta: Record<ApplicationStatus, { label: string; tone: Tone }> = {
  draft: { label: 'Draft', tone: 'neutral' },
  submitted: { label: 'Submitted', tone: 'info' },
  under_review: { label: 'Under review', tone: 'info' },
  additional_info_required: { label: 'Action needed', tone: 'warning' },
  consultancy_completed: { label: 'Completed', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

export const paymentStatusMeta: Record<PaymentStatus, { label: string; tone: Tone }> = {
  unpaid: { label: 'Unpaid', tone: 'neutral' },
  pending: { label: 'Payment pending', tone: 'warning' },
  paid: { label: 'Paid', tone: 'success' },
  failed: { label: 'Payment failed', tone: 'danger' },
  refunded: { label: 'Refunded', tone: 'neutral' },
};

export const documentStatusMeta: Record<DocumentReviewStatus, { label: string; tone: Tone }> = {
  pending: { label: 'Awaiting review', tone: 'info' },
  approved: { label: 'Approved', tone: 'success' },
  replacement_requested: { label: 'Replace file', tone: 'warning' },
};

export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string) {
  return `${formatDate(iso)}, ${new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
