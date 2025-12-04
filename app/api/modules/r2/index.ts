import { Elysia } from "elysia";
import { R2Service } from "./service";
import {
  presignedUrlQuery,
  presignedUrlResponse,
  errorResponse,
} from "./model";

export const r2 = new Elysia({ prefix: "/r2" }).get(
  "/presigned-url",
  async ({ query, set }) => {
    try {
      const result = await R2Service.getPresignedUrl(query);

      // Check if result is an error response (missing credentials)
      if ("error" in result) {
        set.status = 500;
        return result;
      }

      return result;
    } catch (error) {
      // Handle server errors (invalid credentials, AWS SDK errors, etc.)
      set.status = 500;
      return {
        error: "Server error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate presigned URL. Please check R2 credentials.",
      };
    }
  },
  {
    query: presignedUrlQuery,
    response: {
      200: presignedUrlResponse,
      400: errorResponse,
      500: errorResponse,
    },
  }
);
