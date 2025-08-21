import { Transaction } from '@/interfaces/interfaces';
import { useMemo } from 'react';
import { useCategories } from './categoriesQueries';
import { useTransactions } from './transactionsQueries';

export const useCategoriesWithSpending = (userId?: string) => {
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    error: categoriesError,
  } = useCategories(userId);
  const {
    data: transactions,
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
    error: transactionsError,
  } = useTransactions(userId);

  const categoriesWithSpending = useMemo(() => {
    if (!categories || !transactions) {
      return [];
    }

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const expenseTransactionsThisMonth = transactions.filter(
      (t: Transaction) => {
        const transactionDate = new Date(t.date);
        return (
          t.type === 'expense' &&
          transactionDate >= currentMonthStart &&
          transactionDate <= currentMonthEnd
        );
      }
    );

    return categories.map((category) => {
      const spent = expenseTransactionsThisMonth
        .filter((t: Transaction) => t.categoryId === category.id)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        ...category,
        spendingCurrentMonth: spent,
      };
    });
  }, [categories, transactions]);

  return {
    data: categoriesWithSpending,
    isLoading: isCategoriesLoading || isTransactionsLoading,
    isError: isCategoriesError || isTransactionsError,
    error: categoriesError || transactionsError,
  };
};
