import { useState, useCallback } from 'react';
import type { User, Role } from '../../domain/entities/User';
import { repositories } from '../../infrastructure/config/container';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await repositories.users.getAll();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
      try {
          const data = await repositories.users.getRoles();
          setRoles(data);
      } catch (err) {
          setError('Failed to load roles');
      }
  }, []);

  const createUser = async (data: Omit<User, 'id'>) => {
    const newUser = await repositories.users.create(data);
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    const updated = await repositories.users.update(id, data);
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    return updated;
  };

  const deleteUser = async (id: string) => {
    await repositories.users.delete(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };
  
  // Platform Role Management
  const createRole = async (data: Role) => {
      const newRole = await repositories.users.createRole(data);
      setRoles(prev => [...prev, newRole]);
      return newRole;
  }

  const updateRole = async (id: string, data: Partial<Role>) => {
      const updated = await repositories.users.updateRole(id, data);
      setRoles(prev => prev.map(r => r.id === id ? updated : r));
      return updated;
  }

  const deleteRole = async (id: string) => {
      await repositories.users.deleteRole(id);
      setRoles(prev => prev.filter(r => r.id !== id));
  }

  return {
    users,
    roles,
    loading,
    error,
    fetchUsers,
    fetchRoles,
    createUser,
    updateUser,
    deleteUser,
    createRole,
    updateRole,
    deleteRole,
    getAvailablePermissions: repositories.users.getAvailablePermissions.bind(repositories.users),
    getRolePermissions: repositories.users.getRolePermissions.bind(repositories.users),
    setRolePermissions: repositories.users.setRolePermissions.bind(repositories.users)
  };
}
