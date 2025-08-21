import { Routes, Route } from 'react-router-dom';
import { Typography } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import LandingPage from '@/pages/LandingPage/LandingPage';
import LoginPage from '@/pages/LoginPage/LoginPage';
import Dashboard from '@/pages/Dashboard/Dashboard';
import Transactions from '@/pages/Transactions/Transactions';
import Categories from '@/pages/Categories/Categories';
import Budgets from '@/pages/Budgets/Budgets';
import Reports from '@/pages/Reports/Reports';
import MainLayout from '@/components/Layout/MainLayout';
import PublicOnlyRoute from '@/components/PublicOnlyRoute';
import PrivateRoute from '@/components/PrivateRoute';
import ProfilePage from '@/pages/ProfilePage/ProfilePage';
import { AuthProvider } from './contexts/AuthContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route path="/" element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="categories" element={<Categories />} />
              <Route path="budgets" element={<Budgets />} />
              <Route path="reports" element={<Reports />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route
            path="*"
            element={
              <Typography variant="h4" sx={{ mt: 4, textAlign: 'center' }}>
                404 - Page Not Found
              </Typography>
            }
          />
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
