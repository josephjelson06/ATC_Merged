import { useState, useCallback } from 'react';
import type { Kiosk } from '../../domain/entities/Kiosk';
import { repositories } from '../../infrastructure/config/container';

export function useKiosks(tenantId: string) {
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKiosks = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await repositories.kiosks.getAll(tenantId);
      setKiosks(data);
    } catch { setError('Failed to fetch kiosks'); }
    finally { setLoading(false); }
  }, [tenantId]);

  const registerKiosk = async (name: string) => {
    const created = await repositories.kiosks.register(tenantId, { name });
    setKiosks((prev) => [...prev, created]);
    return created;
  };

  const updateKiosk = async (id: string, data: { name?: string; firmwareVersion?: string; status?: string }) => {
    const updated = await repositories.kiosks.update(tenantId, id, data);
    setKiosks((prev) => prev.map((k) => (k.id === id ? updated : k)));
    return updated;
  };

  return {
    kiosks, loading, error,
    fetchKiosks, registerKiosk, updateKiosk,
  };
}
