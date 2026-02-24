import { useState, useCallback } from 'react';
import type { User, Role } from '../../domain/entities/User';
import { repositories } from '../../infrastructure/config/container';

export function useHotelStaff(hotelId: string) {
  const [staff, setStaff] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = useCallback(async () => {
    if (!hotelId) return;
    setLoading(true);
    try {
      const data = await repositories.hotelStaff.getAllStaff(hotelId);
      setStaff(data);
    } catch (err) {
      setError('Failed to load staff');
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  const fetchRoles = useCallback(async () => {
      if (!hotelId) return;
      try {
          const data = await repositories.hotelStaff.getAllRoles(hotelId);
          setRoles(data);
      } catch (err) {
          setError('Failed to load roles');
      }
  }, [hotelId]);

  const createStaff = async (data: Omit<User, 'id'>) => {
      const newStaff = await repositories.hotelStaff.createStaff(data, hotelId);
      setStaff(prev => [...prev, newStaff]);
      return newStaff;
  };

  const updateStaff = async (id: string, data: Partial<User>) => {
      const updated = await repositories.hotelStaff.updateStaff(id, data, hotelId);
      setStaff(prev => prev.map(s => s.id === id ? updated : s));
      return updated;
  };

  const deleteStaff = async (id: string) => {
      await repositories.hotelStaff.deleteStaff(id, hotelId);
      setStaff(prev => prev.filter(s => s.id !== id));
  }

  // Role management
  const createRole = async (data: Omit<Role, 'id' | 'userCount'>) => {
      const newRole = await repositories.hotelStaff.createRole(data, hotelId);
      setRoles(prev => [...prev, newRole]);
      return newRole;
  }
  
  const updateRole = async (id: string, data: Partial<Role>) => {
      const updated = await repositories.hotelStaff.updateRole(id, data, hotelId);
      setRoles(prev => prev.map(r => r.id === id ? updated : r));
      return updated;
  }

  const deleteRole = async (id: string) => {
      await repositories.hotelStaff.deleteRole(id, hotelId);
      setRoles(prev => prev.filter(r => r.id !== id));
  }

  return { 
      staff, 
      roles, 
      loading, 
      error, 
      fetchStaff, 
      fetchRoles, 
      createStaff, 
      updateStaff, 
      deleteStaff,
      createRole,
      updateRole,
      deleteRole,
      getAvailablePermissions: repositories.hotelStaff.getAvailablePermissions.bind(repositories.hotelStaff),
      getRolePermissions: (roleId: string) => repositories.hotelStaff.getRolePermissions(hotelId, roleId),
      setRolePermissions: (roleId: string, permissions: string[]) => repositories.hotelStaff.setRolePermissions(hotelId, roleId, permissions)
  };
}
