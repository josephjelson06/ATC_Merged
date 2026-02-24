// Tenant domain entity
export type TenantStatus = 'Active' | 'Suspended' | 'Onboarding' | 'Past Due';

export interface Tenant {
  id: string;
  name: string; // mapped from hotel_name
  address?: string;
  planId?: string; // mapped from plan_id
  ownerId?: string; // mapped from owner_user_id
  gstin?: string;
  pan?: string;
  status?: TenantStatus | string;
}
