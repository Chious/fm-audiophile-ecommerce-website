import { t } from "elysia";

// Presigned URL query parameters
export const presignedUrlQuery = t.Object({
  key: t.String({
    description: "R2 object key (path within the bucket).",
    examples: ["product-yx1-earphones/mobile/image-product.jpg"],
  }),
  expiresIn: t.Optional(
    t.Number({
      minimum: 1,
      maximum: 604800,
      default: 3600,
      description:
        "URL expiration time in seconds (1-604800, default: 3600). After this time the URL becomes invalid.",
    })
  ),
});

export type presignedUrlQuery = typeof presignedUrlQuery.static;

// Presigned URL response
export const presignedUrlResponse = t.Object({
  url: t.String({
    description:
      "Fully-qualified presigned URL that can be used to access the R2 object.",
  }),
  expiresIn: t.Number({
    description: "Effective expiration time in seconds for this URL.",
  }),
  key: t.String({
    description: "The original R2 object key used to generate this URL.",
  }),
});

export type presignedUrlResponse = typeof presignedUrlResponse.static;

// Error response
export const errorResponse = t.Object({
  error: t.String({
    description: "Short error code or category.",
  }),
  message: t.String({
    description: "Human-readable description of what went wrong.",
  }),
});

export type errorResponse = typeof errorResponse.static;
