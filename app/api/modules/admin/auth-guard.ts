import { Elysia } from "elysia";
import { auth } from "@/lib/auth";

/**
 * Admin authentication provider for Elysia
 * Uses provider pattern for better performance with heavy DB queries
 * Verifies that the user is authenticated and has the 'admin' role
 */
export const adminAuth = new Elysia({ name: "admin-auth" })
  .derive(async ({ headers }) => {
    try {
      // Get session from Better Auth
      const session = await auth.api.getSession({
        headers: new Headers(headers as Record<string, string>),
      });

      // Check if user is authenticated
      if (!session || !session.user) {
        return {
          user: null,
          session: null,
          isAdmin: false,
          error: "Unauthorized: Authentication required",
        };
      }

      // Check if user has admin role
      const user = session.user as { role?: string };
      const isAdmin = user.role === "admin";

      if (!isAdmin) {
        return {
          user: session.user,
          session: session.session,
          isAdmin: false,
          error: "Forbidden: Admin role required",
        };
      }

      // User is authenticated and is admin
      return {
        user: session.user,
        session: session.session,
        isAdmin: true,
        error: null,
      };
    } catch (error) {
      console.error("Admin auth provider error:", error);
      return {
        user: null,
        session: null,
        isAdmin: false,
        error: "Unauthorized: Authentication failed",
      };
    }
  })
  .onBeforeHandle(({ isAdmin, error, set }) => {
    // If authentication failed, return error response
    if (!isAdmin || error) {
      set.status =
        isAdmin === false && error?.includes("Forbidden") ? 403 : 401;
      return {
        error: error || "Unauthorized",
        message: error || "Authentication required",
      };
    }
  });
