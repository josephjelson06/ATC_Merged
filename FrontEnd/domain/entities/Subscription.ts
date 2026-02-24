// Subscription domain entity

export type SubscriptionStatus = 'Active' | 'Expiring Soon' | 'Expired' | 'Cancelled' | 'Suspended';

export interface Subscription {
  id: string;
  tenantId: string;
  planId?: string;
  startDate?: string;
  endDate?: string;
  status: SubscriptionStatus | string;
}
