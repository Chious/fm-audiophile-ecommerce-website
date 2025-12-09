import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { db } from "@/database/db";
import * as schema from "@/database/schema";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "consumer",
        input: false, // don't allow user to set role
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  trustedOrigins: [
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    process.env.SITE_URL || "http://localhost:3000",
  ],
  baseURL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  basePath: "/auth",
  secret:
    process.env.BETTER_AUTH_SECRET ||
    process.env.AUTH_SECRET ||
    "change-me-in-production",
  plugins: [openAPI(), nextCookies()],
});

// Extract OpenAPI schema from Better Auth for Elysia integration
// Reference: https://elysiajs.com/integrations/better-auth.html#openapi
let _schema: Awaited<ReturnType<typeof auth.api.generateOpenAPISchema>> | null =
  null;
const getSchema = async () => {
  if (!_schema) {
    _schema = await auth.api.generateOpenAPISchema();
  }
  return _schema;
};

export const BetterAuthOpenAPI = {
  getPaths: async (prefix = "/auth") => {
    const { paths } = await getSchema();
    const reference: Record<string, Record<string, unknown>> = Object.create(
      null
    );

    for (const path of Object.keys(paths)) {
      const key = prefix + path;
      reference[key] = paths[path] as Record<string, unknown>;

      for (const method of Object.keys(paths[path])) {
        const operation = reference[key][method] as { tags?: string[] };
        if (operation) {
          operation.tags = ["auth"];
        }
      }
    }

    return reference;
  },
  components: async () => {
    const { components } = await getSchema();
    return components;
  },
} as const;

export type Session = typeof auth.$Infer.Session;
