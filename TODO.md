# TODO List

## 🔴 高優先級（必須完成）

### 資料庫遷移

- [ ] 替換 Products API 端點使用資料庫（`app/api/modules/products/service.ts`）
- [ ] 替換 Checkout API 端點使用資料庫（`app/api/modules/checkout/service.ts`）
- [ ] 替換 Admin API 端點使用資料庫（`app/api/modules/admin/service.ts`）
- [ ] 替換 Cart API 端點使用資料庫（`app/api/modules/cart/service.ts`）
- [ ] 建立庫存管理服務函數（檢查、預留、釋放庫存）
- [ ] 實作購物車暫存機制（30 分鐘保留）
- [ ] 建立定期清理過期庫存預留的 cron job 或 scheduled task

### Better Auth 整合

- [ ] 安裝 Better Auth：`bun add better-auth`
- [ ] 建立 Better Auth 配置檔案（`lib/auth.ts` 或 `app/api/auth/[...all]/route.ts`）
- [ ] 配置 Better Auth 使用 Drizzle schema
- [ ] 建立認證 middleware 保護 admin API
- [ ] 建立登入/註冊頁面
- [ ] 整合 OAuth 2.0 提供者（GitHub, Google 等，可選）

### 環境變數與部署

- [ ] 在 Vercel 設置環境變數：
  - `DATABASE_URL`（Neon 或其他 PostgreSQL）
  - `BETTER_AUTH_SECRET`（使用 `openssl rand -base64 32` 生成）
  - `BETTER_AUTH_URL`（生產環境 URL）
  - `BLOB_READ_WRITE_TOKEN`（如果使用 Vercel Blob）
  - `NEXT_PUBLIC_SITE_URL`（生產環境 URL）
- [ ] 設置 Vercel 部署前腳本（執行資料庫遷移）
  - 可以在 Vercel 的 Build Command 中添加：`bun run db:migrate && bun run build`
  - 或使用 Vercel 的 Postinstall Script
- [ ] 測試 Vercel 部署流程
- [x] 確認 build 腳本在 Vercel 上可以成功執行（✅ 已完成：已修改 `database/db.ts` 支援 build 時無 DATABASE_URL）
- [x] 新增 `/api/health` 端點檢查資料庫連線（✅ 已完成：`app/api/modules/health/index.ts`）

## 🟡 中優先級（重要功能）

### 用戶功能

- [ ] 建立用戶訂單歷史 API
- [ ] 建立用戶訂單歷史頁面
- [ ] 實作用戶個人資料管理
- [ ] 實作購物車同步（登入後同步 localStorage 購物車到資料庫）

### 庫存管理

- [ ] 實作庫存不足時的 UI 提示
- [ ] 實作庫存預留過期提醒
- [ ] 建立庫存管理後台介面（admin）

### 圖片管理

- [ ] 將現有圖片上傳到 Vercel Blob 或 R2
- [ ] 更新 `product_images` 表中的 URL
- [ ] 建立圖片上傳 API（admin）
- [ ] 實作圖片上傳功能（admin）

## 🟢 低優先級（優化與改進）

### 效能優化

- [ ] 實作資料庫查詢快取
- [ ] 優化圖片載入（lazy loading, responsive images）
- [ ] 實作 API 回應快取

### 測試

- [ ] 建立單元測試（API endpoints）
- [ ] 建立整合測試（資料庫操作）
- [ ] 建立 E2E 測試（關鍵流程）

### 監控與日誌

- [ ] 設置錯誤追蹤（Sentry 或其他）
- [ ] 設置應用程式監控
- [ ] 實作 API 日誌記錄

### 文件與文檔

- [ ] 更新 API 文檔（OpenAPI）
- [ ] 建立開發者指南
- [ ] 建立部署指南

### 安全性

- [ ] 實作 API rate limiting
- [ ] 實作 CSRF 保護
- [ ] 實作輸入驗證強化
- [ ] 安全審計

## 📝 技術債務

- [ ] 重構 API 服務層（統一錯誤處理）
- [ ] 優化資料庫查詢（避免 N+1 問題）
- [ ] 統一錯誤回應格式
- [ ] 改善 TypeScript 類型定義
- [ ] 程式碼清理與重構

## 🎨 UI/UX 改進

- [ ] 改善載入狀態顯示
- [ ] 改善錯誤訊息顯示
- [ ] 實作骨架屏（Skeleton screens）
- [ ] 改善行動裝置體驗
- [ ] 實作深色模式（如果尚未完成）

## 🔧 開發工具

- [ ] 設置 pre-commit hooks（lint, format）
- [ ] 設置 CI/CD 自動測試
- [ ] 建立開發環境腳本
- [ ] 建立資料庫備份腳本

---

## 注意事項

- 在開始實作前，確保本地開發環境已正確設置
- 每個功能完成後，記得更新相關文檔
- 定期檢查並更新依賴套件
- 保持程式碼風格一致性

## 進度追蹤

最後更新：2025-01-XX
當前階段：資料庫設計完成，準備開始 API 遷移
