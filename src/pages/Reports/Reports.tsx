import React, { useState, useMemo, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Button,
  CircularProgress,
  Alert,
  TextField,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Download as DownloadIcon,
  LocalPrintshopOutlined as LocalPrintshopOutlinedIcon,
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/hooks/transactionsQueries';
import { useCategories } from '@/hooks/categoriesQueries';
import { capitalise } from '@/utils';
import { Transaction } from '@/interfaces/interfaces';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
];

interface TooltipPayloadData {
  name: string;
  value: number;
  percent?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: TooltipPayloadData;
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percent = data.percent !== undefined ? data.percent : 0;
    return (
      <Paper elevation={3} sx={{ p: 1, borderRadius: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {data.name}
        </Typography>
        <Typography variant="body2" color="primary">
          {`Spending: $${data.value.toFixed(2)}`}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {`Percentage: ${(percent * 100).toFixed(2)}%`}
        </Typography>
      </Paper>
    );
  }
  return null;
};

const ReportsPage: React.FC = () => {
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

  const [activeTab, setActiveTab] = useState('monthlySummary');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const reportTableRef = useRef<HTMLDivElement>(null);

  const {
    monthlySpendingData,
    spendingByCategoryData,
    spendingBreakdownTableData,
    filteredSpendingByCategoryData,
    filteredSpendingBreakdownTableData,
    totalExpenses,
    filteredTransactions,
    filteredTotalExpenses,
  } = useMemo(() => {
    if (!transactions || !categories) {
      return {
        monthlySpendingData: [],
        spendingByCategoryData: [],
        spendingBreakdownTableData: [],
        filteredSpendingByCategoryData: [],
        filteredSpendingBreakdownTableData: [],
        totalExpenses: 0,
        filteredTransactions: [],
        filteredTotalExpenses: 0,
      };
    }

    const allExpenseTransactions = transactions.filter(
      (t) => t.type === 'expense'
    );

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const dateFilteredTransactions = allExpenseTransactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        (!start || transactionDate >= start) && (!end || transactionDate <= end)
      );
    });

    const totalExp = allExpenseTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );
    const filteredTotalExp = dateFilteredTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    const monthlyDataMap = new Map<string, number>();
    allExpenseTransactions.forEach((t) => {
      const date = new Date(t.date);
      const monthYear = date.toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });
      const currentTotal = monthlyDataMap.get(monthYear) || 0;
      monthlyDataMap.set(monthYear, currentTotal + t.amount);
    });
    const monthlyData = Array.from(monthlyDataMap.entries()).map(
      ([month, total]) => ({
        name: month,
        total,
      })
    );

    const categoryDataMap = new Map<string, number>();
    allExpenseTransactions.forEach((t) => {
      const currentTotal = categoryDataMap.get(t.categoryId) || 0;
      categoryDataMap.set(t.categoryId, currentTotal + t.amount);
    });
    const categoryData = Array.from(categoryDataMap.entries()).map(
      ([categoryId, total]) => {
        const categoryName =
          categories.find((c) => c.id === categoryId)?.name || 'Uncategorized';
        return {
          name: categoryName,
          value: total,
        };
      }
    );

    const breakdownTableData = Array.from(categoryDataMap.entries()).map(
      ([categoryId, amount]) => {
        const category =
          categories.find((c) => c.id === categoryId)?.name || 'Uncategorized';
        const percentage = totalExp > 0 ? (amount / totalExp) * 100 : 0;
        return {
          category,
          amount,
          percentage: percentage.toFixed(2),
        };
      }
    );

    const filteredCategoryDataMap = new Map<string, number>();
    dateFilteredTransactions.forEach((t: Transaction) => {
      const currentTotal = filteredCategoryDataMap.get(t.categoryId) || 0;
      filteredCategoryDataMap.set(t.categoryId, currentTotal + t.amount);
    });
    const filteredCategoryData = Array.from(
      filteredCategoryDataMap.entries()
    ).map(([categoryId, total]) => {
      const categoryName =
        categories.find((c) => c.id === categoryId)?.name || 'Uncategorized';
      return {
        name: categoryName,
        value: total,
      };
    });

    const filteredBreakdownTableData = Array.from(
      filteredCategoryDataMap.entries()
    ).map(([categoryId, amount]) => {
      const category =
        categories.find((c) => c.id === categoryId)?.name || 'Uncategorized';
      const percentage =
        filteredTotalExp > 0 ? (amount / filteredTotalExp) * 100 : 0;
      return {
        category,
        amount,
        percentage: percentage.toFixed(2),
      };
    });

    return {
      monthlySpendingData: monthlyData,
      spendingByCategoryData: categoryData,
      spendingBreakdownTableData: breakdownTableData,
      filteredSpendingByCategoryData: filteredCategoryData,
      filteredSpendingBreakdownTableData: filteredBreakdownTableData,
      totalExpenses: totalExp,
      filteredTransactions: dateFilteredTransactions,
      filteredTotalExpenses: filteredTotalExp,
    };
  }, [transactions, categories, startDate, endDate]);

  const isLoading =
    isAuthLoading || isTransactionsLoading || isCategoriesLoading;
  const isError = isTransactionsError || isCategoriesError;

  const exportToCsv = () => {
    if (!filteredTransactions || filteredTransactions.length === 0) {
      console.log('No data to export.');
      return;
    }

    const headers = ['Date', 'Category', 'Description', 'Amount', 'Type'];
    const rows = filteredTransactions.map((t) => {
      const categoryName =
        categories?.find((c) => c.id === t.categoryId)?.name || 'Uncategorized';
      return [
        `"${t.date}"`,
        `"${categoryName}"`,
        `"${t.description}"`,
        `"${t.amount}"`,
        `"${t.type}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transactions_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePdfExport = () => {
    if (reportTableRef.current) {
      html2canvas(reportTableRef.current).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Transactions_Report_${startDate}_to_${endDate}.pdf`);
      });
    }
  };

  const renderInsightCard = (title: string, value: string) => (
    <Paper
      elevation={0}
      sx={{ p: 2, borderRadius: 2, bgcolor: '#fff', height: '100%' }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
    </Paper>
  );

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
          Failed to load reports data. Please try again.
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
          Reports
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Analyze your spending habits with detailed reports.
        </Typography>
      </Box>

      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
        }}
        mb={4}
      >
        <Button
          onClick={() => setActiveTab('monthlySummary')}
          sx={{
            minWidth: 'auto',
            borderRadius: '4px 4px 0 0',
            borderBottom: activeTab === 'monthlySummary' ? '2px solid' : 'none',
            borderColor: 'primary.main',
            color: activeTab === 'monthlySummary' ? 'primary.main' : 'text.secondary',
            textTransform: 'none',
          }}
        >
          Monthly Summary
        </Button>
        <Button
          onClick={() => setActiveTab('categoryBreakdown')}
          sx={{
            minWidth: 'auto',
            borderRadius: '4px 4px 0 0',
            borderBottom: activeTab === 'categoryBreakdown' ? '2px solid' : 'none',
            borderColor: 'primary.main',
            color: activeTab === 'categoryBreakdown' ? 'primary.main' : 'text.secondary',
            textTransform: 'none',
          }}
        >
          Category Breakdown
        </Button>
        <Button
          onClick={() => setActiveTab('customReport')}
          sx={{
            minWidth: 'auto',
            borderRadius: '4px 4px 0 0',
            borderBottom: activeTab === 'customReport' ? '2px solid' : 'none',
            borderColor: 'primary.main',
            color: activeTab === 'customReport' ? 'primary.main' : 'text.secondary',
            textTransform: 'none',
          }}
        >
          Custom Report
        </Button>
      </Box>

      {activeTab === 'monthlySummary' && (
        <Box>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 3 }}
          >
            Monthly Summary
          </Typography>

          <Grid container spacing={4} mb={6}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}
              >
                <Box mb={2}>
                  <Typography id="monthly-spending-title" variant="body1" color="text.secondary">
                    Total Spending Over Time
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    ${totalExpenses.toFixed(2)}
                  </Typography>
                </Box>
                <p className="visually-hidden" id="monthly-spending-description">
                  This line chart shows total expenses by month. The total spending over all periods is ${totalExpenses.toFixed(2)}. The chart shows a trend of spending over time, with each data point representing a month.
                </p>
                <div role="img" aria-labelledby="monthly-spending-title" aria-describedby="monthly-spending-description">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={monthlySpendingData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => `$${value.toFixed(2)}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#8884d8"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}
              >
                <Box mb={2}>
                  <Typography id="spending-by-category-title" variant="body1" color="text.secondary">
                    Spending by Category
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    ${totalExpenses.toFixed(2)}
                  </Typography>
                </Box>
                <p className="visually-hidden" id="spending-by-category-description">
                  This bar chart shows total spending broken down by category. The chart is a visual representation of the data found in the &apos;Spending Breakdown&apos; table below.
                </p>
                <div role="img" aria-labelledby="spending-by-category-title" aria-describedby="spending-by-category-description">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={spendingByCategoryData}>
                      <XAxis dataKey="name" />
                      <Tooltip
                        formatter={(value: number) => `$${value.toFixed(2)}`}
                      />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Paper>
            </Grid>
          </Grid>

          <Box mb={4}>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
              marginBottom={2}
            >
              Key Insights
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                {renderInsightCard(
                  'Total Spent',
                  `$${totalExpenses.toFixed(2)}`
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                {renderInsightCard(
                  'Average Monthly Spending',
                  `$${(totalExpenses / monthlySpendingData.length).toFixed(2)}`
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                {renderInsightCard(
                  'Highest Spending Category',
                  spendingByCategoryData.length > 0
                    ? `${spendingByCategoryData.reduce((prev, current) => (prev.value > current.value ? prev : current)).name} ($${spendingByCategoryData.reduce((prev, current) => (prev.value > current.value ? prev : current)).value.toFixed(2)})`
                    : 'N/A'
                )}
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
              marginBottom={2}
            >
              Spending Breakdown
            </Typography>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}
            >
              <Table>
                <caption className="visually-hidden">
                  A table showing the breakdown of all spending by category, including the total amount and percentage of all time expenses.
                </caption>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }} scope="col">Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} scope="col">Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} scope="col">
                      Percentage
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {spendingBreakdownTableData.length > 0 ? (
                    spendingBreakdownTableData.map((row, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>${row.amount.toFixed(2)}</TableCell>
                        <TableCell>{row.percentage}%</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography color="text.secondary" py={2}>
                          No spending data found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      )}

      {activeTab === 'categoryBreakdown' && (
        <Box>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 3 }}
          >
            Category Breakdown
          </Typography>
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', mb: 4 }}
          >
            <Grid container spacing={3} alignItems="flex-end">
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  id="category-breakdown-start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  id="category-breakdown-end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Paper>
          <Grid container spacing={4} mb={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                  height: '100%',
                }}
              >
                <Box mb={2}>
                  <Typography id="pie-chart-title" variant="body1" color="text.secondary">
                    Spending by Category
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    ${filteredTotalExpenses.toFixed(2)}
                  </Typography>
                </Box>
                <p className="visually-hidden" id="pie-chart-description">
                  This pie chart shows the percentage breakdown of spending by category for the selected date range.
                  The total spending is ${filteredTotalExpenses.toFixed(2)}.
                </p>
                {filteredSpendingByCategoryData.length > 0 ? (
                  <div role="img" aria-labelledby="pie-chart-title" aria-describedby="pie-chart-description">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={filteredSpendingByCategoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          labelLine={false}
                          label={({ name, percent }) =>
                            percent !== undefined
                              ? `${name} ${(percent * 100).toFixed(0)}%`
                              : name
                          }
                        >
                          {filteredSpendingByCategoryData.map((_entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <Box
                    sx={{
                      height: 250,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography color="text.secondary">
                      No spending data to display for the selected date range.
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                  height: '100%',
                }}
              >
                <Box mb={2}>
                  <Typography id="top-spending-bar-chart-title" variant="body1" color="text.secondary">
                    Top Spending Categories
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Visualizing your top expenses
                  </Typography>
                </Box>
                <p className="visually-hidden" id="top-spending-bar-chart-description">
                  This bar chart shows the top 5 spending categories for the selected date range, ranked from highest to lowest.
                </p>
                <div role="img" aria-labelledby="top-spending-bar-chart-title" aria-describedby="top-spending-bar-chart-description">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={filteredSpendingByCategoryData
                        .slice()
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 5)}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Paper>
            </Grid>
          </Grid>
          <Box>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
              marginBottom={2}
            >
              Detailed Breakdown
            </Typography>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}
            >
              <Table>
                <caption className="visually-hidden">
                  A detailed table showing the spending breakdown for each category within the selected date range.
                </caption>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }} scope="col">Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} scope="col">Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} scope="col">
                      Percentage
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSpendingBreakdownTableData.length > 0 ? (
                    filteredSpendingBreakdownTableData.map((row, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>${row.amount.toFixed(2)}</TableCell>
                        <TableCell>{row.percentage}%</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography color="text.secondary" py={2}>
                          No spending data found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      )}

      {activeTab === 'customReport' && (
        <Box>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 3 }}
          >
            Custom Report
          </Typography>

          <Grid container spacing={2} alignItems="flex-end" mb={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                id="custom-report-start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                id="custom-report-end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={exportToCsv}
                fullWidth
              >
                Export CSV
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<LocalPrintshopOutlinedIcon />}
                onClick={handlePdfExport}
                fullWidth
              >
                Print / PDF
              </Button>
            </Grid>
          </Grid>

          <Box>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
              marginBottom={2}
            >
              Filtered Transactions
            </Typography>
            <div ref={reportTableRef}>
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}
              >
                <Table>
                  <caption className="visually-hidden">
                    A table of all transactions filtered by the selected date range.
                  </caption>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }} scope="col">Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} scope="col">
                        Category
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} scope="col">
                        Description
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} scope="col">Amount</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }} scope="col">Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction) => {
                        const category = categories?.find(
                          (c) => c.id === transaction.categoryId
                        );
                        return (
                          <TableRow key={transaction.id} hover>
                            <TableCell>{transaction.date}</TableCell>
                            <TableCell>
                              {category?.name || 'Uncategorized'}
                            </TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>
                              ${transaction.amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {capitalise(transaction.type)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary" py={2}>
                            No transactions found for this date range.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default ReportsPage;
