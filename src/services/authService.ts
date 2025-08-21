import { apiService, API_ENDPOINTS } from '@/config/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthUser extends User {
  password?: string;
}

export const loginUser = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const usersData = await apiService.get(API_ENDPOINTS.USERS);
    const users = usersData ? (Object.values(usersData) as AuthUser[]) : [];

    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      const userToReturn: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
      };
      return userToReturn;
    }
    throw new Error('Invalid email or password');
  } catch (error) {
    console.error('Login service error:', error);
    throw error;
  }
};

export const signupUser = async (
  email: string,
  password: string,
  name: string
): Promise<User> => {
  try {
    const usersData = await apiService.get(API_ENDPOINTS.USERS);
    const existingUsers = usersData
      ? (Object.values(usersData) as AuthUser[])
      : [];

    if (existingUsers.some((u) => u.email === email)) {
      throw new Error('User with this email already exists');
    }

    const newUser = { id: crypto.randomUUID(), email, password, name };
    await apiService.post(API_ENDPOINTS.USERS, newUser);

    const userToReturn: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };
    return userToReturn;
  } catch (error) {
    console.error('Signup service error:', error);
    throw error;
  }
};
