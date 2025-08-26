import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import PublicOnlyRoute from './PublicOnlyRoute';
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

describe('PublicOnlyRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should render a loading spinner when loading is true', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: true });

    render(<PublicOnlyRoute />);

    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();

    const loadingText = screen.getByText('Checking authentication status...');
    expect(loadingText).toBeInTheDocument();
  });

  it('should redirect to the dashboard when a user is authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'test-user-id' },
      loading: false,
    });

    render(<PublicOnlyRoute />);

    const navigateElement = screen.getByTestId('navigate');
    expect(navigateElement).toBeInTheDocument();

    expect(navigateElement).toHaveAttribute('data-to', '/dashboard');
  });

  it('should render the outlet when no user is authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false });

    render(<PublicOnlyRoute />);

    const outletElement = screen.getByTestId('outlet');
    expect(outletElement).toBeInTheDocument();
  });
});
