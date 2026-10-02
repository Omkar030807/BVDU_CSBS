export const USER_ROLES = ['Admin', 'Doctor', 'Receptionist'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PERMISSIONS = [
  'patients',
  'doctors',
  'appointments',
  'admissions',
  'pharmacy',
  'prescriptions',
  'billing',
  'statistics',
  'notifications',
  'user_management',
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  Admin: PERMISSIONS,
  Doctor: ['patients', 'appointments', 'prescriptions', 'notifications'],
  Receptionist: ['patients', 'appointments', 'admissions', 'billing', 'notifications'],
};

export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  isActive: boolean;
  sessionVersion: number;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  permissions: readonly Permission[];
}

export const isUserRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && USER_ROLES.includes(value as UserRole);

export const getPermissionsForRole = (role: UserRole): readonly Permission[] =>
  ROLE_PERMISSIONS[role];

export const toPublicUser = (user: UserRecord): PublicUser => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  permissions: getPermissionsForRole(user.role),
});
