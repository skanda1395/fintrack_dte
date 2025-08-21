import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfilePage from './ProfilePage';
import { useAuth } from '@/contexts/AuthContext';
import '@testing-library/jest-dom';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(() => null),
}));

describe('ProfilePage', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render a loading message when loading is true', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      loading: true,
    });

    render(<ProfilePage />);

    expect(screen.getByText('Loading user profile...')).toBeInTheDocument();
  });

  it("should display the user's profile information when logged in", () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: mockUser,
      loading: false,
    });

    render(<ProfilePage />);

    expect(screen.getByText(`Hello, ${mockUser.name}!`)).toBeInTheDocument();
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Edit Profile/i })
    ).toBeInTheDocument();
  });

  it('should display the first letter of the name in the avatar', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: mockUser,
      loading: false,
    });

    render(<ProfilePage />);

    const avatar = screen.getByText(mockUser.name.charAt(0).toUpperCase());
    expect(avatar).toBeInTheDocument();
  });

  it('should display the AccountCircleIcon when user name is not available', () => {
    const userWithoutName = { ...mockUser, name: null };
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: userWithoutName,
      loading: false,
    });

    render(<ProfilePage />);

    expect(screen.getByTestId('AccountCircleIcon')).toBeInTheDocument();
  });

  it('should call alert when the Edit Profile button is clicked', () => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      user: mockUser,
      loading: false,
    });

    const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<ProfilePage />);

    fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));

    expect(mockAlert).toHaveBeenCalledWith('Edit Profile (to be implemented');
    mockAlert.mockRestore();
  });
});
