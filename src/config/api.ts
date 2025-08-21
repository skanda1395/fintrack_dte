import { firebaseApi } from './api/firebaseApiService';
import { localApi } from './api/localApiService';

const isDevelopment = import.meta.env.DEV;

export const apiService = isDevelopment ? localApi : firebaseApi;

export const API_ENDPOINTS = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  BUDGETS: 'budgets',
  CATEGORIES: 'categories',
};
