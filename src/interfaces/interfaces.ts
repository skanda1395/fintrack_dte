export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Transaction {
  id: string;
  categoryId: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  userId: string;
}

export interface Category {
  id: string;
  name: string;
  spendingCurrentMonth: number;
  userId: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  limit: number;
  spent: number;
  userId: string;
}
