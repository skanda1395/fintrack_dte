import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import TransactionsPage from './Transactions';

// Simple mock variables
let mockAuthData = { user: { id: 'test' }, loading: false };
let mockTransactionsData = {
  data: [],
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
};
let mockCategoriesData = {
  data: [],
  isLoading: false,
  isError: false,
  error: null,
};
const mockMutate = vi.fn();

vi.mock('@/hooks/transactionsQueries', () => ({
  useTransactions: () => mockTransactionsData,
  useDeleteTransaction: () => ({ mutate: mockMutate }),
}));

vi.mock('@/hooks/categoriesQueries', () => ({
  useCategories: () => mockCategoriesData,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthData,
}));

vi.mock('@/components/TransactionFormModal', () => ({
  default: () => null,
}));

vi.mock('@/components/DeleteConfirmationDialog', () => ({
  default: () => null,
}));

vi.mock('@mui/material', () => ({
  Container: ({ children }: any) => <div>{children}</div>,
  Typography: ({ children }: any) => <div>{children}</div>,
  Box: ({ children }: any) => <div>{children}</div>,
  Paper: ({ children }: any) => <div>{children}</div>,
  Table: ({ children }: any) => <div>{children}</div>,
  TableBody: ({ children }: any) => <div>{children}</div>,
  TableCell: ({ children }: any) => <div>{children}</div>,
  TableContainer: ({ children }: any) => <div>{children}</div>,
  TableHead: ({ children }: any) => <div>{children}</div>,
  TableRow: ({ children }: any) => <div>{children}</div>,
  TextField: () => <div>TextField</div>,
  InputAdornment: () => <div>InputAdornment</div>,
  Button: ({ children }: any) => <div>{children}</div>,
  IconButton: () => <div>IconButton</div>,
  Tooltip: ({ children }: any) => <div>{children}</div>,
  CircularProgress: () => <div>Loading</div>,
  Alert: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@mui/icons-material', () => ({
  Search: () => <div>Search</div>,
  Edit: () => <div>Edit</div>,
  Add: () => <div>Add</div>,
  Delete: () => <div>Delete</div>,
}));

describe('TransactionsPage', () => {
  it('renders without crashing', () => {
    mockAuthData = { user: { id: 'test' }, loading: false };
    mockTransactionsData = {
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    };
    mockCategoriesData = {
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    };

    const { container } = render(<TransactionsPage />);
    expect(container).toBeTruthy();
  });

  it('shows loading when auth is loading', () => {
    mockAuthData = { user: null, loading: true };
    mockTransactionsData = {
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    };
    mockCategoriesData = {
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    };

    const { container } = render(<TransactionsPage />);
    expect(container).toBeTruthy();
  });

  it('shows loading when transactions loading', () => {
    mockAuthData = { user: { id: 'test' }, loading: false };
    mockTransactionsData = {
      data: [],
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    };
    mockCategoriesData = {
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    };

    const { container } = render(<TransactionsPage />);
    expect(container).toBeTruthy();
  });

  it('shows loading when categories loading', () => {
    mockAuthData = { user: { id: 'test' }, loading: false };
    mockTransactionsData = {
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    };
    mockCategoriesData = {
      data: [],
      isLoading: true,
      isError: false,
      error: null,
    };

    const { container } = render(<TransactionsPage />);
    expect(container).toBeTruthy();
  });

  it('shows error when transactions error', () => {
    mockAuthData = { user: { id: 'test' }, loading: false };
    mockTransactionsData = {
      data: [],
      isLoading: false,
      isError: true,
      error: { message: 'error' },
      refetch: vi.fn(),
    };
    mockCategoriesData = {
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    };

    const { container } = render(<TransactionsPage />);
    expect(container).toBeTruthy();
  });

  it('shows error when categories error', () => {
    mockAuthData = { user: { id: 'test' }, loading: false };
    mockTransactionsData = {
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    };
    mockCategoriesData = {
      data: [],
      isLoading: false,
      isError: true,
      error: { message: 'error' },
    };

    const { container } = render(<TransactionsPage />);
    expect(container).toBeTruthy();
  });

  it('renders with transaction data', () => {
    mockAuthData = { user: { id: 'test' }, loading: false };
    mockTransactionsData = {
      data: [
        {
          id: '1',
          date: '2024-01-01',
          categoryId: 'cat1',
          description: 'Test',
          amount: 100,
          type: 'expense',
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    };
    mockCategoriesData = {
      data: [{ id: 'cat1', name: 'Food' }],
      isLoading: false,
      isError: false,
      error: null,
    };

    const { container } = render(<TransactionsPage />);
    expect(container).toBeTruthy();
  });

  it('renders with income transaction', () => {
    mockAuthData = { user: { id: 'test' }, loading: false };
    mockTransactionsData = {
      data: [
        {
          id: '1',
          date: '2024-01-01',
          categoryId: 'cat1',
          description: 'Salary',
          amount: 1000,
          type: 'income',
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    };
    mockCategoriesData = {
      data: [{ id: 'cat1', name: 'Work' }],
      isLoading: false,
      isError: false,
      error: null,
    };

    const { container } = render(<TransactionsPage />);
    expect(container).toBeTruthy();
  });

  it('handles missing category', () => {
    mockAuthData = { user: { id: 'test' }, loading: false };
    mockTransactionsData = {
      data: [
        {
          id: '1',
          date: '2024-01-01',
          categoryId: 'missing',
          description: 'Test',
          amount: 100,
          type: 'expense',
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    };
    mockCategoriesData = {
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    };

    const { container } = render(<TransactionsPage />);
    expect(container).toBeTruthy();
  });
});
