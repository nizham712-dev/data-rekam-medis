import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ProfileInput, UserRole } from '@/types';

export const userKeys = { all: ['profiles'] as const };

export function useUsers() {
  return useQuery({ queryKey: userKeys.all, queryFn: () => api.profiles.list() });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProfileInput & { role?: UserRole } }) =>
      api.profiles.update(id, input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}
