import type { AuthUser, LoginCredentials } from '../types/auth';
import { apiRequest } from './api';

interface UserResponse {
  user: AuthUser;
}

interface UsersResponse {
  users: AuthUser[];
}

export const loginRequest = async (credentials: LoginCredentials): Promise<AuthUser> => {
  const response = await apiRequest<UserResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  return response.user;
};

export const getSessionRequest = async (): Promise<AuthUser> => {
  const response = await apiRequest<UserResponse>('/auth/me');
  return response.user;
};

export const logoutRequest = async (): Promise<void> => {
  await apiRequest<void>('/auth/logout', { method: 'POST' });
};

export const listUsersRequest = async (): Promise<AuthUser[]> => {
  const response = await apiRequest<UsersResponse>('/users');
  return response.users;
};
