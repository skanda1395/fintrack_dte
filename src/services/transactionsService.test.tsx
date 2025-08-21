import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/services/transactionsService';
import { API_ENDPOINTS } from '@/config/api';
import { Transaction } from '@/interfaces/interfaces';

const mockFetch = vi.fn();
global.fetch = mockFetch;

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
    vi.clearAllMocks();
  });

  describe('fetchTransactions', () => {
    it('should successfully fetch transactions for a given user ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTransactions),
      });

      const transactions = await fetchTransactions(mockUserId);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_ENDPOINTS.TRANSACTIONS}?userId=${mockUserId}`
      );
      expect(transactions).toEqual(mockTransactions);
    });

    it('should throw an error if the user ID is missing', async () => {
      await expect(fetchTransactions('')).rejects.toThrow(
        'User ID is required to fetch transactions.'
      );
    });

    it('should throw an error if the network response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(fetchTransactions(mockUserId)).rejects.toThrow(
        'Failed to fetch transactions'
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
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(newTransactionResponse),
      });

      const addedTransaction = await addTransaction(newTransaction, mockUserId);

      expect(mockFetch).toHaveBeenCalledWith(API_ENDPOINTS.TRANSACTIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...newTransaction, userId: mockUserId }),
      });
      expect(addedTransaction).toEqual(newTransactionResponse);
    });

    it('should throw an error if the add operation fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

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
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedTransactionResponse),
      });

      const result = await updateTransaction(updatedTransaction, mockUserId);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_ENDPOINTS.TRANSACTIONS}/${updatedTransaction.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...updatedTransaction, userId: mockUserId }),
        }
      );
      expect(result).toEqual(updatedTransactionResponse);
    });

    it('should throw an error if the update operation fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(
        updateTransaction(updatedTransaction, mockUserId)
      ).rejects.toThrow('Failed to update transaction');
    });
  });

  describe('deleteTransaction', () => {
    const transactionIdToDelete = '1';

    it('should successfully delete a transaction', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      const result = await deleteTransaction(transactionIdToDelete, mockUserId);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_ENDPOINTS.TRANSACTIONS}/${transactionIdToDelete}`,
        {
          method: 'DELETE',
        }
      );
      expect(result).toBeUndefined();
    });

    it('should throw an error if the delete operation fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(
        deleteTransaction(transactionIdToDelete, mockUserId)
      ).rejects.toThrow('Failed to delete transaction');
    });
  });
});
