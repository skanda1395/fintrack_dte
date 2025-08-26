import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';
import Header from './Header';

const mockLogout = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useLocation: vi.fn(() => ({ pathname: '/dashboard' })),
  };
});

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/components/ThemeToggle/ThemeToggleButton', () => ({
  default: () => <button>Theme Toggle</button>,
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme();
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </BrowserRouter>
  );
};

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login button when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      logout: mockLogout,
    });

    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const loginButton = screen.getByRole('link', {
      name: /Login to your account/i,
    });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveAttribute('href', '/login');
  });

  it('renders profile menu when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
      logout: mockLogout,
    });

    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const profileButton = screen.getByLabelText('open user profile menu');
    const loginButton = screen.queryByRole('link', { name: /login/i });

    expect(profileButton).toBeInTheDocument();
    expect(loginButton).not.toBeInTheDocument();
  });

  it('renders all desktop navigation links with correct paths', () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Test User' },
      logout: mockLogout,
    });

    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const expectedNavItems = [
      { name: /dashboard/i, path: '/dashboard' },
      { name: /transactions/i, path: '/transactions' },
      { name: /budgets/i, path: '/budgets' },
      { name: /categories/i, path: '/categories' },
      { name: /reports/i, path: '/reports' },
    ];

    expectedNavItems.forEach(({ name, path }) => {
      const navLink = screen.getByRole('link', { name });
      expect(navLink).toBeInTheDocument();
      expect(navLink).toHaveAttribute('href', path);
    });
  });

  it('opens profile dropdown and shows menu options when profile button is clicked', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Test User' },
      logout: mockLogout,
    });

    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const profileButton = screen.getByLabelText('open user profile menu');
    fireEvent.click(profileButton);

    await waitFor(() => {
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  it('calls logout function when logout menu item is clicked', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', name: 'Test User' },
      logout: mockLogout,
    });

    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const profileButton = screen.getByLabelText('open user profile menu');
    fireEvent.click(profileButton);

    const logoutMenuItem = screen.getByText('Logout');
    fireEvent.click(logoutMenuItem);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  it('correctly highlights the active navigation link', async () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' } });

    (useLocation as vi.Mock).mockReturnValue({ pathname: '/dashboard' });

    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
    const transactionsLink = screen.getByRole('link', { name: 'Transactions' });

    await waitFor(() => {
      expect(dashboardLink).toHaveStyle(
        `color: ${createTheme().palette.primary.main}`
      );
      ('bold');
      expect(dashboardLink).toHaveStyle('font-weight: 700');

      expect(transactionsLink).not.toHaveStyle('font-weight: 700');
    });
  });
});
