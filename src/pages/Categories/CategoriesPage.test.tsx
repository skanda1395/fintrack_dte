import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';
import CategoriesPage from './Categories';

// Mock all hooks
const mockAddMutation = {
  mutate: vi.fn(),
  isPending: false,
  isError: false,
};

const mockUpdateMutation = {
  mutate: vi.fn(),
  isPending: false,
  isError: false,
};

const mockUseAuth = vi.fn();
const mockUseCategories = vi.fn();
const mockUseTransactions = vi.fn();

vi.mock('@/hooks/categoriesQueries', () => ({
  useAddCategory: () => mockAddMutation,
  useUpdateCategory: () => mockUpdateMutation,
  useCategories: () => mockUseCategories(),
}));

vi.mock('@/hooks/transactionsQueries', () => ({
  useTransactions: () => mockUseTransactions(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme();
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </BrowserRouter>
  );
};

describe('CategoriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    });
    mockUseCategories.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    mockUseTransactions.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    render(
      <TestWrapper>
        <CategoriesPage />
      </TestWrapper>
    );

    expect(screen.getByText('Loading categories...')).toBeInTheDocument();
  });

  it('renders login message when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <TestWrapper>
        <CategoriesPage />
      </TestWrapper>
    );

    expect(
      screen.getByText('Please log in to manage your categories.')
    ).toBeInTheDocument();
  });

  it('renders add category form', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Test User' },
      loading: false,
    });
    mockUseCategories.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    mockUseTransactions.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    render(
      <TestWrapper>
        <CategoriesPage />
      </TestWrapper>
    );

    expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
    expect(screen.getByText('Add Category')).toBeInTheDocument();
  });

  it('calls add mutation when form is submitted', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Test User' },
      loading: false,
    });
    mockUseCategories.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    mockUseTransactions.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    render(
      <TestWrapper>
        <CategoriesPage />
      </TestWrapper>
    );

    const input = screen.getByLabelText('Category Name');
    const button = screen.getByText('Add Category');

    fireEvent.change(input, { target: { value: 'New Category' } });
    fireEvent.click(button);

    expect(mockAddMutation.mutate).toHaveBeenCalledWith(
      { newCategoryName: 'New Category', userId: '1' },
      expect.any(Object)
    );
  });

  it('renders empty state when no categories exist', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Test User' },
      loading: false,
    });
    mockUseCategories.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    mockUseTransactions.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    render(
      <TestWrapper>
        <CategoriesPage />
      </TestWrapper>
    );

    expect(
      screen.getByText('No categories found. Add a new category below.')
    ).toBeInTheDocument();
  });
});
