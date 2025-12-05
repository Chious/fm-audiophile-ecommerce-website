import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local first, then fallback to .env
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn(
    "⚠️  DATABASE_URL not found. Database operations will fail at runtime."
  );
  console.warn(
    "   This is normal during build time. Make sure to set DATABASE_URL in Vercel environment variables."
  );
}

export default defineConfig({
  schema: "./database/schema.ts",
  out: "./database/migrations",
  dialect: "postgresql",
  dbCredentials: databaseUrl
    ? {
        url: databaseUrl,
      }
    : {
        // Fallback for build time (will fail if actually used)
        url: "postgresql://localhost:5432/dummy",
      },
  verbose: true,
  strict: true,
});
