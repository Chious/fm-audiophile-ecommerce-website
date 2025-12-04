/**
 * Simple client-side authentication utilities
 * Uses sessionStorage for demo purposes
 * In production, replace with proper authentication (JWT, cookies, etc.)
 */

const AUTH_KEY = "admin_authenticated";
const EMAIL_KEY = "admin_email";

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(AUTH_KEY) === "true";
}

export function getAdminEmail(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(EMAIL_KEY);
}

export function setAuthenticated(email: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(AUTH_KEY, "true");
  sessionStorage.setItem(EMAIL_KEY, email);
}

export function logout(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(EMAIL_KEY);
}

