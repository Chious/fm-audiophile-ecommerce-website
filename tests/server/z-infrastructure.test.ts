import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { app } from "@/api/[[...slugs]]/route";
import { DefaultContext, rateLimit } from "elysia-rate-limit";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

const BASE_URL = "http://localhost:8080";

describe("Infrastructure & Security", () => {
  // --- 1. CORS Headers ---
  it("should include CORS headers in response", async () => {
    // Send an OPTIONS request or just a GET and check headers
    // Note: We use app.handle to simulate the request through the full stack
    const res = await app.handle(
      new Request(`${BASE_URL}/api/products`, {
        method: "OPTIONS",
        headers: {
          Origin: "http://attacker.com",
          "Access-Control-Request-Method": "GET",
        },
      })
    );

    // Note: The exact headers depend on how @elysiajs/cors is configured.
    // Common checks:
    expect(res.headers.get("Access-Control-Allow-Origin")).not.toBeTruthy();
    expect(res.headers.get("Access-Control-Allow-Methods")).toBeTruthy();
  });

  // --- 2. Rate Limiting ---
  // Use a dedicated test app with rate limiting enabled to avoid polluting other tests
  it("should enforce rate limits", async () => {
    // Create a minimal app with rate limiting just for this test
    const rateLimitedApp = new Elysia({ prefix: "/api" })
      .use(
        rateLimit({
          duration: 60_000,
          max: 100,
          headers: true,
          scoping: "scoped",
          countFailedRequest: true,
          errorResponse: new Response(
            JSON.stringify({ error: "Too many requests" }),
            { status: 429 }
          ),
          context: new DefaultContext(10_000),
        })
      )
      .get("/test", () => ({ ok: true }));

    const limit = 120; // Try slightly more than typical default
    const requests = [];
    for (let i = 0; i < limit; i++) {
      requests.push(rateLimitedApp.handle(new Request(`${BASE_URL}/api/test`)));
    }

    const responses = await Promise.all(requests);
    const tooMany = responses.find((r) => r.status === 429);

    // Rate limiting should be triggered
    expect(tooMany).toBeDefined();
    expect(tooMany?.status).toBe(429);
  });
});
