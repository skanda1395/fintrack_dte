import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import {
  useAddTransaction,
  useUpdateTransaction,
} from '@/hooks/transactionsQueries';
import { Transaction, Category } from '@/interfaces/interfaces';
import { useAuth } from '@/contexts/AuthContext';

interface TransactionFormModalProps {
  open: boolean;
  onClose: () => void;
  initialTransaction?: Transaction | null;
  categories?: Category[];
  onTransactionSaved: () => void;
}

const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  open,
  onClose,
  initialTransaction,
  categories,
  onTransactionSaved,
}) => {
  const { user } = useAuth();
  const currentUserId = user?.id;

  const [date, setDate] = useState(
    initialTransaction?.date || new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState(
    initialTransaction?.description || ''
  );
  const [amount, setAmount] = useState<number | ''>(
    initialTransaction?.amount || ''
  );
  const [type, setType] = useState<'income' | 'expense'>(
    initialTransaction?.type || 'expense'
  );
  const [categoryId, setCategoryId] = useState(
    initialTransaction?.categoryId || ''
  );

  // Corrected destructuring to use 'isPending'
  const { mutate: addTransaction, isPending: isAdding } = useAddTransaction();
  const { mutate: updateTransaction, isPending: isUpdating } =
    useUpdateTransaction();

  useEffect(() => {
    // Reset form state when the modal is opened for a new transaction
    if (!initialTransaction) {
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setAmount('');
      setType('expense');
      setCategoryId('');
    } else {
      // Set form state for an existing transaction
      setDate(initialTransaction.date);
      setDescription(initialTransaction.description);
      setAmount(initialTransaction.amount);
      setType(initialTransaction.type);
      setCategoryId(initialTransaction.categoryId || '');
    }
  }, [initialTransaction]);

  const isSaveButtonDisabled =
    !description || amount === '' || amount === 0 || isAdding || isUpdating;

  const handleSave = () => {
    if (isSaveButtonDisabled) return;

    if (!currentUserId) {
      console.error('User not authenticated.');
      return;
    }

    const transactionData = {
      date,
      description,
      amount: Number(amount),
      type,
      categoryId,
    };

    if (initialTransaction) {
      updateTransaction(
        {
          userId: currentUserId,
          updatedTransaction: {
            ...transactionData,
            id: initialTransaction.id,
          },
        },
        {
          onSuccess: () => {
            onClose();
            onTransactionSaved();
          },
        }
      );
    } else {
      addTransaction(
        {
          userId: currentUserId,
          newTransaction: transactionData,
        },
        {
          onSuccess: () => {
            onClose();
            onTransactionSaved();
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {initialTransaction ? 'Edit Transaction' : 'Add New Transaction'}
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box
          component="form"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            pt: 1,
          }}
          noValidate
          autoComplete="off"
        >
          <TextField
            label="Date"
            type="date"
            fullWidth
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Description"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            label="Amount"
            type="number"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth>
            <InputLabel id="type-select-label">Type</InputLabel>
            <Select
              labelId="type-select-label"
              id="type-select"
              value={type}
              label="Type"
              onChange={(e) => setType(e.target.value as 'income' | 'expense')}
            >
              <MenuItem value="expense">Expense</MenuItem>
              <MenuItem value="income">Income</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
              labelId="category-select-label"
              id="category-select"
              value={categoryId}
              label="Category"
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  No categories available
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isSaveButtonDisabled}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionFormModal;
