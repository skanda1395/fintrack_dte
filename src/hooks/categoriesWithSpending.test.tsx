import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCategoriesWithSpending } from './useCategoriesWithSpending';
import { useCategories } from './categoriesQueries';
import { useTransactions } from './transactionsQueries';
import { Category, Transaction } from '@/interfaces/interfaces';
import { RefetchOptions, QueryObserverResult } from '@tanstack/react-query';
import { RefetchOptions, QueryObserverResult } from '@tanstack/react-query';
import { RefetchOptions, QueryObserverResult } from '@tanstack/react-query';
import { RefetchOptions, QueryObserverResult } from '@tanstack/react-query';
import { RefetchOptions, QueryObserverResult } from '@tanstack/react-query';
import { RefetchOptions, QueryObserverResult } from '@tanstack/react-query';
import { RefetchOptions, QueryObserverResult } from '@tanstack/react-query';
import { RefetchOptions, QueryObserverResult } from '@tanstack/react-query';

vi.mock('./categoriesQueries', () => ({
  useCategories: vi.fn(),
}));

vi.mock('./transactionsQueries', () => ({
  useTransactions: vi.fn(),
}));

describe('useCategoriesWithSpending', () => {
  const mockUserId = 'testUser123';

  const now = new Date();
  const currentMonthDate = now.toISOString().split('T')[0];
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 15)
    .toISOString()
    .split('T')[0];

  const mockCategories: Category[] = [
    { id: 'food', name: 'Food', spendingCurrentMonth: 0, userId: mockUserId },
    {
      id: 'entertainment',
      name: 'Entertainment',
      spendingCurrentMonth: 0,
      userId: mockUserId,
    },
    {
      id: 'transport',
      name: 'Transport',
      spendingCurrentMonth: 0,
      userId: mockUserId,
    },
  ];

  const mockTransactions: Transaction[] = [
    {
      id: 'tx1',
      date: currentMonthDate,
      description: 'Groceries',
      amount: 50,
      type: 'expense',
      categoryId: 'food',
      userId: mockUserId,
    },
    {
      id: 'tx2',
      date: currentMonthDate,
      description: 'Movie',
      amount: 25,
      type: 'expense',
      categoryId: 'entertainment',
      userId: mockUserId,
    },
    {
      id: 'tx3',
      date: currentMonthDate,
      description: 'Gas',
      amount: 30,
      type: 'expense',
      categoryId: 'transport',
      userId: mockUserId,
    },
    {
      id: 'tx4',
      date: currentMonthDate,
      description: 'Dinner',
      amount: 75,
      type: 'expense',
      categoryId: 'food',
      userId: mockUserId,
    },
    {
      id: 'tx5',
      date: previousMonthDate,
      description: 'Old expense',
      amount: 100,
      type: 'expense',
      categoryId: 'food',
      userId: mockUserId,
    },
    {
      id: 'tx6',
      date: currentMonthDate,
      description: 'Paycheck',
      amount: 1500,
      type: 'income',
      categoryId: 'income',
      userId: mockUserId,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should correctly calculate current month spending for each category', async () => {
    vi.mocked(useCategories).mockReturnValue({
      data: mockCategories,
      isLoading: false,
      isError: false,
      error: null,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: false,
      isPlaceholderData: false,
      status: 'error',
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: false,
      isFetchedAfterMount: false,
      isFetching: false,
      isInitialLoading: false,
      isPaused: false,
      isRefetching: false,
      isStale: false,
      isEnabled: false,
      refetch: function (
        options?: RefetchOptions
      ): Promise<QueryObserverResult<Category[], Error>> {
        throw new Error('Function not implemented.');
      },
      fetchStatus: 'fetching',
      promise: undefined,
    });
    vi.mocked(useTransactions).mockReturnValue({
      data: mockTransactions,
      isLoading: false,
      isError: false,
      error: null,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: false,
      isPlaceholderData: false,
      status: 'error',
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: false,
      isFetchedAfterMount: false,
      isFetching: false,
      isInitialLoading: false,
      isPaused: false,
      isRefetching: false,
      isStale: false,
      isEnabled: false,
      refetch: function (
        options?: RefetchOptions
      ): Promise<QueryObserverResult<Transaction[], Error>> {
        throw new Error('Function not implemented.');
      },
      fetchStatus: 'fetching',
      promise: undefined,
    });

    const { result } = renderHook(() => useCategoriesWithSpending(mockUserId));

    await waitFor(() => {
      expect(result.current.data).toEqual([
        { ...mockCategories[0], spendingCurrentMonth: 125 },
        { ...mockCategories[1], spendingCurrentMonth: 25 },
        { ...mockCategories[2], spendingCurrentMonth: 30 },
      ]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
    });
  });

  it('should return empty array and false loading/error when no data is available', () => {
    vi.mocked(useCategories).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: false,
      isPlaceholderData: false,
      status: 'error',
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: false,
      isFetchedAfterMount: false,
      isFetching: false,
      isInitialLoading: false,
      isPaused: false,
      isRefetching: false,
      isStale: false,
      isEnabled: false,
      refetch: function (
        options?: RefetchOptions
      ): Promise<QueryObserverResult<Category[], Error>> {
        throw new Error('Function not implemented.');
      },
      fetchStatus: 'fetching',
      promise: undefined,
    });
    vi.mocked(useTransactions).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: false,
      isPlaceholderData: false,
      status: 'error',
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: false,
      isFetchedAfterMount: false,
      isFetching: false,
      isInitialLoading: false,
      isPaused: false,
      isRefetching: false,
      isStale: false,
      isEnabled: false,
      refetch: function (
        options?: RefetchOptions
      ): Promise<QueryObserverResult<Transaction[], Error>> {
        throw new Error('Function not implemented.');
      },
      fetchStatus: 'fetching',
      promise: undefined,
    });

    const { result } = renderHook(() => useCategoriesWithSpending(mockUserId));

    expect(result.current.data).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('should return isLoading as true if either a dependency is loading', () => {
    vi.mocked(useCategories).mockReturnValue({
      data: mockCategories,
      isLoading: false,
      isError: false,
      error: null,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: false,
      isPlaceholderData: false,
      status: 'error',
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: false,
      isFetchedAfterMount: false,
      isFetching: false,
      isInitialLoading: false,
      isPaused: false,
      isRefetching: false,
      isStale: false,
      isEnabled: false,
      refetch: function (
        options?: RefetchOptions
      ): Promise<QueryObserverResult<Category[], Error>> {
        throw new Error('Function not implemented.');
      },
      fetchStatus: 'fetching',
      promise: undefined,
    });
    vi.mocked(useTransactions).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: false,
      isPlaceholderData: false,
      status: 'error',
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: false,
      isFetchedAfterMount: false,
      isFetching: false,
      isInitialLoading: false,
      isPaused: false,
      isRefetching: false,
      isStale: false,
      isEnabled: false,
      refetch: function (
        options?: RefetchOptions
      ): Promise<QueryObserverResult<Transaction[], Error>> {
        throw new Error('Function not implemented.');
      },
      fetchStatus: 'fetching',
      promise: undefined,
    });

    const { result } = renderHook(() => useCategoriesWithSpending(mockUserId));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it('should return isError as true if either a dependency has an error', () => {
    const mockError = new Error('Failed to fetch transactions');
    vi.mocked(useCategories).mockReturnValue({
      data: mockCategories,
      isLoading: false,
      isError: false,
      error: null,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: false,
      isPlaceholderData: false,
      status: 'error',
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: false,
      isFetchedAfterMount: false,
      isFetching: false,
      isInitialLoading: false,
      isPaused: false,
      isRefetching: false,
      isStale: false,
      isEnabled: false,
      refetch: function (
        options?: RefetchOptions
      ): Promise<QueryObserverResult<Category[], Error>> {
        throw new Error('Function not implemented.');
      },
      fetchStatus: 'fetching',
      promise: undefined,
    });
    vi.mocked(useTransactions).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: mockError,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: false,
      isPlaceholderData: false,
      status: 'error',
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: false,
      isFetchedAfterMount: false,
      isFetching: false,
      isInitialLoading: false,
      isPaused: false,
      isRefetching: false,
      isStale: false,
      isEnabled: false,
      refetch: function (
        options?: RefetchOptions
      ): Promise<QueryObserverResult<Transaction[], Error>> {
        throw new Error('Function not implemented.');
      },
      fetchStatus: 'fetching',
      promise: undefined,
    });

    const { result } = renderHook(() => useCategoriesWithSpending(mockUserId));

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(mockError);
    expect(result.current.isLoading).toBe(false);
  });
});
