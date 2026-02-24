import type { User, Role, StaffMember } from '../entities/User';

export interface IUserRepository {
  getAll(): Promise<User[]>;
  getById(id: string): Promise<User | null>;
  create(data: Omit<User, 'id'>): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;

  // Role Management
  getRoles(): Promise<Role[]>;
  createRole(data: Role): Promise<Role>;
  updateRole(id: string, data: Partial<Role>): Promise<Role>;
  deleteRole(id: string): Promise<void>;

  // Permissions
  getAvailablePermissions(): Promise<{ id: string; key: string; description: string }[]>;
  getRolePermissions(roleId: string): Promise<{ role_id: string; role_name: string; permissions: string[] }>;
  setRolePermissions(roleId: string, permissions: string[]): Promise<void>;
}
