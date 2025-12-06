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

// db is always defined - either as a real connection or a Proxy that throws at runtime
const db: ReturnType<typeof drizzle> = connectionString
  ? drizzle(postgres(connectionString, { prepare: false }), { schema })
  : (new Proxy({} as ReturnType<typeof drizzle>, {
      get() {
        throw new Error(
          "DATABASE_URL environment variable is not set. Please configure it in your .env.local or Vercel environment variables."
        );
      },
    }) as ReturnType<typeof drizzle>);

if (connectionString) {
  client = postgres(connectionString, { prepare: false });
}

export { db };
export type Database = typeof db;
