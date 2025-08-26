import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginUser, signupUser } from './authService';
import { apiService, API_ENDPOINTS } from '@/config/api';

vi.mock('@/config/api');

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthUser extends User {
  password?: string;
}

const mockApiService = apiService as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
};

describe('Auth Service', () => {
  const mockUsers: AuthUser[] = [
    {
      id: '1',
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    },
    {
      id: '2',
      email: 'john@example.com',
      password: 'securepass',
      name: 'John Doe',
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('loginUser', () => {
    it('should successfully log in a user with correct credentials', async () => {
      mockApiService.get.mockResolvedValueOnce(mockUsers);

      const user = await loginUser('test@example.com', 'password123');
      expect(user).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      });
      expect(mockApiService.get).toHaveBeenCalledWith(API_ENDPOINTS.USERS);
    });

    it('should throw an error for invalid email or password', async () => {
      mockApiService.get.mockResolvedValueOnce(mockUsers);

      await expect(loginUser('test@example.com', 'wrongpass')).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should throw an error if the user fetch fails', async () => {
      mockApiService.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        loginUser('test@example.com', 'password123')
      ).rejects.toThrow('Network error');
    });
  });

  describe('signupUser', () => {
    it('should successfully sign up a new user with a unique email', async () => {
      mockApiService.get.mockResolvedValueOnce([]);
      mockApiService.post.mockResolvedValueOnce({
        id: 'mock-uuid-123',
        email: 'new@example.com',
        password: 'newpass',
        name: 'New User',
      });

      const newUser = await signupUser(
        'new@example.com',
        'newpass',
        'New User'
      );
      expect(newUser).toEqual({
        id: expect.any(String),
        email: 'new@example.com',
        name: 'New User',
      });

      expect(mockApiService.get).toHaveBeenCalledWith(API_ENDPOINTS.USERS);
      expect(mockApiService.post).toHaveBeenCalledWith(API_ENDPOINTS.USERS, {
        id: expect.any(String),
        email: 'new@example.com',
        password: 'newpass',
        name: 'New User',
      });
    });

    it('should throw an error if the email already exists', async () => {
      mockApiService.get.mockResolvedValueOnce(mockUsers);

      await expect(
        signupUser('test@example.com', 'somepass', 'Another User')
      ).rejects.toThrow('User with this email already exists');
    });

    it('should throw an error if the email check fails', async () => {
      mockApiService.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        signupUser('new@example.com', 'newpass', 'New User')
      ).rejects.toThrow('Network error');
    });
  });
});
