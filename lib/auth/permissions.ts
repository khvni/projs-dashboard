// Role-based access control utilities
import { UserRole } from '@prisma/client';

export type Permission =
  | 'projects:create'
  | 'projects:edit:all'
  | 'projects:edit:assigned'
  | 'projects:delete'
  | 'projects:view:all'
  | 'projects:view:assigned'
  | 'tasks:create'
  | 'tasks:edit'
  | 'tasks:delete'
  | 'tasks:assign'
  | 'users:manage'
  | 'settings:manage';

const rolePermissions: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'projects:create',
    'projects:edit:all',
    'projects:delete',
    'projects:view:all',
    'tasks:create',
    'tasks:edit',
    'tasks:delete',
    'tasks:assign',
    'users:manage',
    'settings:manage',
  ],
  ADMIN: [
    'projects:create',
    'projects:edit:all',
    'projects:view:all',
    'tasks:create',
    'tasks:edit',
    'tasks:delete',
    'tasks:assign',
  ],
  PROJECT_MANAGER: [
    'projects:create',
    'projects:edit:assigned',
    'projects:view:assigned',
    'tasks:create',
    'tasks:edit',
    'tasks:assign',
  ],
  TEAM_MEMBER: [
    'projects:view:assigned',
    'tasks:edit',
  ],
  STAKEHOLDER: [
    'projects:view:assigned',
  ],
};

/**
 * Check if user role has specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

/**
 * Check if user can edit project
 */
export function canEditProject(role: UserRole, isAssigned: boolean): boolean {
  if (hasPermission(role, 'projects:edit:all')) return true;
  if (hasPermission(role, 'projects:edit:assigned') && isAssigned) return true;
  return false;
}

/**
 * Check if user can view project
 */
export function canViewProject(role: UserRole, isAssigned: boolean, isPublic: boolean): boolean {
  if (hasPermission(role, 'projects:view:all')) return true;
  if (hasPermission(role, 'projects:view:assigned') && isAssigned) return true;
  if (isPublic && role === UserRole.STAKEHOLDER) return true;
  return false;
}

/**
 * Check if user is admin or super admin
 */
export function isAdmin(role: UserRole): boolean {
  return role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;
}

/**
 * Get allowed project statuses for role
 */
export function getAllowedProjectStatuses(role: UserRole): string[] {
  if (isAdmin(role)) {
    return ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];
  }
  return ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'];
}
