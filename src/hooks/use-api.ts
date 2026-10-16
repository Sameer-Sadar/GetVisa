import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

import * as api from '@/api';
import { useCurrentUser } from '@/state/auth';

const liveCatalogue = {
  staleTime: 0,
  refetchOnMount: 'always' as const,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  refetchInterval: 10_000,
};

export const queryKeys = {
  countries: ['countries'] as const,
  services: (countryId?: string) => ['services', countryId ?? 'all'] as const,
  service: (id: string) => ['service', id] as const,
  applications: (userId: string) => ['applications', userId] as const,
  application: (userId: string, id: string) => ['application', userId, id] as const,
  payment: (userId: string, applicationId: string) => ['payment', userId, applicationId] as const,
  notifications: (userId: string) => ['notifications', userId] as const,
};

export function useCountries() {
  const query = useQuery({ queryKey: queryKeys.countries, queryFn: api.getCountries, ...liveCatalogue });
  useFocusEffect(
    useCallback(() => {
      void query.refetch();
    }, [query.refetch]),
  );
  return query;
}

export function useServices(countryId?: string) {
  const query = useQuery({
    queryKey: queryKeys.services(countryId),
    queryFn: () => api.getVisaServices(countryId),
    ...liveCatalogue,
  });
  useFocusEffect(
    useCallback(() => {
      void query.refetch();
    }, [query.refetch]),
  );
  return query;
}

export function useService(id: string) {
  const query = useQuery({
    queryKey: queryKeys.service(id),
    queryFn: () => api.getVisaService(id),
    ...liveCatalogue,
    enabled: id.length > 0,
  });
  useFocusEffect(
    useCallback(() => {
      if (id) void query.refetch();
    }, [id, query.refetch]),
  );
  return query;
}

export function useApplications() {
  const user = useCurrentUser();
  return useQuery({
    queryKey: queryKeys.applications(user.id),
    queryFn: () => api.listApplications(user.id),
  });
}

export function useApplication(id: string | undefined) {
  const user = useCurrentUser();
  return useQuery({
    queryKey: queryKeys.application(user.id, id ?? ''),
    queryFn: () => api.getApplication(id as string, user.id),
    enabled: !!id,
  });
}

export function usePayment(applicationId: string) {
  const user = useCurrentUser();
  return useQuery({
    queryKey: queryKeys.payment(user.id, applicationId),
    queryFn: () => api.getPaymentForApplication(applicationId, user.id),
  });
}

export function useNotifications() {
  const user = useCurrentUser();
  return useQuery({
    queryKey: queryKeys.notifications(user.id),
    queryFn: () => api.listNotifications(user.id),
  });
}
