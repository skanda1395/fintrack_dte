import React, { useMemo } from 'react';
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
  Grid,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/hooks/transactionsQueries';
import { useCategories } from '@/hooks/categoriesQueries';
import { Transaction } from '@/interfaces/interfaces';

const DashboardPage: React.FC = () => {
  const { user, loading: isAuthLoading } = useAuth();
  const userId = user?.id;

  const {
    data: transactions,
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
  } = useTransactions(userId);

  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useCategories(userId);

  const {
    totalIncome,
    totalExpenses,
    savings,
    spendingByCategoryChartData,
    recentTransactions,
  } = useMemo(() => {
    if (!transactions || !categories) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        savings: 0,
        spendingByCategoryChartData: [],
        recentTransactions: [],
      };
    }

    // Filter transactions for the current month
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

    const currentMonthTransactions = transactions.filter((t: Transaction) => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate >= currentMonthStart &&
        transactionDate <= currentMonthEnd
      );
    });

    // Calculate totals for the current month
    const income = currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate spending by category for the current month
    const categorySpending = new Map<string, number>();

    currentMonthTransactions.forEach((t) => {
      if (t.type === 'expense') {
        const currentTotal = categorySpending.get(t.categoryId) || 0;
        categorySpending.set(t.categoryId, currentTotal + t.amount);
      }
    });

    const chartData = Array.from(categorySpending.entries()).map(
      ([categoryId, total]) => {
        const categoryName =
          categories.find((cat) => cat.id === categoryId)?.name ||
          'Uncategorized';
        return {
          name: categoryName,
          value: total,
        };
      }
    );

    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const recent = sortedTransactions.slice(0, 5);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      savings: income - expenses,
      spendingByCategoryChartData: chartData,
      recentTransactions: recent,
    };
  }, [transactions, categories]);

  const isLoading =
    isAuthLoading || isTransactionsLoading || isCategoriesLoading;
  const isError = isTransactionsError || isCategoriesError;

  if (isLoading) {
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
          Failed to load dashboard data. Please try again.
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
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your financial snapshot at a glance.
        </Typography>
      </Box>

      <Grid container spacing={3} mb={6}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 2, bgcolor: '#E5E8F5' }}
          >
            <Typography variant="body1" color="text.secondary" mb={1}>
              Current Month Income
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              ${totalIncome.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 2, bgcolor: '#E5E8F5' }}
          >
            <Typography variant="body1" color="text.secondary" mb={1}>
              Current Month Expenses
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              ${totalExpenses.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 2, bgcolor: '#E5E8F5' }}
          >
            <Typography variant="body1" color="text.secondary" mb={1}>
              Current Month Savings
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              ${savings.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box mb={6}>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ fontWeight: 'bold' }}
          mb={3}
        >
          Spending by Category (Current Month)
        </Typography>
        <Paper
          elevation={0}
          sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="body1" color="text.secondary">
              Total Expenses
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              ${totalExpenses.toFixed(2)}
            </Typography>
          </Box>
          <ResponsiveContainer
            width="100%"
            height={300}
            aria-label="Bar chart showing spending by category for the current month."
          >
            <BarChart data={spendingByCategoryChartData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      <Box>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ fontWeight: 'bold' }}
          mb={3}
        >
          Recent Transactions
        </Typography>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}
        >
          <Table>
            <caption style={{ position: 'absolute', clip: 'rect(0 0 0 0)' }}>
              A list of the 5 most recent transactions.
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
                <TableCell sx={{ fontWeight: 'bold' }} scope="col">
                  Amount
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => {
                  const category = categories?.find(
                    (c) => c.id === transaction.categoryId
                  );
                  return (
                    <TableRow key={transaction.id} hover>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{category?.name || 'Uncategorized'}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell
                        sx={{
                          color:
                            transaction.type === 'income' ? 'green' : 'red',
                          fontWeight: 'bold',
                        }}
                      >
                        {transaction.type === 'expense' ? '-' : ''}$
                        {transaction.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="text.secondary" py={2}>
                      No recent transactions found.
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

export default DashboardPage;
