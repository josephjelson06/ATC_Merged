import type { PlanData } from '../entities/Plan';

export type PlanCreateInput = Omit<PlanData, 'id'>;
export type PlanUpdateInput = Partial<Omit<PlanData, 'id'>>;

export interface IPlanRepository {
  getAll(): Promise<PlanData[]>;
  getById(id: string): Promise<PlanData | null>;
  create(data: PlanCreateInput): Promise<PlanData>;
  update(id: string, data: PlanUpdateInput): Promise<PlanData>;
  delete(id: string): Promise<void>;
}
