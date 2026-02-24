import { useState, useCallback, useEffect } from 'react';
import type { AuthUser, ProfileUpdatePayload } from '../../domain/entities/Auth';
import { authService } from '../../infrastructure/config/container';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Default to true while checking session
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const authUser = await authService.login({ email, password });
      setUser(authUser);
      setIsAuthenticated(true);
      return authUser;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Login failed'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateMyProfile = useCallback(
    async (payload: ProfileUpdatePayload) => {
      const updated = await authService.updateMyProfile(payload);
      setUser(updated);
      return updated;
    },
    [],
  );

  return { user, isAuthenticated, loading, error, login, logout, updateMyProfile };
}
