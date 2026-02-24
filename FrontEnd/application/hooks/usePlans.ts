import { useState, useCallback } from 'react';
import type { PlanData } from '../../domain/entities/Plan';
import { repositories } from '../../infrastructure/config/container';

export function usePlans() {
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await repositories.plans.getAll();
      setPlans(data);
    } catch (err) {
      setError('Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPlan = async (data: Omit<PlanData, 'id'>) => {
    const newPlan = await repositories.plans.create(data);
    setPlans(prev => [...prev, newPlan]);
    return newPlan;
  };

  const updatePlan = async (id: string, data: Partial<PlanData>) => {
      const updated = await repositories.plans.update(id, data);
      setPlans(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
  }

  const deletePlan = async (id: string) => {
      await repositories.plans.delete(id);
      setPlans(prev => prev.filter(p => p.id !== id));
  }

  return { plans, loading, error, fetchPlans, createPlan, updatePlan, deletePlan };
}
