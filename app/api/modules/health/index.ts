import { Elysia, t } from "elysia";
import { db } from "@/database/db";
import { sql } from "drizzle-orm";

export const health = new Elysia({ prefix: "/health" }).get(
  "/",
  async ({ set }) => {
    const startTime = Date.now();
    const checks: Record<
      string,
      { status: string; message?: string; latency?: number }
    > = {};

    // Check database connection
    try {
      // Check if DATABASE_URL is configured
      if (!process.env.DATABASE_URL) {
        checks.database = {
          status: "unhealthy",
          message: "DATABASE_URL environment variable is not set",
        };
      } else {
        const dbStartTime = Date.now();
        // db is guaranteed to be defined if DATABASE_URL is set
        // but TypeScript doesn't know that, so we check it
        if (!db) {
          checks.database = {
            status: "unhealthy",
            message: "Database instance not initialized",
          };
        } else {
          await db.execute(sql`SELECT 1`);
          const dbLatency = Date.now() - dbStartTime;

          checks.database = {
            status: "healthy",
            message: "Database connection successful",
            latency: dbLatency,
          };
        }
      }
    } catch (error) {
      checks.database = {
        status: "unhealthy",
        message:
          error instanceof Error ? error.message : "Unknown database error",
      };
    }

    const totalLatency = Date.now() - startTime;
    const overallStatus = Object.values(checks).every(
      (check) => check.status === "healthy"
    )
      ? "healthy"
      : "unhealthy";

    // Set HTTP status code based on health
    if (overallStatus === "unhealthy") {
      set.status = 503; // Service Unavailable
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
      latency: totalLatency,
    };
  },
  {
    detail: {
      tags: ["health"],
      summary: "Health check",
      description:
        "Check the health status of the API and database connection. 檢查 API 和資料庫連線的健康狀態。",
    },
    response: {
      200: t.Object({
        status: t.String({
          description: "Overall health status: healthy or unhealthy",
        }),
        timestamp: t.String({ description: "ISO timestamp of the check" }),
        checks: t.Record(
          t.String(),
          t.Object({
            status: t.String(),
            message: t.Optional(t.String()),
            latency: t.Optional(t.Number()),
          })
        ),
        latency: t.Number({
          description: "Total check latency in milliseconds",
        }),
      }),
      503: t.Object({
        status: t.String(),
        timestamp: t.String(),
        checks: t.Record(
          t.String(),
          t.Object({
            status: t.String(),
            message: t.Optional(t.String()),
            latency: t.Optional(t.Number()),
          })
        ),
        latency: t.Number(),
      }),
    },
  }
);
