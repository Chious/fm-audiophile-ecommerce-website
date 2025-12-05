import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Get database URL from environment variables
// During build time, DATABASE_URL might not be available, which is fine
// The connection will only be established when the database is actually used at runtime
const connectionString = process.env.DATABASE_URL;

// Only create connection if DATABASE_URL is available
// This allows the module to be imported during build without errors
let client: ReturnType<typeof postgres> | undefined;
let db: ReturnType<typeof drizzle> | undefined;

if (connectionString) {
  // Disable prefetch as it is not supported for "Transaction" pool mode
  client = postgres(connectionString, { prepare: false });
  db = drizzle(client, { schema });
} else {
  // During build, create a placeholder that will throw a helpful error at runtime
  // This prevents build failures while ensuring runtime errors are clear
  db = new Proxy({} as ReturnType<typeof drizzle>, {
    get() {
      throw new Error(
        "DATABASE_URL environment variable is not set. Please configure it in your .env.local or Vercel environment variables."
      );
    },
  }) as ReturnType<typeof drizzle>;
}

export { db };
export type Database = typeof db;
