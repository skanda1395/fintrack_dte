import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from './Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/hooks/transactionsQueries';
import { useCategories } from '@/hooks/categoriesQueries';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { Transaction, Category } from '@/interfaces/interfaces';

// Mock the hooks used by the component
vi.mock('@/contexts/AuthContext');
vi.mock('@/hooks/transactionsQueries');
vi.mock('@/hooks/categoriesQueries');

// Mock data for testing
const mockUser = { id: 'user123' };

const mockTransactions: Transaction[] = [
  {
    id: 't1',
    date: '2025-08-20',
    description: 'Groceries',
    amount: 50.0,
    type: 'expense',
    categoryId: 'c1',
    userId: 'user123',
  },
  {
    id: 't2',
    date: '2025-08-22',
    description: 'Salary',
    amount: 2000.0,
    type: 'income',
    categoryId: 'c2',
    userId: 'user123',
  },
  {
    id: 't3',
    date: '2025-08-25',
    description: 'Dinner',
    amount: 75.5,
    type: 'expense',
    categoryId: 'c1',
    userId: 'user123',
  },
  {
    id: 't4',
    date: '2025-07-15',
    description: 'Old Expense',
    amount: 100.0,
    type: 'expense',
    categoryId: 'c3',
    userId: 'user123',
  },
];

const mockCategories: Category[] = [
  { id: 'c1', name: 'Food', spendingCurrentMonth: 0, userId: 'user123' },
  { id: 'c2', name: 'Income', spendingCurrentMonth: 0, userId: 'user123' },
  { id: 'c3', name: 'Utilities', spendingCurrentMonth: 0, userId: 'user123' },
];

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Use a fixed date for consistent test results
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-08-26'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Helper function to render the component with mocked data
  const renderDashboard = (
    authLoading = false,
    transactionsLoading = false,
    categoriesLoading = false,
    transactionsData = mockTransactions,
    categoriesData = mockCategories,
    transactionsError = false,
    categoriesError = false
  ) => {
    // Mock return values for each hook
    (useAuth as any).mockReturnValue({
      user: mockUser,
      loading: authLoading,
    });
    (useTransactions as any).mockReturnValue({
      data: transactionsData,
      isLoading: transactionsLoading,
      isError: transactionsError,
    });
    (useCategories as any).mockReturnValue({
      data: categoriesData,
      isLoading: categoriesLoading,
      isError: categoriesError,
    });

    return render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
  };

  it('should render a loading spinner when data is being fetched', () => {
    renderDashboard(false, true, false);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render an error alert when data fetching fails', () => {
    renderDashboard(false, false, false, [], [], true, false);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByText(/failed to load dashboard data/i)
    ).toBeInTheDocument();
  });

  it('should display a message when there are no recent transactions', () => {
    renderDashboard(false, false, false, [], mockCategories);

    expect(
      screen.getByText(/No recent transactions found/i)
    ).toBeInTheDocument();
  });
});
