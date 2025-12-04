import { t } from "elysia";

// Presigned URL query parameters
export const presignedUrlQuery = t.Object({
  key: t.String({
    description: "R2 object key",
    examples: ["product-yx1-earphones/mobile/image-product.jpg"],
  }),
  expiresIn: t.Optional(
    t.Number({
      minimum: 1,
      maximum: 604800,
      default: 3600,
      description: "URL expiration time in seconds (1-604800, default: 3600)",
    })
  ),
});

export type presignedUrlQuery = typeof presignedUrlQuery.static;

// Presigned URL response
export const presignedUrlResponse = t.Object({
  url: t.String(),
  expiresIn: t.Number(),
  key: t.String(),
});

export type presignedUrlResponse = typeof presignedUrlResponse.static;

// Error response
export const errorResponse = t.Object({
  error: t.String(),
  message: t.String(),
});

export type errorResponse = typeof errorResponse.static;
