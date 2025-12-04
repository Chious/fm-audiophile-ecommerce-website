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
    detail: {
      tags: ["r2"],
      summary: "Generate R2 presigned URL",
      description:
        "Generate a temporary signed URL for accessing a private Cloudflare R2 object (e.g. product images) without exposing the bucket publicly. <br/> 用來產生 Cloudflare R2 物件的預簽名網址，讓前端可以在有限時間內安全讀取圖片或檔案。",
    },
    query: presignedUrlQuery,
    response: {
      200: presignedUrlResponse,
      400: errorResponse,
      500: errorResponse,
    },
  }
);
