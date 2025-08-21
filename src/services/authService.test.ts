import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginUser, signupUser } from './authService';

vi.mock('@/config/api', () => ({
  API_ENDPOINTS: {
    USERS: 'http://localhost:3000/users',
  },
}));

vi.spyOn(crypto, 'randomUUID').mockReturnValue('mock-uuid-123');

describe('Auth Service', () => {
  const mockUsers = [
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

  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    fetchSpy = vi.spyOn(global, 'fetch');
  });

  describe('loginUser', () => {
    it('should successfully log in a user with correct credentials', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsers),
      } as Response);

      const user = await loginUser('test@example.com', 'password123');
      expect(user).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      });
      expect(fetchSpy).toHaveBeenCalledWith('http://localhost:3000/users');
    });

    it('should throw an error for invalid email or password', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsers),
      } as Response);

      await expect(loginUser('test@example.com', 'wrongpass')).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should throw a network error if the user fetch fails', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      await expect(
        loginUser('test@example.com', 'password123')
      ).rejects.toThrow('Network error during user fetch');
    });
  });

  describe('signupUser', () => {
    it('should successfully sign up a new user with a unique email', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'mock-uuid-123',
            email: 'new@example.com',
            password: 'newpass',
            name: 'New User',
          }),
      } as Response);

      const newUser = await signupUser(
        'new@example.com',
        'newpass',
        'New User'
      );
      expect(newUser).toEqual({
        id: 'mock-uuid-123',
        email: 'new@example.com',
        name: 'New User',
      });

      expect(fetchSpy).toHaveBeenCalledTimes(2);

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3000/users?email=new@example.com'
      );

      const lastCallArgs = fetchSpy.mock.calls[1];
      expect(lastCallArgs[0]).toBe('http://localhost:3000/users');
      const body = JSON.parse(lastCallArgs[1]?.body as string);
      expect(body.id).toEqual(expect.any(String));
      expect(body.email).toEqual('new@example.com');
      expect(body.password).toEqual('newpass');
      expect(body.name).toEqual('New User');
    });

    it('should throw an error if the email already exists', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ email: 'test@example.com' }]),
      } as Response);

      await expect(
        signupUser('test@example.com', 'somepass', 'Another User')
      ).rejects.toThrow('User with this email already exists');
    });

    it('should throw a network error if the email check fails', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
      } as Response);

      await expect(
        signupUser('new@example.com', 'newpass', 'New User')
      ).rejects.toThrow('Network error during email check');
    });

    it('should throw an error if the user creation post fails', async () => {
      fetchSpy
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
        } as Response);

      await expect(
        signupUser('new@example.com', 'newpass', 'New User')
      ).rejects.toThrow('Failed to create user');
    });
  });
});
