import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { MedicineInput } from '@/types';

export const medicineKeys = { all: ['medicines'] as const };

export function useMedicines() {
  return useQuery({ queryKey: medicineKeys.all, queryFn: () => api.medicines.list() });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: medicineKeys.all });
}

export function useCreateMedicine() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (input: MedicineInput) => api.medicines.create(input), onSuccess: invalidate });
}

export function useUpdateMedicine() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: MedicineInput }) => api.medicines.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteMedicine() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => api.medicines.remove(id), onSuccess: invalidate });
}
