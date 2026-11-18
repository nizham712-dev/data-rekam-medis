import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { dashboardKeys } from '@/features/dashboard/useDashboard';
import type { PatientInput } from '@/types';

export const patientKeys = {
  all: ['patients'] as const,
  list: (search?: string) => [...patientKeys.all, 'list', search ?? ''] as const,
  detail: (id: string) => [...patientKeys.all, 'detail', id] as const,
};

export function usePatients(search = '') {
  return useQuery({ queryKey: patientKeys.list(search), queryFn: () => api.patients.list(search) });
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: patientKeys.detail(id ?? ''),
    queryFn: () => api.patients.get(id ?? ''),
    enabled: Boolean(id),
  });
}

function usePatientMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: patientKeys.all });
    void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  };
  return {
    create: useMutation({ mutationFn: (input: PatientInput) => api.patients.create(input), onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, input }: { id: string; input: PatientInput }) => api.patients.update(id, input),
      onSuccess: invalidate,
    }),
  };
}

export function useCreatePatient() {
  return usePatientMutations().create;
}

export function useUpdatePatient() {
  return usePatientMutations().update;
}
