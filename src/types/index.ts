/** Domain types, mirroring the data models in the technical specification. */

export type Role = 'applicant' | 'consultant' | 'reviewer' | 'administrator';

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
};

export type Country = {
  id: string;
  name: string;
  code: string;
  flag: string;
  active: boolean;
};

export type FormFieldType = 'text' | 'textarea' | 'date' | 'select' | 'number';

export type FormField = {
  key: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  /** Marks fields holding sensitive personal data (e.g. passport details). */
  sensitive?: boolean;
};

export type ChecklistItem = {
  type: string;
  label: string;
  required: boolean;
  hint?: string;
};

export type VisaService = {
  id: string;
  countryId: string;
  /** Stable seed key (e.g. `s-uk-visit`) so mock cases can resolve a live service. */
  slug?: string;
  serviceName: string;
  summary: string;
  eligibilityInfo: string[];
  fee: number;
  currency: string;
  processingTime: string;
  checklist: ChecklistItem[];
  formFields: FormField[];
  active: boolean;
};

/** Consultancy workflow status. This is not an official visa decision. */
export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'additional_info_required'
  | 'consultancy_completed'
  | 'rejected'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';

export type DocumentReviewStatus = 'pending' | 'approved' | 'replacement_requested';

export type ApplicationDocument = {
  id: string;
  documentType: string;
  fileName: string;
  sizeBytes: number;
  uploadedAt: string;
  reviewStatus: DocumentReviewStatus;
  reviewNote?: string;
};

export type TimelineEvent = {
  id: string;
  at: string;
  title: string;
  detail?: string;
};

export type Application = {
  id: string;
  referenceNumber: string | null;
  applicantId: string;
  visaServiceId: string;
  status: ApplicationStatus;
  paymentStatus: PaymentStatus;
  formData: Record<string, string>;
  documents: ApplicationDocument[];
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
};

export type Payment = {
  id: string;
  applicationId: string;
  provider: 'local_gateway' | 'international_gateway';
  amount: number;
  currency: string;
  status: PaymentStatus;
  receiptNumber: string | null;
  createdAt: string;
};

export type NotificationType = 'status' | 'document' | 'payment' | 'info';

export type AppNotification = {
  id: string;
  userId: string;
  applicationId: string | null;
  type: NotificationType;
  message: string;
  createdAt: string;
  readAt: string | null;
};
