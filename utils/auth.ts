/**
 * Better Auth client-side authentication utilities
 * Uses Better Auth React client SDK instead of manual fetch calls
 */

import { authClient } from "@/lib/auth-client";

/**
 * Check if the current user is authenticated and has admin role
 * Uses Better Auth client SDK
 */
export async function checkAdminAuth(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    const session = await authClient.getSession();

    if (session?.data?.user) {
      const userRole = (session.data.user as { role?: string }).role;
      return userRole === "admin";
    }
    return false;
  } catch (error) {
    console.error("Auth check error:", error);
    return false;
  }
}

/**
 * Get current authenticated user (if admin)
 * Uses Better Auth client SDK
 */
export async function getAdminUser(): Promise<{
  id: string;
  email: string;
  name: string;
  role: string;
} | null> {
  if (typeof window === "undefined") return null;

  try {
    const session = await authClient.getSession();
    if (session?.data?.user) {
      const user = session.data.user as {
        role?: string;
        id: string;
        email: string;
        name: string;
      };
      if (user.role === "admin") {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Get admin user error:", error);
    return null;
  }
}

/**
 * Logout current user
 * Uses Better Auth client SDK
 */
export async function logout(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    await authClient.signOut();
  } catch (error) {
    console.error("Logout error:", error);
  }
}

// Legacy functions for backward compatibility
export function isAuthenticated(): boolean {
  // This is now async, but keeping for compatibility
  // Components should use checkAdminAuth() instead
  return false;
}

export function getAdminEmail(): string | null {
  // This is now async, but keeping for compatibility
  // Components should use getAdminUser() instead
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function setAuthenticated(_email: string): void {
  // No longer used - authentication is handled by Better Auth
  console.warn(
    "setAuthenticated is deprecated. Use Better Auth sign-in instead."
  );
}
