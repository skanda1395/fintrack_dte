import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import PrivateRoute from './PrivateRoute';
import { useAuth } from '@/contexts/AuthContext';
vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => <div data-testid="navigate" data-to={to} />),
  Outlet: () => <div data-testid="outlet" />,
}));
vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

describe('PrivateRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should redirect to the login page when not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false });

    render(<PrivateRoute />);

    const navigateElement = screen.getByTestId('navigate');
    expect(navigateElement).toBeInTheDocument();
    expect(navigateElement).toHaveAttribute('data-to', '/login');
  });

  it('should render the outlet when authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'test-user-id' },
      loading: false,
    });

    render(<PrivateRoute />);

    const outletElement = screen.getByTestId('outlet');
    expect(outletElement).toBeInTheDocument();
  });
});
