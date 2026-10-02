import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ApiError } from '../services/api';
import { getSessionRequest, loginRequest, logoutRequest } from '../services/authApi';
import type { AuthUser, LoginCredentials } from '../types/auth';

export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  sessionError: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const refreshSession = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const sessionUser = await getSessionRequest();
      setUser(sessionUser);
      setSessionError(null);
    } catch (error) {
      setUser(null);
      if (error instanceof ApiError && error.status === 401) {
        setSessionError(null);
      } else {
        setSessionError(error instanceof Error ? error.message : 'Session check failed.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthUser> => {
    const authenticatedUser = await loginRequest(credentials);
    setUser(authenticatedUser);
    setSessionError(null);
    return authenticatedUser;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
      setSessionError(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, sessionError, login, logout, refreshSession }),
    [user, isLoading, sessionError, login, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
