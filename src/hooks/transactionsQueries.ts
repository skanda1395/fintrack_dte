import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/services/transactionsService';
import { Transaction } from '@/interfaces/interfaces';

export const useTransactions = (userId?: string) => {
  return useQuery<Transaction[], Error>({
    queryKey: ['transactions', userId],
    queryFn: () => fetchTransactions(userId!),
    enabled: !!userId,
  });
};

export const useAddTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      newTransaction,
      userId,
    }: {
      newTransaction: Omit<Transaction, 'id' | 'userId'>;
      userId: string;
    }) => addTransaction(newTransaction, userId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      updatedTransaction,
      userId,
    }: {
      updatedTransaction: Omit<Transaction, 'userId'>;
      userId: string;
    }) => updateTransaction(updatedTransaction, userId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      transactionId,
      userId,
    }: {
      transactionId: string;
      userId: string;
    }) => deleteTransaction(transactionId, userId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
    },
  });
};
