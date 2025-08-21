import { Transaction } from '@/interfaces/interfaces';
import { apiService, API_ENDPOINTS } from '@/config/api';

export const fetchTransactions = async (
  userId: string
): Promise<Transaction[]> => {
  if (!userId) {
    throw new Error('User ID is required to fetch transactions.');
  }
  const transactionsData = await apiService.get(API_ENDPOINTS.TRANSACTIONS, {
    userId,
  });

  if (!transactionsData) {
    return [];
  }

  const userTransactions: Transaction[] = transactionsData;

  return userTransactions;
};

export const addTransaction = async (
  newTransaction: Omit<Transaction, 'id' | 'userId'>,
  userId: string
): Promise<Transaction> => {
  if (!userId) {
    throw new Error('User ID is required to add a transaction.');
  }
  const transactionWithUserId = { ...newTransaction, userId };
  const addedTransaction = await apiService.post(
    API_ENDPOINTS.TRANSACTIONS,
    transactionWithUserId
  );
  if (!addedTransaction) {
    throw new Error('Failed to add transaction');
  }
  return addedTransaction;
};

export const updateTransaction = async (
  updatedTransaction: Omit<Transaction, 'userId'>,
  userId: string
): Promise<Transaction> => {
  if (!userId) {
    throw new Error('User ID is required to update a transaction.');
  }
  const transactionWithUserId = { ...updatedTransaction, userId };
  const updatedItem = await apiService.put(
    API_ENDPOINTS.TRANSACTIONS,
    updatedTransaction.id,
    transactionWithUserId
  );
  if (!updatedItem) {
    throw new Error('Failed to update transaction');
  }
  return updatedItem;
};

export const deleteTransaction = async (
  transactionId: string,
  userId: string
): Promise<void> => {
  if (!userId) {
    throw new Error('User ID is required to delete a transaction.');
  }
  await apiService.delete(API_ENDPOINTS.TRANSACTIONS, transactionId);
};
