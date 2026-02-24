import { useState, useCallback } from 'react';
import type { Tenant } from '../../domain/entities/Tenant';
import { repositories } from '../../infrastructure/config/container';

export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await repositories.tenants.getAll();
      setTenants(data);
    } catch (err) {
      setError('Failed to fetch tenants');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTenant = async (data: Omit<Tenant, 'id'>) => {
    try {
      const newTenant = await repositories.tenants.create(data);
      setTenants((prev) => [...prev, newTenant]);
      return newTenant;
    } catch (err) {
      throw new Error('Failed to create tenant');
    }
  };

  const updateTenant = async (id: string, data: Partial<Tenant>) => {
    try {
      const updated = await repositories.tenants.update(id, data);
      setTenants((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err) {
       throw new Error('Failed to update tenant');
    }
  };

  const deleteTenant = async (id: string) => {
      try {
          await repositories.tenants.delete(id);
          setTenants((prev) => prev.filter(t => t.id !== id));
      } catch (err) {
          throw new Error('Failed to delete tenant');
      }
  }

  const getTenant = useCallback((id: string) => repositories.tenants.getById(id), []);

  return {
    tenants,
    loading,
    error,
    fetchTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    getTenant
  };
}
