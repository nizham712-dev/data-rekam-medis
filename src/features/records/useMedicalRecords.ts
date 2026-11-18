import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { dashboardKeys } from '@/features/dashboard/useDashboard';
import { patientKeys } from '@/features/patients/usePatients';
import type { PrescriptionInput, RecordStatus, SoapInput, VitalSigns } from '@/types';

export const recordKeys = {
  all: ['medical-records'] as const,
  list: (status?: RecordStatus, patientId?: string) =>
    [...recordKeys.all, 'list', status ?? 'all', patientId ?? 'all'] as const,
  detail: (id: string) => [...recordKeys.all, 'detail', id] as const,
};

export function useMedicalRecords(filter?: { status?: RecordStatus; patientId?: string }) {
  return useQuery({
    queryKey: recordKeys.list(filter?.status, filter?.patientId),
    queryFn: () => api.records.list(filter),
  });
}

export function useMedicalRecord(id: string | undefined) {
  return useQuery({
    queryKey: recordKeys.detail(id ?? ''),
    queryFn: () => api.records.get(id ?? ''),
    enabled: Boolean(id),
  });
}

function useRecordInvalidation() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: recordKeys.all });
    void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    void queryClient.invalidateQueries({ queryKey: patientKeys.all });
  };
}

export function useCreateQueue() {
  const invalidate = useRecordInvalidation();
  return useMutation({
    mutationFn: (input: { patientId: string; doctorId: string; vitalSigns: VitalSigns }) =>
      api.records.createQueue(input),
    onSuccess: invalidate,
  });
}

export function useUpdateTriage() {
  const invalidate = useRecordInvalidation();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { vitalSigns: VitalSigns; status: RecordStatus } }) =>
      api.records.updateTriage(id, input),
    onSuccess: invalidate,
  });
}

export function useSaveSoap() {
  const invalidate = useRecordInvalidation();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SoapInput }) => api.records.saveSoap(id, input),
    onSuccess: invalidate,
  });
}

export function useAddPrescription(recordId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PrescriptionInput) => api.prescriptions.add(recordId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recordKeys.detail(recordId) });
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useRemovePrescription(recordId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.prescriptions.remove(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: recordKeys.detail(recordId) }),
  });
}
