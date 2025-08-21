import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Budget } from '@/interfaces/interfaces';
import { fetchBudgets, addBudget, updateBudget } from './budgetsService';

vi.mock('@/config/api', () => ({
  API_ENDPOINTS: {
    BUDGETS: 'http://localhost:3000/budgets',
  },
}));

describe('Budgets API Functions', () => {
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

  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    fetchSpy = vi.spyOn(global, 'fetch');
  });

  describe('fetchBudgets', () => {
    it('should successfully fetch budgets for a given user ID', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBudgets),
      } as Response);

      const budgets = await fetchBudgets(mockUserId);
      expect(budgets).toEqual(mockBudgets);

      expect(fetchSpy).toHaveBeenCalledWith(
        `http://localhost:3000/budgets?userId=${mockUserId}`
      );
    });

    it('should throw an error if the fetch response is not ok', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(fetchBudgets(mockUserId)).rejects.toThrow(
        'Failed to fetch budgets'
      );
    });

    it('should throw an error if user ID is not provided', async () => {
      await expect(fetchBudgets('')).rejects.toThrow(
        'User ID is required to fetch budgets.'
      );
      await expect(fetchBudgets(null as any)).rejects.toThrow(
        'User ID is required to fetch budgets.'
      );
    });
  });

  describe('addBudget', () => {
    it('should successfully add a new budget', async () => {
      const addedBudget = { id: '3', ...newMockBudget, userId: mockUserId };
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(addedBudget),
      } as Response);

      const result = await addBudget(newMockBudget, mockUserId);
      expect(result).toEqual(addedBudget);

      expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3000/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newMockBudget, userId: mockUserId }),
      });
    });

    it('should throw an error if the add budget response is not ok', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
      } as Response);

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
    it('should successfully update an existing budget', async () => {
      const finalUpdatedBudget = { ...updatedMockBudget, userId: mockUserId };
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(finalUpdatedBudget),
      } as Response);

      const result = await updateBudget(updatedMockBudget, mockUserId);
      expect(result).toEqual(finalUpdatedBudget);

      expect(fetchSpy).toHaveBeenCalledWith(
        `http://localhost:3000/budgets/${updatedMockBudget.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...updatedMockBudget, userId: mockUserId }),
        }
      );
    });

    it('should throw an error if the update budget response is not ok', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
      } as Response);

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
