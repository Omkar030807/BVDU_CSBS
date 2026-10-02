export type UserRole = 'Admin' | 'Doctor' | 'Receptionist';

export type Permission =
  | 'patients'
  | 'doctors'
  | 'appointments'
  | 'admissions'
  | 'pharmacy'
  | 'prescriptions'
  | 'billing'
  | 'statistics'
  | 'notifications'
  | 'user_management';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  permissions: Permission[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}
