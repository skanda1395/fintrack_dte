import { Budget } from '@/interfaces/interfaces';
import { apiService, API_ENDPOINTS } from '@/config/api';

export const fetchBudgets = async (userId: string): Promise<Budget[]> => {
  if (!userId) {
    throw new Error('User ID is required to fetch budgets.');
  }
  const budgetsData = await apiService.get(API_ENDPOINTS.BUDGETS, { userId });

  if (!budgetsData) {
    return [];
  }

  const userBudgets: Budget[] = budgetsData;

  return userBudgets;
};

export const addBudget = async (
  newBudget: Omit<Budget, 'id' | 'userId'>,
  userId: string
): Promise<Budget> => {
  if (!userId) {
    throw new Error('User ID is required to add a budget.');
  }
  const budgetWithUserId = { ...newBudget, userId };
  const addedBudget = await apiService.post(
    API_ENDPOINTS.BUDGETS,
    budgetWithUserId
  );
  if (!addedBudget) {
    throw new Error('Failed to add budget');
  }
  return addedBudget;
};

export const updateBudget = async (
  updatedBudget: Omit<Budget, 'userId'>,
  userId: string
): Promise<Budget> => {
  if (!userId) {
    throw new Error('User ID is required to update a budget.');
  }
  const budgetWithUserId = { ...updatedBudget, userId };
  const updatedItem = await apiService.put(
    API_ENDPOINTS.BUDGETS,
    updatedBudget.id,
    budgetWithUserId
  );
  if (!updatedItem) {
    throw new Error('Failed to update budget');
  }
  return updatedItem;
};
