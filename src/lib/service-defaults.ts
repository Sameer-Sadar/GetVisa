import type { ChecklistItem, FormField, VisaService } from '@/types';

const DEFAULT_ELIGIBILITY = [
  'Valid passport with at least 6 months remaining',
  'Proof of funds for the trip',
  'Clear purpose of travel',
];

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { type: 'passport', label: 'Passport bio page', required: true, hint: 'Clear scan, all four corners visible' },
  { type: 'photo', label: 'Passport-size photograph', required: true, hint: 'White background, taken in the last 6 months' },
  { type: 'bank', label: 'Bank statements (last 6 months)', required: true },
];

const DEFAULT_FORM_FIELDS: FormField[] = [
  { key: 'fullName', label: 'Full name (as in passport)', type: 'text', required: true, placeholder: 'Given names and surname' },
  { key: 'nationality', label: 'Nationality', type: 'text', required: true, placeholder: 'e.g. Pakistani' },
  { key: 'dateOfBirth', label: 'Date of birth', type: 'date', required: true, placeholder: 'YYYY-MM-DD' },
  {
    key: 'passportNumber',
    label: 'Passport number',
    type: 'text',
    required: true,
    placeholder: 'As printed on your passport',
    sensitive: true,
  },
  {
    key: 'passportExpiry',
    label: 'Passport expiry date',
    type: 'date',
    required: true,
    placeholder: 'YYYY-MM-DD',
    sensitive: true,
  },
  { key: 'travelDate', label: 'Planned travel date', type: 'date', required: true, placeholder: 'YYYY-MM-DD' },
  { key: 'stayDuration', label: 'Length of stay (days)', type: 'number', required: true, placeholder: 'e.g. 14' },
  {
    key: 'purpose',
    label: 'Purpose of visit',
    type: 'textarea',
    required: true,
    placeholder: 'Tourism, family visit, Umrah, business…',
  },
];

/** Admin-created services may have empty form/checklist; always give the applicant a usable form. */
export function withServiceDefaults(service: VisaService): VisaService {
  return {
    ...service,
    eligibilityInfo: service.eligibilityInfo?.length ? service.eligibilityInfo : DEFAULT_ELIGIBILITY,
    checklist: service.checklist?.length ? service.checklist : DEFAULT_CHECKLIST,
    formFields: service.formFields?.length ? service.formFields : DEFAULT_FORM_FIELDS,
  };
}
