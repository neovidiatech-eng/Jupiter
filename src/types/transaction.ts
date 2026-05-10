import { SubscriptionRequest } from "./subscription";

export type TransactionType = 'credit' | 'subscription' | 'debit';
export type TransactionStatus = 'completed' | 'pending' | 'failed';

export interface Wallet {
  id: string;
  type: string; 
  ownerId: string | null;
  balance: number;
  currencyId: string;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  reason: string;
  subscriptionId: string | null;
  expenseId: string | null;
  createdAt: string;
  wallet: Wallet;
  subscription: SubscriptionRequest; 
}

export interface WalletHistoryResponse {
  message: string;
  status: number;
  lang: 'ar' | 'en';
  data: Transaction[];
}

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type AuthProvider = 'local' | 'google' | 'facebook';

export interface WithdrawalTeacher {
  id: string;
  email: string;
  name: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  confirmAt: string | null;
  roleId: string;
  code_country: string;
  status: string;
  googleId: string | null;
  provider: AuthProvider;
  password?: string;
}

export interface WithdrawalRequest {
  id: string;
  teacherId: string;
  amount: number;
  status: WithdrawalStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  teacher: WithdrawalTeacher;
}

export interface WithdrawalApiResponse {
  message: string;
  status: number;
  lang: string;
  data: {
    withdrawals: WithdrawalRequest[];
  };
}