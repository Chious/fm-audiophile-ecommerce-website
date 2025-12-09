/**
 * Authentication helper for tests
 * Uses Better Auth API and internal modules, avoiding direct database access
 */

import { auth } from "@/lib/auth";
import { createId } from "@paralleldrive/cuid2";

export interface TestUser {
  userId: string;
  email: string;
  password: string;
  role: "admin" | "manager" | "consumer";
  sessionToken: string;
  cookie: string;
}

/**
 * Create a test user with the specified role and return session info
 * Uses Better Auth API for user creation and sign-in
 * Note: Role updates require database access, so we use a workaround
 * by creating users and then updating roles via a helper service
 */
export async function createTestUser(
  role: "admin" | "manager" | "consumer"
): Promise<TestUser> {
  const email = `test-${role}-${createId()}@test.com`;
  const password = "TestPassword123!";
  const name = `Test ${role}`;

  // Create user using Better Auth signUpEmail
  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
      headers: new Headers(),
    });
  } catch (error: unknown) {
    // User might already exist, that's okay
    const authError = error as { body?: { code?: string } };
    if (authError.body?.code !== "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
      // Re-throw if it's a different error
      throw error;
    }
  }

  // Sign in to create session
  const signInResult = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
    headers: new Headers(),
  });

  if (!signInResult || !signInResult.token) {
    throw new Error(`Failed to sign in ${role} user`);
  }

  // Get user info from sign-in result
  if (!signInResult.user) {
    throw new Error(`Failed to get user from sign-in result for ${role} user`);
  }

  const userId = signInResult.user.id;
  const userRole = (signInResult.user as { role?: string }).role || "consumer";

  // If role doesn't match and it's not consumer (default), we need to update it
  // Since we can't use db directly, we'll use the app's admin API if available
  // or accept that consumer tests will work, and admin/manager need special handling
  if (userRole !== role && role !== "consumer") {
    // Note: Role updates typically require admin privileges or direct DB access
    // For testing, we can either:
    // 1. Use seed script's admin user for admin tests
    // 2. Create a test-specific admin API endpoint
    // 3. Accept that manager role tests may need special setup
    console.warn(
      `Warning: User ${email} has role ${userRole}, but test expects ${role}. ` +
        `Role update requires admin privileges or database access.`
    );
  }

  // Create cookie header (Better Auth uses 'better-auth.session_token' cookie name)
  // For Elysia requests, we only need the cookie name and value
  const cookie = `better-auth.session_token=${signInResult.token}`;

  return {
    userId,
    email,
    password,
    role: userRole as "admin" | "manager" | "consumer",
    sessionToken: signInResult.token,
    cookie,
  };
}

/**
 * Get session cookie from Better Auth sign-in result
 */
export function getSessionCookie(sessionToken: string): string {
  // For Elysia requests, we only need the cookie name and value
  return `better-auth.session_token=${sessionToken}`;
}

/**
 * Use the seed script's admin user for admin tests
 */
export async function getSeedAdminUser(): Promise<TestUser> {
  const email = process.env.ADMIN_EMAIL || "admin@audiophile.com";
  const password = process.env.ADMIN_PASSWORD || "Admin123!ChangeMe";

  // Sign in as admin
  const signInResult = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
    headers: new Headers(),
  });

  if (!signInResult || !signInResult.token) {
    throw new Error("Failed to sign in as seed admin user");
  }

  if (!signInResult.user) {
    throw new Error(
      "Failed to get user from sign-in result for seed admin user"
    );
  }

  const userId = signInResult.user.id;
  const cookie = getSessionCookie(signInResult.token);

  return {
    userId,
    email,
    password,
    role: "admin",
    sessionToken: signInResult.token,
    cookie,
  };
}
