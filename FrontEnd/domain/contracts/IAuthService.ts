import type { AuthUser, LoginCredentials, ProfileUpdatePayload } from '../entities/Auth';

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthUser>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
  isAuthenticated(): Promise<boolean>;
  updateMyProfile(profile: ProfileUpdatePayload): Promise<AuthUser>;
}
