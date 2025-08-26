import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Transaction } from '@/interfaces/interfaces';

const mockTransaction: Transaction = {
  id: '12345',
  description: 'Groceries from the market',
  amount: 55.75,
  date: '2023-10-27',
  categoryId: 'cat1',
  type: 'expense',
  userId: 'user123',
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

describe('DeleteConfirmationDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render the dialog when closed', () => {
    render(
      <TestWrapper>
        <DeleteConfirmationDialog
          open={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          transaction={mockTransaction}
        />
      </TestWrapper>
    );

    expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
  });

  it('renders the dialog correctly when open', () => {
    render(
      <TestWrapper>
        <DeleteConfirmationDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          transaction={mockTransaction}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete the transaction/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('displays the correct transaction description in the body', () => {
    render(
      <TestWrapper>
        <DeleteConfirmationDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          transaction={mockTransaction}
        />
      </TestWrapper>
    );

    const dialogMessage = screen.getByText(
      `Are you sure you want to delete the transaction "Groceries from the market"? This action cannot be undone.`
    );
    expect(dialogMessage).toBeInTheDocument();
  });

  it('calls onClose when the Cancel button is clicked', () => {
    render(
      <TestWrapper>
        <DeleteConfirmationDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          transaction={mockTransaction}
        />
      </TestWrapper>
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when the Delete button is clicked', () => {
    render(
      <TestWrapper>
        <DeleteConfirmationDialog
          open={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          transaction={mockTransaction}
        />
      </TestWrapper>
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });
});
