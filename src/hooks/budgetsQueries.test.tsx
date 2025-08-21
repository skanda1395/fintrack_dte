import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBudgets, useAddBudget, useUpdateBudget } from './budgetsQueries';
import {
  fetchBudgets,
  addBudget,
  updateBudget,
} from '@/services/budgetsService';
import { ReactNode } from 'react';

vi.mock('@/services/budgetsService', () => ({
  fetchBudgets: vi.fn(),
  addBudget: vi.fn(),
  updateBudget: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper, queryClient };
};

describe('Budget Hooks', () => {
  const mockUserId = 'user123';
  const mockBudgets = [
    {
      id: 'b1',
      categoryId: 'cat1',
      amount: 100,
      period: 'monthly',
      userId: mockUserId,
    },
    {
      id: 'b2',
      categoryId: 'cat2',
      amount: 200,
      period: 'weekly',
      userId: mockUserId,
    },
  ];
  const mockNewBudget = { categoryId: 'cat3', amount: 50, period: 'monthly' };
  const mockUpdatedBudget = { ...mockBudgets[0], amount: 150 };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useBudgets', () => {
    it('should fetch budgets when a userId is provided', async () => {
      vi.mocked(fetchBudgets).mockResolvedValue(mockBudgets);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useBudgets(mockUserId), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(fetchBudgets).toHaveBeenCalledWith(mockUserId);
      expect(result.current.data).toEqual(mockBudgets);
    });

    it('should not fetch budgets when no userId is provided', () => {
      const { wrapper } = createWrapper();
      renderHook(() => useBudgets(undefined), { wrapper });

      expect(fetchBudgets).not.toHaveBeenCalled();
    });

    it('should handle fetch error correctly', async () => {
      const mockError = new Error('Failed to fetch budgets');
      vi.mocked(fetchBudgets).mockRejectedValue(mockError);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useBudgets(mockUserId), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useAddBudget', () => {
    it('should call addBudget and invalidate the budgets query on success', async () => {
      vi.mocked(addBudget).mockResolvedValue({
        id: 'b3',
        ...mockNewBudget,
        userId: mockUserId,
      });
      const { wrapper, queryClient } = createWrapper();

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useAddBudget(), { wrapper });

      result.current.mutate({ newBudget: mockNewBudget, userId: mockUserId });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(addBudget).toHaveBeenCalledWith(mockNewBudget, mockUserId);
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['budgets'],
      });
    });
  });

  describe('useUpdateBudget', () => {
    it('should call updateBudget and invalidate the budgets query on success', async () => {
      vi.mocked(updateBudget).mockResolvedValue(mockUpdatedBudget);
      const { wrapper, queryClient } = createWrapper();

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateBudget(), { wrapper });

      result.current.mutate({
        updatedBudget: mockUpdatedBudget,
        userId: mockUserId,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(updateBudget).toHaveBeenCalledWith(mockUpdatedBudget, mockUserId);
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['budgets'],
      });
    });
  });
});
