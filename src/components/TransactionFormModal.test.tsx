import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import TransactionFormModal from './TransactionFormModal';
import { useAuth } from '@/contexts/AuthContext';
import {
  useAddTransaction,
  useUpdateTransaction,
} from '@/hooks/transactionsQueries';
import { Transaction, Category } from '@/interfaces/interfaces';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/transactionsQueries', () => ({
  useAddTransaction: vi.fn(),
  useUpdateTransaction: vi.fn(),
}));

describe('TransactionFormModal', () => {
  const mockUser = { id: 'test-user-id' };
  const mockCategories: Category[] = [
    { id: 'cat1', name: 'Food', type: 'expense', userId: mockUser.id },
    { id: 'cat2', name: 'Salary', type: 'income', userId: mockUser.id },
  ];
  const mockOnClose = vi.fn();
  const mockOnTransactionSaved = vi.fn();

  vi.mocked(useAuth).mockReturnValue({
    user: mockUser as any,
    loading: false,
    checkAuth: vi.fn(),
  });

  const mockAddTransaction = vi.fn();
  const mockUpdateTransaction = vi.fn();

  beforeEach(() => {
    vi.mocked(useAddTransaction).mockReturnValue({
      mutate: mockAddTransaction,
      isPending: false,
      isSuccess: false,
    });
    vi.mocked(useUpdateTransaction).mockReturnValue({
      mutate: mockUpdateTransaction,
      isPending: false,
      isSuccess: false,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should disable the save button when description or amount is missing', () => {
    render(
      <TransactionFormModal
        open={true}
        onClose={mockOnClose}
        onTransactionSaved={mockOnTransactionSaved}
        categories={mockCategories}
      />
    );

    const saveButton = screen.getByRole('button', { name: /Save/i });
    expect(saveButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Test' },
    });
    expect(saveButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/Amount/i), {
      target: { value: 100 },
    });
    expect(saveButton).toBeEnabled();
  });

  it('should call addTransaction and close the modal on save for a new transaction', async () => {
    render(
      <TransactionFormModal
        open={true}
        onClose={mockOnClose}
        onTransactionSaved={mockOnTransactionSaved}
        categories={mockCategories}
      />
    );

    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Test New' },
    });
    fireEvent.change(screen.getByLabelText(/Amount/i), {
      target: { value: 25.5 },
    });

    const saveButton = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockAddTransaction).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          newTransaction: {
            date: expect.any(String),
            description: 'Test New',
            amount: 25.5,
            type: 'expense',
            categoryId: '',
          },
        },
        expect.any(Object)
      );
    });

    const onSuccessCallback = mockAddTransaction.mock.calls[0][1].onSuccess;
    onSuccessCallback();

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnTransactionSaved).toHaveBeenCalled();
  });

  it('should call updateTransaction and close the modal on save for an existing transaction', async () => {
    const mockTransaction: Transaction = {
      id: 'trans1',
      userId: mockUser.id,
      date: '2023-01-01',
      description: 'Old Description',
      amount: 100,
      type: 'expense',
      categoryId: 'cat1',
    };

    render(
      <TransactionFormModal
        open={true}
        onClose={mockOnClose}
        onTransactionSaved={mockOnTransactionSaved}
        categories={mockCategories}
        initialTransaction={mockTransaction}
      />
    );

    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Updated Description' },
    });

    const saveButton = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateTransaction).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          updatedTransaction: {
            id: 'trans1',
            date: '2023-01-01',
            description: 'Updated Description',
            amount: 100,
            type: 'expense',
            categoryId: 'cat1',
          },
        },
        expect.any(Object)
      );
    });

    const onSuccessCallback = mockUpdateTransaction.mock.calls[0][1].onSuccess;
    onSuccessCallback();

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnTransactionSaved).toHaveBeenCalled();
  });

  it('should call onClose when the Cancel button is clicked', () => {
    render(
      <TransactionFormModal
        open={true}
        onClose={mockOnClose}
        onTransactionSaved={mockOnTransactionSaved}
        categories={mockCategories}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
