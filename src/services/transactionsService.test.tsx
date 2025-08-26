import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/services/transactionsService';

import { apiService, API_ENDPOINTS } from '@/config/api';
vi.mock('@/config/api');

interface Transaction {
  id: string;
  categoryId: string;
  description: string;
  amount: number;
  date: string;
  type: 'expense' | 'income';
  userId: string;
}

const mockApiService = apiService as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe('transactionsService', () => {
  const mockUserId = 'user123';
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      categoryId: 'cat1',
      description: 'Groceries',
      amount: 50.0,
      date: '2023-10-27',
      type: 'expense',
      userId: mockUserId,
    },
    {
      id: '2',
      categoryId: 'cat2',
      description: 'Salary',
      amount: 2000.0,
      date: '2023-10-25',
      type: 'income',
      userId: mockUserId,
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('fetchTransactions', () => {
    it('should successfully fetch transactions for a given user ID', async () => {
      mockApiService.get.mockResolvedValueOnce(mockTransactions);

      const transactions = await fetchTransactions(mockUserId);

      expect(mockApiService.get).toHaveBeenCalledWith(
        API_ENDPOINTS.TRANSACTIONS,
        { userId: mockUserId }
      );
      expect(transactions).toEqual(mockTransactions);
    });

    it('should return an empty array if no transactions are found', async () => {
      mockApiService.get.mockResolvedValueOnce(null);

      const transactions = await fetchTransactions(mockUserId);

      expect(mockApiService.get).toHaveBeenCalledWith(
        API_ENDPOINTS.TRANSACTIONS,
        { userId: mockUserId }
      );
      expect(transactions).toEqual([]);
    });

    it('should throw an error if the user ID is missing', async () => {
      await expect(fetchTransactions('')).rejects.toThrow(
        'User ID is required to fetch transactions.'
      );
    });
  });

  describe('addTransaction', () => {
    const newTransaction = {
      categoryId: 'cat3',
      description: 'Books',
      amount: 25.0,
      date: '2023-10-28',
      type: 'expense',
    };
    const newTransactionResponse = {
      ...newTransaction,
      id: '3',
      userId: mockUserId,
    };

    it('should successfully add a new transaction', async () => {
      mockApiService.post.mockResolvedValueOnce(newTransactionResponse);

      const addedTransaction = await addTransaction(newTransaction, mockUserId);

      expect(mockApiService.post).toHaveBeenCalledWith(
        API_ENDPOINTS.TRANSACTIONS,
        { ...newTransaction, userId: mockUserId }
      );
      expect(addedTransaction).toEqual(newTransactionResponse);
    });

    it('should throw an error if the user ID is missing', async () => {
      await expect(addTransaction(newTransaction, '')).rejects.toThrow(
        'User ID is required to add a transaction.'
      );
    });

    it('should throw an error if the add operation fails', async () => {
      mockApiService.post.mockResolvedValueOnce(null);

      await expect(addTransaction(newTransaction, mockUserId)).rejects.toThrow(
        'Failed to add transaction'
      );
    });
  });

  describe('updateTransaction', () => {
    const updatedTransaction = {
      id: '1',
      categoryId: 'cat1',
      description: 'Groceries (updated)',
      amount: 55.0,
      date: '2023-10-27',
      type: 'expense',
    };
    const updatedTransactionResponse = {
      ...updatedTransaction,
      userId: mockUserId,
    };

    it('should successfully update an existing transaction', async () => {
      mockApiService.put.mockResolvedValueOnce(updatedTransactionResponse);

      const result = await updateTransaction(updatedTransaction, mockUserId);

      expect(mockApiService.put).toHaveBeenCalledWith(
        API_ENDPOINTS.TRANSACTIONS,
        updatedTransaction.id,
        { ...updatedTransaction, userId: mockUserId }
      );
      expect(result).toEqual(updatedTransactionResponse);
    });

    it('should throw an error if the user ID is missing', async () => {
      await expect(updateTransaction(updatedTransaction, '')).rejects.toThrow(
        'User ID is required to update a transaction.'
      );
    });

    it('should throw an error if the update operation fails', async () => {
      mockApiService.put.mockResolvedValueOnce(null);

      await expect(
        updateTransaction(updatedTransaction, mockUserId)
      ).rejects.toThrow('Failed to update transaction');
    });
  });

  describe('deleteTransaction', () => {
    const transactionIdToDelete = '1';

    it('should successfully delete a transaction', async () => {
      mockApiService.delete.mockResolvedValueOnce(undefined);

      await deleteTransaction(transactionIdToDelete, mockUserId);

      expect(mockApiService.delete).toHaveBeenCalledWith(
        API_ENDPOINTS.TRANSACTIONS,
        transactionIdToDelete
      );
    });

    it('should throw an error if the user ID is missing', async () => {
      await expect(
        deleteTransaction(transactionIdToDelete, '')
      ).rejects.toThrow('User ID is required to delete a transaction.');
    });

    it('should throw an error if the delete operation fails', async () => {
      mockApiService.delete.mockResolvedValueOnce(undefined);
    });
  });
});
