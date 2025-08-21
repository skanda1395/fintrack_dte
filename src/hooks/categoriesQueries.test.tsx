import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useCategories,
  useAddCategory,
  useUpdateCategory,
} from './categoriesQueries';
import {
  fetchCategories,
  addCategory,
  updateCategory,
} from '@/services/categoriesService';
import { ReactNode } from 'react';
import { Category } from '@/interfaces/interfaces';

vi.mock('@/services/categoriesService', () => ({
  fetchCategories: vi.fn(),
  addCategory: vi.fn(),
  updateCategory: vi.fn(),
}));

const createTestWrapper = () => {
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

describe('Categories Hooks', () => {
  const mockUserId = 'testUser123';
  const mockCategories: Category[] = [
    { id: 'cat1', name: 'Food', spendingCurrentMonth: 50, userId: mockUserId },
    {
      id: 'cat2',
      name: 'Transport',
      spendingCurrentMonth: 25,
      userId: mockUserId,
    },
  ];
  const mockNewCategoryName = 'Groceries';
  const mockUpdatedCategory: Omit<Category, 'userId'> = {
    id: 'cat1',
    name: 'Food & Dining',
    spendingCurrentMonth: 75,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCategories', () => {
    it('should fetch categories when a userId is provided', async () => {
      vi.mocked(fetchCategories).mockResolvedValue(mockCategories);
      const { wrapper } = createTestWrapper();

      const { result } = renderHook(() => useCategories(mockUserId), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(fetchCategories).toHaveBeenCalledWith(mockUserId);
      expect(result.current.data).toEqual(mockCategories);
    });

    it('should not fetch categories when no userId is provided', () => {
      const { wrapper } = createTestWrapper();
      renderHook(() => useCategories(undefined), { wrapper });

      expect(fetchCategories).not.toHaveBeenCalled();
    });

    it('should handle fetch errors correctly', async () => {
      const mockError = new Error('Failed to load categories');
      vi.mocked(fetchCategories).mockRejectedValue(mockError);
      const { wrapper } = createTestWrapper();

      const { result } = renderHook(() => useCategories(mockUserId), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useAddCategory', () => {
    it('should call addCategory and invalidate the categories query on success', async () => {
      const mockAddedCategory = {
        id: 'new-id',
        name: mockNewCategoryName,
        spendingCurrentMonth: 0,
        userId: mockUserId,
      };
      vi.mocked(addCategory).mockResolvedValue(mockAddedCategory);
      const { wrapper, queryClient } = createTestWrapper();
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useAddCategory(), { wrapper });
      result.current.mutate({
        newCategoryName: mockNewCategoryName,
        userId: mockUserId,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(addCategory).toHaveBeenCalledWith(mockNewCategoryName, mockUserId);
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['categories', mockUserId],
      });
    });
  });

  describe('useUpdateCategory', () => {
    it('should call updateCategory and invalidate the categories query on success', async () => {
      vi.mocked(updateCategory).mockResolvedValue(mockUpdatedCategory);
      const { wrapper, queryClient } = createTestWrapper();
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateCategory(), { wrapper });
      result.current.mutate({
        updatedCategory: mockUpdatedCategory,
        userId: mockUserId,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(updateCategory).toHaveBeenCalledWith(
        mockUpdatedCategory,
        mockUserId
      );
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['categories', mockUserId],
      });
    });
  });
});
