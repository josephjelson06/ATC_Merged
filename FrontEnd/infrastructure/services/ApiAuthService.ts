import type {
  IAuthService,
} from '../../domain/contracts/IAuthService';
import type { AuthUser, LoginCredentials, ProfileUpdatePayload } from '../../domain/entities/Auth';
import { httpClient } from '../http/client';
import { setCookie } from '../browser/cookies';

export class ApiAuthService implements IAuthService {
  private currentUser: AuthUser | null = null;
  private readonly STORAGE_KEY = 'hms_user'; // Deprecated but kept for cleanup

  constructor() {
    // Clean up old storage if present
    if (typeof window !== 'undefined') {
       localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  private mapAuthUser(response: any): AuthUser {
    const role = response.user_type === 'platform' ? 'super' : 'hotel';
    return {
      id: response.id?.toString(),
      name: response.name ?? '',
      email: response.email ?? '',
      role,
      roleName: response.role_name ?? undefined,
      userType: response.user_type ?? undefined,
      hotelId: response.tenant_id?.toString(),
      permissions: response.permissions ?? [],
      mobile: response.mobile ?? undefined,
      // employee_id removed from AuthUser
      tenantId: response.tenant_id ? String(response.tenant_id) : undefined,
      status: response.status ?? undefined,
      isAdmin: Boolean(response.is_admin),
      isOrphan: Boolean(response.is_orphan),
    };
  }

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      // POST /auth/login returns the user object and sets the HttpOnly cookie
      const response = await httpClient.post<any>('/auth/login', credentials);
      const user = this.mapAuthUser(response);

      // If backend returns token in body, set it in client cookie as fallback
      if (response.access_token) {
          // Set with appropriate options matching backend's logic
          // IMPORTANT: Add "Bearer " prefix to match backend cookie format
          setCookie('access_token', `Bearer ${response.access_token}`, { 
              path: '/', 
              maxAgeSeconds: 60 * 60 * 24, // 1 day
              sameSite: 'lax' 
          });
      }

      this.currentUser = user;
      return user;
    } catch (error) {
       console.error("Login error", error);
       throw new Error('Invalid email or password');
    }
  }

  async logout(): Promise<void> {
    try {
        await httpClient.post('/auth/logout', {});
    } catch(e) {
        console.warn("Logout failed", e);
    }
    this.currentUser = null;
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (this.currentUser) return this.currentUser;
    
    try {
        // Fetch from /auth/me (cookie is sent automatically)
        const response = await httpClient.get<any>('/auth/me');
        const user = this.mapAuthUser(response);
        this.currentUser = user;
        return user;
    } catch (error) {
        // Not authenticated
        return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
     if (this.currentUser) return true;
     const user = await this.getCurrentUser();
     return user !== null;
  }

  async updateMyProfile(profile: ProfileUpdatePayload): Promise<AuthUser> {
    const response = await httpClient.patch<any>('/auth/me', profile);
    const user = this.mapAuthUser(response);
    this.currentUser = user;
    return user;
  }
}
