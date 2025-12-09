import { Elysia, t } from "elysia";
import {
  adminProductsResponse,
  adminProductResponse,
  adminProductCreateBody,
  adminProductUpdateBody,
  adminCategoriesResponse,
  adminCategoryResponse,
  adminCategoryCreateBody,
  adminCategoryUpdateBody,
  adminClientsResponse,
  adminClientResponse,
  adminClientCreateBody,
  adminClientUpdateBody,
  adminOrdersResponse,
  adminOrderResponse,
  adminOrderUpdateBody,
  adminOrderFilters,
  adminMediasResponse,
  adminMediaResponse,
  adminMediaFilters,
} from "./model";
import {
  AdminProductService,
  AdminCategoryService,
  AdminClientService,
} from "./service";
import { AdminOrderService } from "./order-service";
import { AdminMediaService } from "./media-service";
import { adminAuth } from "./auth-guard";

export const admin = new Elysia({ prefix: "/admin" })
  .use(adminAuth)
  // --- Products ---
  .get(
    "/products",
    () => {
      return AdminProductService.list();
    },
    {
      detail: {
        tags: ["admin"],
        summary: "List admin products",
        description:
          "Return all products managed by the admin panel. 僅供後台管理介面使用的商品清單，不直接作為前台顯示來源。",
      },
      response: {
        200: adminProductsResponse,
      },
    }
  )
  .get(
    "/products/:id",
    ({ params, set }) => {
      const id = Number(params.id);
      if (Number.isNaN(id)) {
        set.status = 400;
        return { error: "Invalid product id" };
      }
      const product = AdminProductService.get(id);
      if (!product) {
        set.status = 404;
        return { error: "Product not found" };
      }
      return { product };
    },
    {
      detail: {
        tags: ["admin"],
        summary: "Get admin product",
        description:
          "Fetch a single admin product by numeric id. 依照數字 ID 取得單一後台商品資料，方便在表單中載入與編輯。",
      },
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: adminProductResponse,
        400: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
      },
    }
  )
  .post(
    "/products",
    ({ body }) => {
      return AdminProductService.create(body);
    },
    {
      detail: {
        tags: ["admin"],
        summary: "Create admin product",
        description:
          "Create a new product record for use in the admin panel. 在後台新增一筆商品基礎資料（slug / 名稱 / 類別 / 價格 / 是否新產品）。",
      },
      body: adminProductCreateBody,
      response: {
        201: adminProductResponse,
      },
    }
  )
  .put(
    "/products/:id",
    ({ params, body, set }) => {
      const id = Number(params.id);
      if (Number.isNaN(id)) {
        set.status = 400;
        return { error: "Invalid product id" };
      }
      const updated = AdminProductService.update(id, body);
      if (!updated) {
        set.status = 404;
        return { error: "Product not found" };
      }
      return updated;
    },
    {
      detail: {
        tags: ["admin"],
        summary: "Update admin product",
        description:
          "Update an existing admin product by numeric id. 以 ID 更新現有商品，所有欄位皆為部分更新（PATCH-like 行為）。",
      },
      params: t.Object({
        id: t.String(),
      }),
      body: adminProductUpdateBody,
      response: {
        200: adminProductResponse,
        400: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
      },
    }
  )
  .delete(
    "/products/:id",
    ({ params, set }) => {
      const id = Number(params.id);
      if (Number.isNaN(id)) {
        set.status = 400;
        return { error: "Invalid product id" };
      }
      const ok = AdminProductService.delete(id);
      if (!ok) {
        set.status = 404;
        return { error: "Product not found" };
      }
      return { success: true };
    },
    {
      detail: {
        tags: ["admin"],
        summary: "Delete admin product",
        description:
          "Delete an admin product by numeric id. 以 ID 刪除後台商品，僅影響後台管理資料，不會變更原始範例 JSON 檔。",
      },
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Object({ success: t.Boolean() }),
        400: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
      },
    }
  )

  // --- Categories ---
  .get(
    "/categories",
    () => {
      return AdminCategoryService.list();
    },
    {
      detail: {
        tags: ["admin"],
        summary: "List admin categories",
        description:
          "Return all categories managed by the admin panel. 回傳所有後台管理用商品分類，可搭配前台分類選單使用。",
      },
      response: {
        200: adminCategoriesResponse,
      },
    }
  )
  .get(
    "/categories/:id",
    ({ params, set }) => {
      const id = Number(params.id);
      if (Number.isNaN(id)) {
        set.status = 400;
        return { error: "Invalid category id" };
      }
      const category = AdminCategoryService.get(id);
      if (!category) {
        set.status = 404;
        return { error: "Category not found" };
      }
      return { category };
    },
    {
      detail: {
        tags: ["admin"],
        summary: "Get admin category",
        description:
          "Fetch a single admin category by numeric id. 依照數字 ID 取得單一分類資料，方便在後台表單中編輯。",
      },
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: adminCategoryResponse,
        400: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
      },
    }
  )
  .post(
    "/categories",
    ({ body }) => {
      return AdminCategoryService.create(body);
    },
    {
      detail: {
        tags: ["admin"],
        summary: "Create admin category",
        description:
          "Create a new category record for use in the admin panel. 在後台新增一筆分類（slug / 顯示名稱 / 選填描述）。",
      },
      body: adminCategoryCreateBody,
      response: {
        201: adminCategoryResponse,
      },
    }
  )
  .put(
    "/categories/:id",
    ({ params, body, set }) => {
      const id = Number(params.id);
      if (Number.isNaN(id)) {
        set.status = 400;
        return { error: "Invalid category id" };
      }
      const updated = AdminCategoryService.update(id, body);
      if (!updated) {
        set.status = 404;
        return { error: "Category not found" };
      }
      return updated;
    },
    {
      detail: {
        tags: ["admin"],
        summary: "Update admin category",
        description:
          "Update an existing admin category by numeric id. 以 ID 更新現有分類，支援部分欄位更新。",
      },
      params: t.Object({
        id: t.String(),
      }),
      body: adminCategoryUpdateBody,
      response: {
        200: adminCategoryResponse,
        400: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
      },
    }
  )
  .delete(
    "/categories/:id",
    ({ params, set }) => {
      const id = Number(params.id);
      if (Number.isNaN(id)) {
        set.status = 400;
        return { error: "Invalid category id" };
      }
      const ok = AdminCategoryService.delete(id);
      if (!ok) {
        set.status = 404;
        return { error: "Category not found" };
      }
      return { success: true };
    },
    {
      detail: {
        tags: ["admin"],
        summary: "Delete admin category",
        description:
          "Delete an admin category by numeric id. 以 ID 刪除後台分類，注意刪除後不會自動更新既有商品的 category 欄位。",
      },
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Object({ success: t.Boolean() }),
        400: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
      },
    }
  )

  // --- Clients ---
  .get(
    "/clients",
    () => {
      return AdminClientService.list();
    },
    {
      detail: {
        tags: ["admin"],
        summary: "List admin clients",
        description:
          "Return all clients managed by the admin panel. 回傳後台紀錄的客戶名單，可作為簡易 CRM 使用。",
      },
      response: {
        200: adminClientsResponse,
      },
    }
  )
  .get(
    "/clients/:id",
    ({ params, set }) => {
      const id = Number(params.id);
      if (Number.isNaN(id)) {
        set.status = 400;
        return { error: "Invalid client id" };
      }
      const client = AdminClientService.get(id);
      if (!client) {
        set.status = 404;
        return { error: "Client not found" };
      }
      return { client };
    },
    {
      detail: {
        tags: ["admin"],
        summary: "Get admin client",
        description:
          "Fetch a single admin client by numeric id. 依照數字 ID 取得單一客戶資料（姓名 / 信箱 / 電話 / 備註）。",
      },
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: adminClientResponse,
        400: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
      },
    }
  )
  .post(
    "/clients",
    ({ body }) => {
      return AdminClientService.create(body);
    },
    {
      detail: {
        tags: ["admin"],
        summary: "Create admin client",
        description:
          "Create a new client record. 在後台建立一筆客戶資料，用於記錄聯絡方式與備註。",
      },
      body: adminClientCreateBody,
      response: {
        201: adminClientResponse,
      },
    }
  )
  .put(
    "/clients/:id",
    ({ params, body, set }) => {
      const id = Number(params.id);
      if (Number.isNaN(id)) {
        set.status = 400;
        return { error: "Invalid client id" };
      }
      const updated = AdminClientService.update(id, body);
      if (!updated) {
        set.status = 404;
        return { error: "Client not found" };
      }
      return updated;
    },
    {
      detail: {
        tags: ["admin"],
        summary: "Update admin client",
        description:
          "Update an existing client record by numeric id. 以 ID 更新客戶資料，支援部分欄位更新。",
      },
      params: t.Object({
        id: t.String(),
      }),
      body: adminClientUpdateBody,
      response: {
        200: adminClientResponse,
        400: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
      },
    }
  )
  .delete(
    "/clients/:id",
    ({ params, set }) => {
      const id = Number(params.id);
      if (Number.isNaN(id)) {
        set.status = 400;
        return { error: "Invalid client id" };
      }
      const ok = AdminClientService.delete(id);
      if (!ok) {
        set.status = 404;
        return { error: "Client not found" };
      }
      return { success: true };
    },
    {
      detail: {
        tags: ["admin"],
        summary: "Delete admin client",
        description:
          "Delete a client record by numeric id. 以 ID 刪除客戶資料，適合清理測試資料或重複客戶。",
      },
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Object({ success: t.Boolean() }),
        400: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
      },
    }
  )

  // --- Orders ---
  .get(
    "/orders",
    async ({ query, set }) => {
      try {
        const filters = {
          status: query.status as
            | "pending"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled"
            | undefined,
          dateFrom: query.dateFrom,
          dateTo: query.dateTo,
          search: query.search,
          limit: query.limit ? Number(query.limit) : undefined,
          offset: query.offset ? Number(query.offset) : undefined,
        };

        const result = await AdminOrderService.list(filters);

        // Convert dates to ISO strings and format response
        return {
          orders: result.orders.map((order) => ({
            ...order,
            subtotal: order.subtotal.toString(),
            shipping: order.shipping.toString(),
            vat: order.vat.toString(),
            grandTotal: order.grandTotal.toString(),
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString(),
            items: [],
          })),
          pagination: result.pagination,
        };
      } catch (error) {
        console.error("List orders error:", error);
        set.status = 500;
        return { error: "Failed to list orders" };
      }
    },
    {
      detail: {
        tags: ["admin"],
        summary: "List admin orders",
        description:
          "List all orders with optional filtering by status, date range, and search. 列出所有訂單，支援狀態、日期範圍和搜尋過濾。",
      },
      query: adminOrderFilters,
      response: {
        200: adminOrdersResponse,
        500: t.Object({ error: t.String() }),
      },
    }
  )
  .get(
    "/orders/:id",
    async ({ params, set }) => {
      try {
        const order = await AdminOrderService.getById(params.id);
        if (!order) {
          set.status = 404;
          return { error: "Order not found" };
        }

        // Convert dates to ISO strings
        return {
          order: {
            ...order,
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString(),
            items: order.items.map((item) => ({
              ...item,
              createdAt: item.createdAt.toISOString(),
            })),
          },
        };
      } catch (error) {
        console.error("Get order error:", error);
        set.status = 500;
        return { error: "Failed to get order" };
      }
    },
    {
      detail: {
        tags: ["admin"],
        summary: "Get admin order",
        description:
          "Get a single order by ID with all items. 取得單一訂單詳情，包含所有訂單項目。",
      },
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: adminOrderResponse,
        404: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
    }
  )
  .put(
    "/orders/:id",
    async ({ params, body, set }) => {
      try {
        const updated = await AdminOrderService.updateStatus(
          params.id,
          body.status
        );
        if (!updated) {
          set.status = 404;
          return { error: "Order not found" };
        }

        // Convert dates to ISO strings
        return {
          order: {
            ...updated,
            createdAt: updated.createdAt.toISOString(),
            updatedAt: updated.updatedAt.toISOString(),
            items: updated.items.map((item) => ({
              ...item,
              createdAt: item.createdAt.toISOString(),
            })),
          },
        };
      } catch (error) {
        console.error("Update order error:", error);
        if (
          error instanceof Error &&
          error.message.includes("Invalid status")
        ) {
          set.status = 400;
          return { error: error.message };
        }
        set.status = 500;
        return { error: "Failed to update order" };
      }
    },
    {
      detail: {
        tags: ["admin"],
        summary: "Update admin order status",
        description:
          "Update an order's status. 更新訂單狀態（pending, processing, shipped, delivered, cancelled）。",
      },
      params: t.Object({
        id: t.String(),
      }),
      body: adminOrderUpdateBody,
      response: {
        200: adminOrderResponse,
        400: t.Object({ error: t.String() }),
        404: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
    }
  )

  // --- Media ---
  .get(
    "/medias",
    async ({ query, set }) => {
      try {
        const filters = {
          productId: query.productId,
          type: query.type as
            | "product"
            | "category"
            | "gallery"
            | "related"
            | undefined,
          size: query.size as "mobile" | "tablet" | "desktop" | undefined,
          limit: query.limit ? Number(query.limit) : undefined,
          offset: query.offset ? Number(query.offset) : undefined,
        };

        const result = await AdminMediaService.list(filters);

        return {
          medias: result.medias.map((media) => ({
            ...media,
            createdAt: media.createdAt.toISOString(),
          })),
          pagination: result.pagination,
        };
      } catch (error) {
        console.error("List medias error:", error);
        set.status = 500;
        return { error: "Failed to list medias" };
      }
    },
    {
      detail: {
        tags: ["admin"],
        summary: "List admin media",
        description:
          "List all product images with optional filtering. 列出所有商品圖片，支援產品 ID、類型、尺寸過濾。",
      },
      query: adminMediaFilters,
      response: {
        200: adminMediasResponse,
        500: t.Object({ error: t.String() }),
      },
    }
  )
  .post(
    "/medias",
    async ({ request, set }) => {
      try {
        // Handle multipart/form-data from request
        const formData = await request.formData();
        const productId = formData.get("productId") as string;
        const type = formData.get("type") as
          | "product"
          | "category"
          | "gallery"
          | "related";
        const size = formData.get("size") as "mobile" | "tablet" | "desktop";
        const order = formData.get("order") ? Number(formData.get("order")) : 0;
        const file = formData.get("file") as File | null;

        if (!productId || !type || !size || !file) {
          set.status = 400;
          return {
            error: "Missing required fields: productId, type, size, file",
          };
        }

        const uploaded = await AdminMediaService.upload({
          productId,
          type,
          size,
          order,
          file,
          filename: file.name,
        });

        set.status = 201;
        return {
          media: {
            ...uploaded,
            createdAt: uploaded.createdAt.toISOString(),
          },
        };
      } catch (error) {
        console.error("Upload media error:", error);
        set.status = 500;
        return {
          error:
            error instanceof Error ? error.message : "Failed to upload media",
        };
      }
    },
    {
      detail: {
        tags: ["admin"],
        summary: "Upload admin media",
        description:
          "Upload a product image to Vercel Blob and save metadata. Accepts multipart/form-data with fields: productId, type, size, order (optional), and file. 上傳商品圖片到 Vercel Blob 並儲存元資料。接受 multipart/form-data，欄位：productId, type, size, order（選填）, file。",
      },
      response: {
        201: adminMediaResponse,
        400: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
    }
  )
  .delete(
    "/medias/:id",
    async ({ params, set }) => {
      try {
        const deleted = await AdminMediaService.delete(params.id);
        if (!deleted) {
          set.status = 404;
          return { error: "Media not found" };
        }
        return { success: true };
      } catch (error) {
        console.error("Delete media error:", error);
        set.status = 500;
        return {
          error:
            error instanceof Error ? error.message : "Failed to delete media",
        };
      }
    },
    {
      detail: {
        tags: ["admin"],
        summary: "Delete admin media",
        description:
          "Delete a product image from Vercel Blob and database. 從 Vercel Blob 和資料庫中刪除商品圖片。",
      },
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Object({ success: t.Boolean() }),
        404: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
    }
  );
