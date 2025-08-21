import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './LoginPage';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

beforeEach(() => {
  (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
    login: vi.fn(),
    signup: vi.fn(),
    loading: false,
    user: null,
  });

  (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(vi.fn());
});

describe('LoginPage', () => {
  it('should render the login form by default', () => {
    render(<LoginPage />);

    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign up/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(/confirm password/i)
    ).not.toBeInTheDocument();
  });

  it('should switch to the signup form when the "Sign Up" button is clicked', async () => {
    render(<LoginPage />);

    const toggleButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(toggleButton);

    expect(screen.getByText('Join FinTrack Today')).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /sign up/i, exact: true })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should call login and navigate to dashboard on successful login', async () => {
    const mockLogin = vi.fn().mockResolvedValue(true);
    const mockNavigate = vi.fn();
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      login: mockLogin,
      signup: vi.fn(),
      loading: false,
      user: null,
    });
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      expect(
        screen.getByText('Login successful! Redirecting...')
      ).toBeInTheDocument();
    });
  });

  it('should call signup and navigate to dashboard on successful signup', async () => {
    const mockSignup = vi.fn().mockResolvedValue(true);
    const mockNavigate = vi.fn();
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      login: vi.fn(),
      signup: mockSignup,
      loading: false,
      user: null,
    });
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);

    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'New User' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'newuser@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'securepassword' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'securepassword' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /sign up/i, exact: true })
    );

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith(
        'newuser@example.com',
        'securepassword',
        'New User'
      );
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      expect(
        screen.getByText('Signup successful! Redirecting to dashboard...')
      ).toBeInTheDocument();
    });
  });
});
