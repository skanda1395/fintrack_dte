import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { loginUser, signupUser } from '@/services/authService';
import { User } from '@/interfaces/interfaces';

// Mock the external service calls to isolate the component logic.
vi.mock('@/services/authService', () => ({
  loginUser: vi.fn(),
  signupUser: vi.fn(),
}));

// Mock the useNavigate hook from react-router-dom.
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...mod,
    useNavigate: () => mockNavigate,
  };
});

// Mock sessionStorage to control its state during tests.
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
});

describe('useAuth', () => {
  it('should throw an error when used outside of AuthProvider', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider'
    );
    consoleErrorSpy.mockRestore();
  });
});

describe('AuthProvider', () => {
  const mockUser: User = {
    id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorageMock.clear();
  });

  it('should initialize with user null and set loading to false', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toBe(null);
    expect(sessionStorageMock.getItem).toHaveBeenCalledWith('currentUser');
  });

  it('should load a user from sessionStorage on initial render', async () => {
    sessionStorageMock.setItem('currentUser', JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toEqual(mockUser);
    expect(sessionStorageMock.getItem).toHaveBeenCalledWith('currentUser');
  });

  it('should log in a user successfully, set state, and store in sessionStorage', async () => {
    vi.mocked(loginUser).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginResult = false;
    await act(async () => {
      loginResult = await result.current.login(
        'test@example.com',
        'password123'
      );
    });

    expect(loginResult).toBe(true);
    expect(loginUser).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(result.current.user).toEqual(mockUser);
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      'currentUser',
      JSON.stringify(mockUser)
    );
  });

  it('should handle login failure and return false', async () => {
    vi.mocked(loginUser).mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginResult = true;
    await act(async () => {
      loginResult = await result.current.login(
        'wrong@example.com',
        'wrongpass'
      );
    });

    expect(loginResult).toBe(false);
    expect(result.current.user).toBe(null);
    expect(sessionStorageMock.setItem).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('should sign up a user successfully, set state, and store in sessionStorage', async () => {
    const mockNewUser = { ...mockUser, name: 'New User' };
    vi.mocked(signupUser).mockResolvedValue(mockNewUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    let signupResult = false;
    await act(async () => {
      signupResult = await result.current.signup(
        'new@example.com',
        'pass123',
        'New User'
      );
    });

    expect(signupResult).toBe(true);
    expect(signupUser).toHaveBeenCalledWith(
      'new@example.com',
      'pass123',
      'New User'
    );
    expect(result.current.user).toEqual(mockNewUser);
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
      'currentUser',
      JSON.stringify(mockNewUser)
    );
  });

  it('should log out a user, remove from sessionStorage, and navigate to /login', async () => {
    sessionStorageMock.setItem('currentUser', JSON.stringify(mockUser));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user).toEqual(mockUser));

    await act(async () => {
      result.current.logout();
    });

    expect(result.current.user).toBe(null);
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('currentUser');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
