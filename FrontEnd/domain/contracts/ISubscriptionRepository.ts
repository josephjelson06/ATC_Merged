import type { Subscription } from '../entities/Subscription';

export interface ISubscriptionRepository {
  getAll(): Promise<Subscription[]>;
  getById(id: string): Promise<Subscription | null>;
  update(id: string, data: Partial<Subscription>): Promise<Subscription>;
}
