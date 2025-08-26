import React, { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  useTransactions,
  useDeleteTransaction,
} from '@/hooks/transactionsQueries';
import { useCategories } from '@/hooks/categoriesQueries';
import { useAuth } from '@/contexts/AuthContext';
import TransactionFormModal from '@/components/TransactionFormModal';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { Transaction } from '@/interfaces/interfaces';

const TransactionsPage: React.FC = () => {
  const { user, loading: isAuthLoading } = useAuth();
  const userId = user?.id;

  const {
    data: transactions,
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useTransactions(userId);

  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    error: categoriesError,
  } = useCategories(userId);

  const { mutate: deleteTransaction } = useDeleteTransaction();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalInitialTransaction, setModalInitialTransaction] =
    useState<Transaction | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);

  const [transactionSearchTerm, setTransactionSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>(
    'all'
  );

  const handleOpenAddModal = () => {
    setModalInitialTransaction(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (transaction: Transaction) => {
    setModalInitialTransaction(transaction);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
  };

  const handleOpenDeleteModal = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTransactionToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete && userId) {
      deleteTransaction(
        { transactionId: transactionToDelete.id, userId },
        {
          onSuccess: () => {
            handleCloseDeleteModal();
            refetchTransactions();
          },
        }
      );
    }
  };

  const findCategoryName = (categoryId: string): string => {
    const category = categories?.find((cat) => cat.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    return transactions
      .filter((transaction) => {
        if (filterType === 'all') return true;
        return transaction.type === filterType;
      })
      .filter((transaction) => {
        const searchTerm = transactionSearchTerm.toLowerCase();
        const categoryName = findCategoryName(transaction.categoryId);
        return (
          transaction.description.toLowerCase().includes(searchTerm) ||
          categoryName.toLowerCase().includes(searchTerm)
        );
      });
  }, [transactions, categories, filterType, transactionSearchTerm]);

  if (isAuthLoading || isTransactionsLoading || isCategoriesLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isTransactionsError) {
    return (
      <Container>
        <Alert severity="error">
          Error loading transactions: {transactionsError?.message}
        </Alert>
      </Container>
    );
  }

  if (isCategoriesError) {
    return (
      <Container>
        <Alert severity="error">
          Error loading categories: {categoriesError?.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box
        mb={4}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold' }}
        >
          Transactions
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddModal}
        >
          Add Transaction
        </Button>
      </Box>

      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="Search transactions"
          variant="outlined"
          value={transactionSearchTerm}
          onChange={(e) => setTransactionSearchTerm(e.target.value)}
          aria-label="Search transactions by description or category name"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={() => setFilterType('all')}
            aria-pressed={filterType === 'all'}
            sx={{
              borderRadius: '20px',
              borderColor: 'grey.300',
              color: 'text.secondary',
              backgroundColor:
                filterType === 'all' ? 'action.selected' : 'transparent',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            All
          </Button>
          <Button
            variant="outlined"
            onClick={() => setFilterType('income')}
            aria-pressed={filterType === 'income'}
            sx={{
              borderRadius: '20px',
              borderColor: 'grey.300',
              color: 'text.secondary',
              backgroundColor:
                filterType === 'income' ? 'action.selected' : 'transparent',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            Income
          </Button>
          <Button
            variant="outlined"
            onClick={() => setFilterType('expense')}
            aria-pressed={filterType === 'expense'}
            sx={{
              borderRadius: '20px',
              borderColor: 'grey.300',
              color: 'text.secondary',
              backgroundColor:
                filterType === 'expense' ? 'action.selected' : 'transparent',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            Expenses
          </Button>
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ borderRadius: 2, border: '1px solid #e0e0e0', overflowX: 'auto' }}
      >
        <Table>
          <caption style={{ position: 'absolute', clip: 'rect(0 0 0 0)' }}>
            A table listing all of your financial transactions.
          </caption>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ fontWeight: 'bold', minWidth: '120px' }}
                scope="col"
              >
                Date
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} scope="col">
                Category
              </TableCell>
              <TableCell
                sx={{ fontWeight: 'bold', minWidth: '200px' }}
                scope="col"
              >
                Description
              </TableCell>
              <TableCell
                sx={{ fontWeight: 'bold', textAlign: 'right' }}
                scope="col"
              >
                Amount
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  textAlign: 'center',
                  minWidth: '120px',
                }}
                scope="col"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id} hover>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>
                    {findCategoryName(transaction.categoryId)}
                  </TableCell>
                  <Tooltip title={transaction.description} arrow>
                    <TableCell
                      sx={{
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {transaction.description}
                    </TableCell>
                  </Tooltip>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 'bold',
                        color:
                          transaction.type === 'income'
                            ? 'success.main'
                            : 'error.main',
                      }}
                    >
                      <span className="visually-hidden">
                        {transaction.type === 'income' ? 'Income' : 'Expense'}:
                      </span>
                      {transaction.type === 'income' ? '+' : '-'}$
                      {transaction.amount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Tooltip title="Edit">
                      <IconButton
                        onClick={() => handleOpenEditModal(transaction)}
                        size="medium"
                        color="default"
                        aria-label={`Edit transaction ${transaction.description}`}
                      >
                        <EditIcon fontSize="medium" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => handleOpenDeleteModal(transaction)}
                        size="medium"
                        color="default"
                        aria-label={`Delete transaction ${transaction.description}`}
                      >
                        <DeleteIcon fontSize="medium" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" py={2}>
                    No transactions found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TransactionFormModal
        open={isFormModalOpen}
        onClose={handleCloseFormModal}
        initialTransaction={modalInitialTransaction}
        categories={categories}
        onTransactionSaved={refetchTransactions}
      />

      <DeleteConfirmationDialog
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        transaction={transactionToDelete}
      />
    </Container>
  );
};

export default TransactionsPage;
