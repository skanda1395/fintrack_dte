import React, { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  LinearProgress,
  Modal,
  Backdrop,
  Fade,
  IconButton,
  SelectChangeEvent,
} from '@mui/material';
import {
  Close,
  ShoppingCartOutlined,
  FastfoodOutlined,
  TvOutlined,
  DirectionsCarOutlined,
  LocalMallOutlined,
  AttachMoneyOutlined,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useBudgets, useAddBudget } from '@/hooks/budgetsQueries';
import { useCategories } from '@/hooks/categoriesQueries';
import { useTransactions } from '@/hooks/transactionsQueries';

const getCategoryIcon = (categoryName: string) => {
  const lowerCaseName = categoryName.toLowerCase();
  if (lowerCaseName.includes('food') || lowerCaseName.includes('dining')) {
    return <FastfoodOutlined color="action" />;
  }
  if (
    lowerCaseName.includes('shopping') ||
    lowerCaseName.includes('groceries')
  ) {
    return <ShoppingCartOutlined color="action" />;
  }
  if (lowerCaseName.includes('entertainment')) {
    return <TvOutlined color="action" />;
  }
  if (
    lowerCaseName.includes('transportation') ||
    lowerCaseName.includes('car')
  ) {
    return <DirectionsCarOutlined color="action" />;
  }
  if (lowerCaseName.includes('salary') || lowerCaseName.includes('income')) {
    return <AttachMoneyOutlined color="action" />;
  }
  return <LocalMallOutlined color="action" />;
};

interface BudgetProgressProps {
  spent: number;
  limit: number;
}

const BudgetProgress: React.FC<BudgetProgressProps> = ({ spent, limit }) => {
  const progress = (spent / limit) * 100;
  const isOverBudget = spent > limit;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(progress, 100)}
            sx={{
              height: 5,
              borderRadius: 5,
              '& .MuiLinearProgress-bar': {
                backgroundColor: isOverBudget ? 'error.main' : 'primary.main',
              },
            }}
          />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography
            variant="body2"
            color="text.secondary"
          >{`${Math.round(progress)}%`}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

interface MonthlyBudgetCardProps {
  icon: React.ReactNode;
  categoryName: string;
  remaining: number;
  limit: number;
  spent: number;
}

const MonthlyBudgetCard: React.FC<MonthlyBudgetCardProps> = ({
  icon,
  categoryName,
  remaining,
  limit,
  spent,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 2,
        flexDirection: 'row',
        gap: { xs: 1, sm: 2 },
      }}
    >
      <Box sx={{ mr: { sm: 2 }, display: 'flex', alignItems: 'center' }}>
        <Paper
          elevation={0}
          sx={{ p: 1, borderRadius: '50%', backgroundColor: '#f0f4f8' }}
        >
          {icon}
        </Paper>
      </Box>
      <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          {categoryName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Remaining: ${remaining.toFixed(2)}
        </Typography>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          maxWidth: { xs: '100%', sm: 200, md: 300 },
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <BudgetProgress spent={spent} limit={limit} />
        </Box>
      </Box>
    </Box>
  );
};

const BudgetsPage: React.FC = () => {
  const { user, loading: isAuthLoading } = useAuth();
  const userId = user?.id;

  const {
    data: budgets,
    isLoading: isBudgetsLoading,
    isError: isBudgetsError,
  } = useBudgets(userId);

  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useCategories(userId);

  const {
    data: transactions,
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
  } = useTransactions(userId);

  const addMutation = useAddBudget();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [formBudget, setFormBudget] = useState<{
    categoryId: string;
    limit: number;
  }>({
    categoryId: '',
    limit: 0,
  });

  const handleOpenAdd = () => {
    setOpenAddModal(true);
  };

  const handleCloseAdd = () => {
    setOpenAddModal(false);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBudget.categoryId || formBudget.limit <= 0 || !userId) {
      return;
    }

    addMutation.mutate(
      {
        newBudget: {
          categoryId: formBudget.categoryId,
          limit: formBudget.limit,
          spent: 0,
        },
        userId: userId,
      },
      {
        onSuccess: () => {
          handleCloseAdd();
          setFormBudget({ categoryId: '', limit: 0 });
        },
      }
    );
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string | number>
  ) => {
    const { name, value } = e.target;
    setFormBudget((prev) => ({
      ...prev,
      [name]: name === 'limit' ? parseFloat(value as string) : value,
    }));
  };

  const monthlyBudgetsWithDetails = useMemo(() => {
    if (!budgets || !categories || !transactions) return [];

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return budgets.map((budget) => {
      const category = categories.find((cat) => cat.id === budget.categoryId);
      const categoryName = category?.name || 'Uncategorized';

      const spent = transactions
        .filter((t) => {
          const transactionDate = new Date(t.date);
          return (
            t.categoryId === budget.categoryId &&
            t.type === 'expense' &&
            transactionDate >= currentMonthStart &&
            transactionDate <= currentMonthEnd
          );
        })
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      const remaining = budget.limit - spent;

      return {
        ...budget,
        remaining,
        spent,
        categoryName,
        period: `${currentMonthStart.toLocaleString('default', { month: 'short' })} ${currentMonthStart.getFullYear()} - Current`,
      };
    });
  }, [budgets, categories, transactions]);

  const availableCategories = useMemo(() => {
    if (!categories || !budgets) return [];
    const budgetCategoryIds = budgets.map((b) => b.categoryId);
    return categories.filter((cat) => !budgetCategoryIds.includes(cat.id));
  }, [categories, budgets]);

  // Dummy data for now
  const historicalBudgets = [
    {
      categoryName: 'Groceries',
      budgetAmount: 400.0,
      spent: 425.5,
      remaining: -25.5,
      period: 'Jul 2024 - Jul 2024',
    },
    {
      categoryName: 'Entertainment',
      budgetAmount: 100.0,
      spent: 85.0,
      remaining: 15.0,
      period: 'Jul 2024 - Jul 2024',
    },
    {
      categoryName: 'Transportation',
      budgetAmount: 150.0,
      spent: 120.75,
      remaining: 29.25,
      period: 'Jul 2024 - Jul 2024',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold' }}
        >
          Monthly Budgets
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Set and manage your monthly spending limits for different categories.
        </Typography>
      </Box>

      <Box mb={6}>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ fontWeight: 'bold', mb: 2 }}
        >
          Current Budgets
        </Typography>
        {isAuthLoading ||
        isBudgetsLoading ||
        isCategoriesLoading ||
        isTransactionsLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py={4}
          >
            <CircularProgress />
          </Box>
        ) : isBudgetsError || isCategoriesError || isTransactionsError ? (
          <Alert severity="error">
            Failed to load budgets or categories. Please try again.
          </Alert>
        ) : monthlyBudgetsWithDetails.length > 0 ? (
          <Box>
            {monthlyBudgetsWithDetails.map((budget) => (
              <Box key={budget.id} display="flex" alignItems="center">
                <Box flexGrow={1}>
                  <MonthlyBudgetCard
                    icon={getCategoryIcon(budget.categoryName)}
                    categoryName={budget.categoryName}
                    remaining={budget.remaining}
                    limit={budget.limit}
                    spent={budget.spent}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary" py={2} textAlign="center">
            No current budgets found. Click &quot;Add New Budget&quot; to set
            one.
          </Typography>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button variant="contained" color="primary" onClick={handleOpenAdd}>
            Add New Budget
          </Button>
        </Box>
      </Box>

      <Modal
        open={openAddModal}
        onClose={handleCloseAdd}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: { timeout: 500 },
        }}
      >
        <Fade in={openAddModal}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: 550 },
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
            component="form"
            onSubmit={handleAddSubmit}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography
                variant="h6"
                component="h2"
                sx={{ fontWeight: 'bold' }}
              >
                Set New Budget
              </Typography>
              <IconButton onClick={handleCloseAdd}>
                <Close />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="category-select-label">Category</InputLabel>
                <Select
                  labelId="category-select-label"
                  id="category-select"
                  name="categoryId"
                  value={formBudget.categoryId}
                  label="Category"
                  onChange={handleChange}
                >
                  {availableCategories.length > 0 ? (
                    availableCategories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled>
                      No categories available
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Spending Limit ($)"
                name="limit"
                type="number"
                value={formBudget.limit}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={
                    !formBudget.categoryId ||
                    formBudget.limit <= 0 ||
                    addMutation.isPending
                  }
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    textTransform: 'none',
                    width: '50%',
                  }}
                >
                  {addMutation.isPending ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Set Budget'
                  )}
                </Button>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Modal>

      <Box mt={6}>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ fontWeight: 'bold', mb: 2 }}
        >
          Historical Budgets
        </Typography>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ borderRadius: 2, border: '1px solid #e0e0e0', overflowX: 'auto' }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Budget Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Spent</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Remaining</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Period</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historicalBudgets.length > 0 ? (
                historicalBudgets.map((history, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{history.categoryName}</TableCell>
                    <TableCell>${history.budgetAmount.toFixed(2)}</TableCell>
                    <TableCell>${history.spent.toFixed(2)}</TableCell>
                    <TableCell>${history.remaining.toFixed(2)}</TableCell>
                    <TableCell>{history.period}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary" py={2}>
                      No historical budgets found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default BudgetsPage;
