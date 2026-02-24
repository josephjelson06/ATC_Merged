// Plan domain entity — pure TypeScript, no framework dependencies

export interface PlanData {
  id: string;
  name: string;
  price: number;
  period_months?: number;
  max_users?: number;
  max_roles?: number;
  max_rooms?: number;
  is_archived?: boolean;
}
