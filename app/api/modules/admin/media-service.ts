import { db } from "@/database/db";
import { productImages } from "@/database/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { put, del } from "@vercel/blob";

type ImageType = "product" | "category" | "gallery" | "related";
type ImageSize = "mobile" | "tablet" | "desktop";

export interface MediaFilters {
  productId?: string;
  type?: ImageType;
  size?: ImageSize;
  limit?: number;
  offset?: number;
}

export interface MediaUpload {
  productId: string;
  type: ImageType;
  size: ImageSize;
  order?: number;
  file: File | Blob;
  filename?: string;
}

export class AdminMediaService {
  /**
   * List media with filtering and pagination
   */
  static async list(filters: MediaFilters = {}) {
    const { productId, type, size, limit = 50, offset = 0 } = filters;

    // Build where conditions
    const conditions = [];

    if (productId) {
      conditions.push(eq(productImages.productId, productId));
    }

    if (type) {
      conditions.push(eq(productImages.type, type));
    }

    if (size) {
      conditions.push(eq(productImages.size, size));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get media with total count
    const [mediaList, totalResult] = await Promise.all([
      db
        .select()
        .from(productImages)
        .where(whereClause)
        .orderBy(desc(productImages.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(productImages)
        .where(whereClause),
    ]);

    const total = Number(totalResult[0]?.count || 0);

    return {
      medias: mediaList,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  /**
   * Get media by ID
   */
  static async getById(mediaId: string) {
    const [media] = await db
      .select()
      .from(productImages)
      .where(eq(productImages.id, mediaId))
      .limit(1);

    return media || null;
  }

  /**
   * Upload media to Vercel Blob and save metadata to database
   */
  static async upload(upload: MediaUpload) {
    const { productId, type, size, order = 0, file, filename } = upload;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!(file instanceof File) && !(file instanceof Blob)) {
      throw new Error("Invalid file type");
    }
    // Check MIME type if file is a File instance
    if (
      file instanceof File &&
      file.type &&
      !allowedTypes.includes(file.type)
    ) {
      throw new Error(
        `File type ${
          file.type
        } is not allowed. Allowed types: ${allowedTypes.join(", ")}`
      );
    }

    // Generate blob path
    const timestamp = Date.now();
    const extension = filename ? filename.split(".").pop() || "jpg" : "jpg";
    const blobPath = `products/${productId}/${type}/${size}-${timestamp}.${extension}`;

    try {
      // Upload to Vercel Blob
      const blob = await put(blobPath, file, {
        access: "public",
        contentType: file.type || "image/jpeg",
      });

      // Save metadata to database
      const [saved] = await db
        .insert(productImages)
        .values({
          productId,
          type,
          size,
          url: blob.url,
          order,
        })
        .returning();

      return saved;
    } catch (error) {
      console.error("Media upload error:", error);
      throw new Error(
        `Failed to upload media: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete media from Vercel Blob and database
   */
  static async delete(mediaId: string): Promise<boolean> {
    // Get media record
    const media = await this.getById(mediaId);
    if (!media) {
      return false;
    }

    try {
      // Extract blob path from URL
      const url = new URL(media.url);
      const blobPath = url.pathname.startsWith("/")
        ? url.pathname.slice(1)
        : url.pathname;

      // Delete from Vercel Blob
      await del(blobPath);

      // Delete from database
      await db.delete(productImages).where(eq(productImages.id, mediaId));

      return true;
    } catch (error) {
      console.error("Media deletion error:", error);
      // Even if blob deletion fails, try to delete from DB to avoid orphaned records
      try {
        await db.delete(productImages).where(eq(productImages.id, mediaId));
      } catch (dbError) {
        console.error("Database deletion error:", dbError);
      }
      throw new Error(
        `Failed to delete media: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
