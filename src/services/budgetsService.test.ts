import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchBudgets,
  addBudget,
  updateBudget,
} from '@/services/budgetsService';
import { apiService, API_ENDPOINTS } from '@/config/api';

vi.mock('@/config/api');

interface Budget {
  id: string;
  categoryId: string;
  limit: number;
  spent: number;
  userId: string;
}

const mockApiService = apiService as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe('budgetsService', () => {
  const mockUserId = 'user123';
  const mockBudgets: Budget[] = [
    { id: '1', categoryId: 'cat1', limit: 300, spent: 50, userId: mockUserId },
    {
      id: '2',
      categoryId: 'cat2',
      limit: 1500,
      spent: 1200,
      userId: mockUserId,
    },
  ];
  const newMockBudget = { categoryId: 'cat3', limit: 500, spent: 0 };
  const updatedMockBudget = {
    id: '1',
    categoryId: 'cat1_updated',
    limit: 350,
    spent: 60,
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('fetchBudgets', () => {
    it('should successfully fetch budgets for a given user ID', async () => {
      mockApiService.get.mockResolvedValueOnce(mockBudgets);

      const budgets = await fetchBudgets(mockUserId);
      expect(budgets).toEqual(mockBudgets);

      expect(mockApiService.get).toHaveBeenCalledWith(API_ENDPOINTS.BUDGETS, {
        userId: mockUserId,
      });
    });

    it('should return an empty array if no budgets are found', async () => {
      mockApiService.get.mockResolvedValueOnce(null);

      const budgets = await fetchBudgets(mockUserId);
      expect(budgets).toEqual([]);

      expect(mockApiService.get).toHaveBeenCalledWith(API_ENDPOINTS.BUDGETS, {
        userId: mockUserId,
      });
    });

    it('should throw an error if the user ID is missing', async () => {
      await expect(fetchBudgets('')).rejects.toThrow(
        'User ID is required to fetch budgets.'
      );
    });
  });

  describe('addBudget', () => {
    const newBudgetResponse = {
      ...newMockBudget,
      id: '3',
      userId: mockUserId,
    };

    it('should successfully add a new budget', async () => {
      mockApiService.post.mockResolvedValueOnce(newBudgetResponse);

      const result = await addBudget(newMockBudget, mockUserId);
      expect(result).toEqual(newBudgetResponse);

      expect(mockApiService.post).toHaveBeenCalledWith(API_ENDPOINTS.BUDGETS, {
        ...newMockBudget,
        userId: mockUserId,
      });
    });

    it('should throw an error if the add operation fails', async () => {
      mockApiService.post.mockResolvedValueOnce(null);

      await expect(addBudget(newMockBudget, mockUserId)).rejects.toThrow(
        'Failed to add budget'
      );
    });

    it('should throw an error if user ID is not provided', async () => {
      await expect(addBudget(newMockBudget, '')).rejects.toThrow(
        'User ID is required to add a budget.'
      );
    });
  });

  describe('updateBudget', () => {
    const finalUpdatedBudget = { ...updatedMockBudget, userId: mockUserId };

    it('should successfully update an existing budget', async () => {
      mockApiService.put.mockResolvedValueOnce(finalUpdatedBudget);

      const result = await updateBudget(updatedMockBudget, mockUserId);
      expect(result).toEqual(finalUpdatedBudget);

      expect(mockApiService.put).toHaveBeenCalledWith(
        API_ENDPOINTS.BUDGETS,
        updatedMockBudget.id,
        { ...updatedMockBudget, userId: mockUserId }
      );
    });

    it('should throw an error if the update operation fails', async () => {
      mockApiService.put.mockResolvedValueOnce(null);

      await expect(updateBudget(updatedMockBudget, mockUserId)).rejects.toThrow(
        'Failed to update budget'
      );
    });

    it('should throw an error if user ID is not provided', async () => {
      await expect(updateBudget(updatedMockBudget, '')).rejects.toThrow(
        'User ID is required to update a budget.'
      );
    });
  });
});
