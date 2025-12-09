/**
 * Permission levels for admin routes
 * - admin: Full access (all CRUD operations)
 * - manager: Read-only access (GET operations only)
 * - consumer: No admin access (only frontend order records)
 */

export type UserRole = "admin" | "manager" | "consumer";

export type Permission = "read" | "write" | "delete";

export interface UserPermissions {
  role: UserRole;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

/**
 * Get user permissions based on role
 */
export function getUserPermissions(role: string | undefined): UserPermissions {
  switch (role) {
    case "admin":
      return {
        role: "admin",
        canRead: true,
        canWrite: true,
        canDelete: true,
      };
    case "manager":
      return {
        role: "manager",
        canRead: true,
        canWrite: false,
        canDelete: false,
      };
    case "consumer":
    default:
      return {
        role: "consumer",
        canRead: false,
        canWrite: false,
        canDelete: false,
      };
  }
}

/**
 * Check if user has required permission
 */
export function hasPermission(
  userRole: string | undefined,
  requiredPermission: Permission
): boolean {
  const permissions = getUserPermissions(userRole);

  switch (requiredPermission) {
    case "read":
      return permissions.canRead;
    case "write":
      return permissions.canWrite;
    case "delete":
      return permissions.canDelete;
    default:
      return false;
  }
}

/**
 * Check if user has admin access (admin or manager)
 */
export function hasAdminAccess(userRole: string | undefined): boolean {
  return userRole === "admin" || userRole === "manager";
}

/**
 * Check if user has full admin access (admin only)
 */
export function hasFullAdminAccess(userRole: string | undefined): boolean {
  return userRole === "admin";
}
