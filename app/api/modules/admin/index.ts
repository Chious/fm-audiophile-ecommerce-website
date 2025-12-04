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
} from "./model";
import {
  AdminProductService,
  AdminCategoryService,
  AdminClientService,
} from "./service";

export const admin = new Elysia({ prefix: "/admin" })
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
  );
