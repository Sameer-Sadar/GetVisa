import { z } from 'zod';

import type { FormField } from '@/types';

export type ApplicationFormValues = Record<string, string>;

function isRealDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function fieldSchema(field: FormField) {
  const required = z.string().trim().min(1, `${field.label} is required.`);
  let base: z.ZodType<string>;

  switch (field.type) {
    case 'date':
      base = required.refine(isRealDate, 'Use the format YYYY-MM-DD, e.g. 2026-12-31.');
      break;
    case 'number':
      base = required.regex(/^\d{1,3}$/, 'Enter a whole number.');
      break;
    case 'select':
      base = required.refine(
        (value) => field.options?.includes(value) ?? false,
        'Choose one of the options.',
      );
      break;
    default:
      base = required.max(field.type === 'textarea' ? 1000 : 120, 'This is too long.');
  }

  if (field.required) return base;
  // Optional: an empty value is fine, otherwise it must still be valid.
  return z.union([z.literal(''), base]);
}

/** Builds the Zod schema for a service's configurable application form. */
export function buildFormSchema(fields: FormField[]) {
  const shape: Record<string, z.ZodType<string>> = {};
  for (const field of fields) shape[field.key] = fieldSchema(field);
  return z.object(shape);
}

export function emptyFormValues(fields: FormField[], initial?: Record<string, string>): ApplicationFormValues {
  const values: ApplicationFormValues = {};
  for (const field of fields) values[field.key] = initial?.[field.key] ?? '';
  return values;
}
