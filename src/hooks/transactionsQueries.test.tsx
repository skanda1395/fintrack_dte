import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useTransactions,
  useAddTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from './transactionsQueries';
import {
  fetchTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/services/transactionsService';
import { Transaction } from '@/interfaces/interfaces';

// Mock the service layer to isolate the hooks from real API calls during testing.
vi.mock('@/services/transactionsService', () => ({
  fetchTransactions: vi.fn(),
  addTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
}));

// A helper function to create a new QueryClient and a test wrapper for each test.
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Disable retries to prevent test flakiness and speed up tests.
        retry: false,
      },
    },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper, queryClient };
};

describe('Transaction Hooks', () => {
  const mockUserId = 'testUser123';
  const mockTransactions: Transaction[] = [
    {
      id: 'tx1',
      date: '2025-08-15',
      description: 'Groceries',
      amount: 50,
      type: 'expense',
      categoryId: 'cat1',
      userId: mockUserId,
    },
    {
      id: 'tx2',
      date: '2025-08-14',
      description: 'Salary',
      amount: 2000,
      type: 'income',
      categoryId: 'cat2',
      userId: mockUserId,
    },
  ];

  const mockNewTransaction: Omit<Transaction, 'id' | 'userId'> = {
    date: '2025-08-16',
    description: 'Coffee',
    amount: 5,
    type: 'expense',
    categoryId: 'cat1',
  };

  const mockUpdatedTransaction: Omit<Transaction, 'userId'> = {
    ...mockTransactions[0],
    amount: 60,
  };

  beforeEach(() => {
    // Reset mocks before each test to ensure a clean state.
    vi.clearAllMocks();
  });

  describe('useTransactions', () => {
    it('should fetch transactions when a userId is provided', async () => {
      // Mock the service to return our mock data.
      vi.mocked(fetchTransactions).mockResolvedValue(mockTransactions);
      const { wrapper } = createTestWrapper();

      // Render the hook.
      const { result } = renderHook(() => useTransactions(mockUserId), {
        wrapper,
      });

      // Wait for the query to be successful.
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Assert that the service was called and the data is correct.
      expect(fetchTransactions).toHaveBeenCalledWith(mockUserId);
      expect(result.current.data).toEqual(mockTransactions);
    });

    it('should not fetch transactions when no userId is provided', () => {
      const { wrapper } = createTestWrapper();

      // Render the hook with an undefined userId.
      renderHook(() => useTransactions(undefined), { wrapper });

      // Assert that the service function was never called.
      expect(fetchTransactions).not.toHaveBeenCalled();
    });
  });

  describe('useAddTransaction', () => {
    it('should call addTransaction and invalidate the transactions query on success', async () => {
      // Mock the service to return a successful response.
      vi.mocked(addTransaction).mockResolvedValue({
        id: 'new-tx',
        ...mockNewTransaction,
        userId: mockUserId,
      });
      const { wrapper, queryClient } = createTestWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      // Render the hook and trigger the mutation.
      const { result } = renderHook(() => useAddTransaction(), { wrapper });
      result.current.mutate({
        newTransaction: mockNewTransaction,
        userId: mockUserId,
      });

      // Wait for the mutation to be successful.
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Assert that the service was called and the query was invalidated.
      expect(addTransaction).toHaveBeenCalledWith(
        mockNewTransaction,
        mockUserId
      );
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['transactions', mockUserId],
      });
    });
  });

  describe('useUpdateTransaction', () => {
    it('should call updateTransaction and invalidate the transactions query on success', async () => {
      // Mock the service to return a successful response.
      vi.mocked(updateTransaction).mockResolvedValue(mockUpdatedTransaction);
      const { wrapper, queryClient } = createTestWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      // Render the hook and trigger the mutation.
      const { result } = renderHook(() => useUpdateTransaction(), { wrapper });
      result.current.mutate({
        updatedTransaction: mockUpdatedTransaction,
        userId: mockUserId,
      });

      // Wait for the mutation to be successful.
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Assert that the service was called and the query was invalidated.
      expect(updateTransaction).toHaveBeenCalledWith(
        mockUpdatedTransaction,
        mockUserId
      );
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['transactions', mockUserId],
      });
    });
  });

  describe('useDeleteTransaction', () => {
    it('should call deleteTransaction and invalidate the transactions query on success', async () => {
      // Mock the service to return a successful response.
      vi.mocked(deleteTransaction).mockResolvedValue(undefined);
      const { wrapper, queryClient } = createTestWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      // Render the hook and trigger the mutation.
      const { result } = renderHook(() => useDeleteTransaction(), { wrapper });
      result.current.mutate({
        transactionId: mockTransactions[0].id,
        userId: mockUserId,
      });

      // Wait for the mutation to be successful.
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Assert that the service was called and the query was invalidated.
      expect(deleteTransaction).toHaveBeenCalledWith(
        mockTransactions[0].id,
        mockUserId
      );
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['transactions', mockUserId],
      });
    });
  });
});
