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
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
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

const useTransactionsData = (
  searchTerm: string,
  filterType: 'all' | 'income' | 'expense',
  userId?: string
) => {
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
        const lowerSearchTerm = searchTerm.toLowerCase();
        const categoryName = findCategoryName(transaction.categoryId);
        return (
          transaction.description.toLowerCase().includes(lowerSearchTerm) ||
          categoryName.toLowerCase().includes(lowerSearchTerm)
        );
      });
  }, [transactions, categories, filterType, searchTerm]);

  return {
    filteredTransactions,
    findCategoryName,
    isLoading: isTransactionsLoading || isCategoriesLoading,
    isError: isTransactionsError || isCategoriesError,
    error: transactionsError || categoriesError,
    refetchTransactions,
    categories,
  };
};

const TransactionsPage: React.FC = () => {
  const { user, loading: isAuthLoading } = useAuth();
  const userId = user?.id;

  const [transactionSearchTerm, setTransactionSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>(
    'all'
  );

  const {
    filteredTransactions,
    findCategoryName,
    isLoading,
    isError,
    error,
    refetchTransactions,
    categories,
  } = useTransactionsData(transactionSearchTerm, filterType, userId);

  const { mutate: deleteTransaction } = useDeleteTransaction();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalInitialTransaction, setModalInitialTransaction] =
    useState<Transaction | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  if (isAuthLoading || isLoading) {
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

  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading transactions: {(error as Error)?.message}
        </Alert>
      </Container>
    );
  }

  const TransactionCard = ({ transaction }: { transaction: Transaction }) => (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Date
          </Typography>
          <Typography variant="body1">{transaction.date}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Category
          </Typography>
          <Typography variant="body1">
            {findCategoryName(transaction.categoryId)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Description
          </Typography>
          <Typography variant="body1">{transaction.description}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Amount
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 'bold',
              color:
                transaction.type === 'income' ? 'success.main' : 'error.main',
            }}
          >
            {transaction.type === 'income' ? '+' : '-'}$
            {transaction.amount.toFixed(2)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Tooltip title="Edit">
            <IconButton
              onClick={() => handleOpenEditModal(transaction)}
              size="small"
              aria-label={`Edit transaction ${transaction.description}`}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              onClick={() => handleOpenDeleteModal(transaction)}
              size="small"
              aria-label={`Delete transaction ${transaction.description}`}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );

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

      {isMobile ? (
        <Box>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
              No transactions found.
            </Typography>
          )}
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}
        >
          <Table stickyHeader>
            <caption style={{ position: 'absolute', clip: 'rect(0 0 0 0)' }}>
              A table listing all of your financial transactions.
            </caption>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }} scope="col">
                  Date
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} scope="col">
                  Category
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} scope="col">
                  Description
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 'bold', textAlign: 'right' }}
                  scope="col"
                >
                  Amount
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 'bold', textAlign: 'center' }}
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
                          {transaction.type === 'income' ? 'Income' : 'Expense'}
                          :
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
      )}

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
