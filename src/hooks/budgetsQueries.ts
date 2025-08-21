import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchBudgets,
  addBudget,
  updateBudget,
} from '@/services/budgetsService';
import { Budget } from '@/interfaces/interfaces';

export const useBudgets = (userId?: string) => {
  return useQuery<Budget[], Error>({
    queryKey: ['budgets', userId],
    queryFn: () => fetchBudgets(userId!),
    enabled: !!userId,
  });
};

export const useAddBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      newBudget,
      userId,
    }: {
      newBudget: Omit<Budget, 'id' | 'userId'>;
      userId: string;
    }) => addBudget(newBudget, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      updatedBudget,
      userId,
    }: {
      updatedBudget: Omit<Budget, 'userId'>;
      userId: string;
    }) => updateBudget(updatedBudget, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
};
