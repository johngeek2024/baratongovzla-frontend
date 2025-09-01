// src/app/features/admin/models/customer.model.ts

export type CustomerStatus = 'vip' | 'recurring' | 'at-risk' | 'new';

export interface CustomerEvent {
  type: 'purchase' | 'support' | 'review' | 'account';
  id: string;
  date: string;
  title: string;
  description: string;
  amount?: number;
  status?: string;
}

export interface PurchaseHistoryItem {
  id: string;
  date: string;
  amount: number;
  status: string;
}

export interface AdminCustomerDetails {
  id: number;
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
  lastActivity: string;
  purchaseHistory: number[];
  accountCreated: string;
  whatsapp: string;
  address: string;
  status: CustomerStatus;
  events: CustomerEvent[];
}
