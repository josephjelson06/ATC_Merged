import type { IUserRepository } from '../../domain/contracts/IUserRepository';
import type { User, Role } from '../../domain/entities/User';
import { httpClient } from '../http/client';
import type {
  ApiPermissionDTO,
  ApiRoleDTO,
  ApiUserDTO,
} from '../dto/backend';

export class ApiUserRepository implements IUserRepository {
  private baseUrl = 'api/platform/users/';
  private roleUrl = 'api/platform/roles/';

  private mapUser = (data: ApiUserDTO): User => ({
    id: String(data.id),
    name: data.name ?? '',
    email: data.email ?? '',
    phone: data.phone ?? data.mobile ?? undefined,
    mobile: data.mobile ?? data.phone ?? undefined,
    status: data.status ?? undefined,
    lastLogin: data.last_login ?? undefined,
    avatar: data.avatar ?? undefined,
    dateAdded: data.date_added ?? undefined,
    tenantId: data.tenant_id ? String(data.tenant_id) : undefined,
    // employeeId not in DTO 
    isAdmin: data.is_admin,
    role: data.role ? this.mapRole(data.role) : undefined,
  });

  private mapRole = (data: ApiRoleDTO): Role => ({
    id: String(data.id),
    name: data.name,
    description: data.description ?? '',
    status: data.status ?? undefined,
    color: data.color ?? 'blue',
    permissions: data.permissions ?? [],
    userCount: undefined, // Backend doesn't return count on generic DTO usually
  });

  async getAll(): Promise<User[]> {
    const data = await httpClient.get<ApiUserDTO[]>(this.baseUrl);
    return data.map(this.mapUser);
  }

  async getById(id: string): Promise<User | null> {
    try {
      const result = await httpClient.get<ApiUserDTO>(`${this.baseUrl}${id}`);
      return this.mapUser(result);
    } catch (_error) {
      return null;
    }
  }

  async create(data: Omit<User, 'id'>): Promise<User> {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone ?? data.mobile,
      role_id: data.role?.id,
      tenant_id: data.tenantId, // Added tenant_id
      password: 'password123',
    };
    const result = await httpClient.post<ApiUserDTO>(this.baseUrl, payload);
    return this.mapUser(result);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.email !== undefined) payload.email = data.email;
    if (data.status !== undefined) payload.status = data.status;
    if (data.role?.id !== undefined) payload.role_id = data.role.id;
    if (data.tenantId !== undefined) payload.tenant_id = data.tenantId; // Added tenant_id
    if (data.phone !== undefined || data.mobile !== undefined) {
      payload.phone = data.phone ?? data.mobile;
    }

    const result = await httpClient.patch<ApiUserDTO>(`${this.baseUrl}${id}`, payload);
    return this.mapUser(result);
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}${id}`);
  }

  // Role Management
  async getRoles(): Promise<Role[]> {
    const data = await httpClient.get<ApiRoleDTO[]>(this.roleUrl);
    return data.map(this.mapRole);
  }

  async createRole(data: Role): Promise<Role> {
    const payload = {
      name: data.name,
      description: data.description,
      color: data.color,
      status: data.status
    };
    const result = await httpClient.post<ApiRoleDTO>(this.roleUrl, payload);
    return this.mapRole(result);
  }

  async updateRole(id: string, data: Partial<Role>): Promise<Role> {
    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.color !== undefined) payload.color = data.color;
    if (data.status !== undefined) payload.status = data.status;

    const result = await httpClient.patch<ApiRoleDTO>(`${this.roleUrl}${id}`, payload);
    return this.mapRole(result);
  }

  async deleteRole(id: string): Promise<void> {
    await httpClient.delete(`${this.roleUrl}${id}`);
  }

  // Permissions
  async getAvailablePermissions(): Promise<{ id: string; key: string; description: string }[]> {
    const data = await httpClient.get<ApiPermissionDTO[]>('api/permissions/');
    return data.map((item) => ({
      id: item.id,
      key: item.key,
      description: item.description ?? '',
    }));
  }

  async getRolePermissions(roleId: string): Promise<{ role_id: string; role_name: string; permissions: string[] }> {
    // Note: Backend might return this shape or just list of strings. Assuming standard shape.
    // If backend endpoint is /roles/{id}/permissions
    return await httpClient.get<any>(`${this.roleUrl}${roleId}/permissions`);
  }

  async setRolePermissions(roleId: string, permissions: string[]): Promise<void> {
    await httpClient.put(`${this.roleUrl}${roleId}/permissions`, { permissions });
  }
}
