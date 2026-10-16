import type { VisaService } from '@/types';

/** Mock cases still store seed slugs; live drafts store the Mongo id. */
export function isSameService(service: Pick<VisaService, 'id' | 'slug'>, visaServiceId: string) {
  return service.id === visaServiceId || service.slug === visaServiceId;
}
