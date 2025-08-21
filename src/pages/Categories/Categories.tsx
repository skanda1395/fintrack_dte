import React, { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Alert,
  Grid,
  Modal,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useAddCategory, useUpdateCategory } from '@/hooks/categoriesQueries';
import { useTransactions } from '@/hooks/transactionsQueries';
import { Category, Transaction } from '@/interfaces/interfaces';
import { useAuth } from '@/contexts/AuthContext';
import { useCategories } from '@/hooks/categoriesQueries';

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

// Custom hook to fetch categories and calculate spending for the current month
const useCategoriesWithSpending = (userId?: string) => {
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

const CategoriesPage: React.FC = () => {
  const { user, loading: isAuthLoading } = useAuth();
  const userId = user?.id;

  const {
    data: categories,
    isLoading,
    isError,
    error,
  } = useCategoriesWithSpending(userId);
  const addMutation = useAddCategory();
  const updateMutation = useUpdateCategory();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim() === '' || !userId) {
      console.error('Category name cannot be empty or user not logged in.');
      return;
    }

    addMutation.mutate(
      { newCategoryName, userId },
      {
        onSuccess: () => {
          setNewCategoryName('');
        },
      }
    );
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setOpenEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || editingCategory.name.trim() === '' || !userId) {
      console.error('Category name cannot be empty or user not logged in.');
      return;
    }
    updateMutation.mutate(
      { updatedCategory: editingCategory, userId },
      {
        onSuccess: () => {
          setOpenEditModal(false);
          setEditingCategory(null);
        },
      }
    );
  };

  if (isAuthLoading || isLoading) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography mt={2}>Loading categories...</Typography>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6">
          Please log in to manage your categories.
        </Typography>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Error loading categories: {(error as Error)?.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold' }}
        >
          Manage Categories
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Customize your expense categories to better understand your spending
          patterns.
        </Typography>
      </Box>

      <Box mb={6}>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ fontWeight: 'bold' }}
        >
          Current Categories
        </Typography>
        {categories && (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 2,
              border: '1px solid #e0e0e0',
              maxHeight: 440,
              overflow: 'auto',
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', minWidth: '200px' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    Spending (Current Month)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', minWidth: '120px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <TableRow key={category.id} hover>
                      <Tooltip title={category.name} arrow>
                        <TableCell sx={{
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {category.name}
                        </TableCell>
                      </Tooltip>
                      <TableCell>{`$${category.spendingCurrentMonth.toFixed(2)}`}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => handleEdit(category)}
                            size="medium"
                            color="default"
                          >
                            <EditIcon fontSize="medium" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography color="text.secondary" py={2}>
                        No categories found. Add a new category below.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Box>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ fontWeight: 'medium' }}
        >
          Add New Category
        </Typography>
        <Box component="form" onSubmit={handleAddCategory}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid size={{ xs: 12, sm: 8, md: 4 }}>
              <TextField
                fullWidth
                label="Category Name"
                placeholder="e.g., DiningOut"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                disabled={addMutation.isPending}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={
                  addMutation.isPending || newCategoryName.trim() === ''
                }
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  textTransform: 'none',
                }}
              >
                {addMutation.isPending ? (
                  <CircularProgress size={24} />
                ) : (
                  'Add Category'
                )}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <Box sx={modalStyle} component="form" onSubmit={handleSaveEdit}>
          <Typography variant="h5" mb={2}>
            Edit Category
          </Typography>
          {updateMutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to update category.
            </Alert>
          )}
          <TextField
            fullWidth
            label="Category Name"
            value={editingCategory?.name || ''}
            onChange={(e) =>
              setEditingCategory(
                editingCategory
                  ? { ...editingCategory, name: e.target.value }
                  : null
              )
            }
            margin="normal"
            disabled={updateMutation.isPending}
          />
          <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
            <Button
              onClick={() => setOpenEditModal(false)}
              color="secondary"
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <CircularProgress size={24} />
              ) : (
                'Save Changes'
              )}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default CategoriesPage;
