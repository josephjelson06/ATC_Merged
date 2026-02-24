import { useState, useCallback } from 'react';
import type { Subscription } from '../../domain/entities/Subscription';
import { repositories } from '../../infrastructure/config/container';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await repositories.subscriptions.getAll();
      setSubscriptions(data);
    } catch (err) {
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSubscription = useCallback(async (id: string, data: Partial<Subscription>) => {
    setLoading(true);
    try {
      await repositories.subscriptions.update(id, data);
      await fetchSubscriptions();
    } catch (err) {
      setError('Failed to update subscription');
    } finally {
      setLoading(false);
    }
  }, [fetchSubscriptions]);

  return { subscriptions, loading, error, fetchSubscriptions, updateSubscription };
}
