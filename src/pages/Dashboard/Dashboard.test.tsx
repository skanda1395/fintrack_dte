import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchCategories,
  addCategory,
  updateCategory,
} from '@/services/categoriesService';
import { API_ENDPOINTS } from '@/config/api';
import { Category } from '@/interfaces/interfaces';

//
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('categoriesService', () => {
  const mockUserId = 'user123';
  const mockCategories: Category[] = [
    { id: '1', name: 'Groceries', spendingCurrentMonth: 0, userId: mockUserId },
    { id: '2', name: 'Bills', spendingCurrentMonth: 0, userId: mockUserId },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchCategories', () => {
    it('should successfully fetch categories for a given user ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCategories),
      });

      const categories = await fetchCategories(mockUserId);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_ENDPOINTS.CATEGORIES}?userId=${mockUserId}`
      );
      expect(categories).toEqual(mockCategories);
    });

    it('should throw an error if the user ID is missing', async () => {
      await expect(fetchCategories('')).rejects.toThrow(
        'User ID is required to fetch categories.'
      );
    });

    it('should throw an error if the network response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(fetchCategories(mockUserId)).rejects.toThrow(
        'Failed to fetch categories'
      );
    });
  });

  describe('addCategory', () => {
    const newCategoryName = 'New Category';
    const newCategoryResponse: Category = {
      id: '3',
      name: newCategoryName,
      spendingCurrentMonth: 0,
      userId: mockUserId,
    };

    it('should successfully add a new category', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(newCategoryResponse),
      });

      const addedCategory = await addCategory(newCategoryName, mockUserId);

      expect(mockFetch).toHaveBeenCalledWith(API_ENDPOINTS.CATEGORIES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategoryName,
          spendingLastMonth: 0,
          userId: mockUserId,
        }),
      });
      expect(addedCategory).toEqual(newCategoryResponse);
    });

    it('should throw an error if the add operation fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(addCategory(newCategoryName, mockUserId)).rejects.toThrow(
        'Failed to add category'
      );
    });
  });

  describe('updateCategory', () => {
    const updatedCategory: Omit<Category, 'userId'> = {
      id: '1',
      name: 'Updated Groceries',
      spendingCurrentMonth: 50,
    };

    it('should successfully update an existing category', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...updatedCategory, userId: mockUserId }),
      });

      const result = await updateCategory(updatedCategory, mockUserId);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_ENDPOINTS.CATEGORIES}/${updatedCategory.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...updatedCategory, userId: mockUserId }),
        }
      );
      expect(result).toEqual({ ...updatedCategory, userId: mockUserId });
    });

    it('should throw an error if the update operation fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(updateCategory(updatedCategory, mockUserId)).rejects.toThrow(
        'Failed to update category'
      );
    });
  });
});
