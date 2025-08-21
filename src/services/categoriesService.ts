import { Category } from '@/interfaces/interfaces';
import { apiService, API_ENDPOINTS } from '@/config/api';

export const fetchCategories = async (userId: string): Promise<Category[]> => {
  if (!userId) {
    throw new Error('User ID is required to fetch categories.');
  }
  const categoriesData = await apiService.get(API_ENDPOINTS.CATEGORIES, {
    userId,
  });

  if (!categoriesData) {
    return [];
  }

  const userCategories: Category[] = categoriesData;

  return userCategories;
};

export const addCategory = async (
  newCategoryName: string,
  userId: string
): Promise<Category> => {
  if (!userId) {
    throw new Error('User ID is required to add a category.');
  }

  const categoryData = {
    name: newCategoryName,
    spendingLastMonth: 0,
    userId,
  };

  const addedCategory = await apiService.post(
    API_ENDPOINTS.CATEGORIES,
    categoryData
  );
  if (!addedCategory) {
    throw new Error('Failed to add category');
  }
  return addedCategory;
};

export const updateCategory = async (
  updatedCategory: Omit<Category, 'userId'>,
  userId: string
): Promise<Category> => {
  if (!userId) {
    throw new Error('User ID is required to update a category.');
  }
  const categoryWithUserId = { ...updatedCategory, userId };
  const updatedItem = await apiService.put(
    API_ENDPOINTS.CATEGORIES,
    updatedCategory.id,
    categoryWithUserId
  );
  if (!updatedItem) {
    throw new Error('Failed to update category');
  }
  return updatedItem;
};
