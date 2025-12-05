# Vercel 部署指南

## 前置準備

### 1. 設置資料庫（Neon）

1. 前往 [Neon Console](https://console.neon.tech/)
2. 創建新專案
3. 選擇 PostgreSQL 16
4. 取得連接字串（格式：`postgresql://user:password@host.neon.tech:5432/database?sslmode=require`）

### 2. 在 Vercel 設置環境變數

前往 Vercel 專案設定 → Environment Variables，添加以下變數：

#### 必需變數

```env
# 資料庫連接（Neon）
DATABASE_URL=postgresql://user:password@host.neon.tech:5432/database?sslmode=require

# Better Auth
BETTER_AUTH_SECRET=<使用 openssl rand -base64 32 生成>
BETTER_AUTH_URL=https://your-domain.vercel.app

# 應用程式 URL
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

#### 可選變數

```env
# Vercel Blob Storage（如果使用）
AUDIOPHILE_READ_WRITE_TOKEN=<從 Vercel Dashboard 取得>
BLOB_STORE_ID=<從 Vercel Dashboard 取得>
BLOB_URL=<從 Vercel Dashboard 取得>
```

### 3. 設置 Build Command（可選）

如果需要自動執行資料庫遷移，可以在 Vercel 專案設定中修改 Build Command：

```bash
bun run db:migrate && bun run build
```

**注意**：這會讓每次部署都執行遷移。如果不需要，可以手動執行遷移。

## 部署流程

### 第一次部署

1. **推送程式碼到 Git 倉庫**
   ```bash
   git push origin main
   ```

2. **Vercel 自動部署**
   - Vercel 會自動偵測到推送並開始部署
   - 確保所有環境變數已設置

3. **執行資料庫遷移**
   - 如果沒有設置自動遷移，需要手動執行：
   ```bash
   # 在本地或使用 Vercel CLI
   vercel env pull .env.local
   bun run db:migrate
   ```

4. **填充初始資料（可選）**
   ```bash
   bun run db:seed
   ```

### 後續部署

- 如果設置了自動遷移，Vercel 會自動處理
- 如果沒有，需要手動執行遷移（僅在 schema 變更時）

## 驗證部署

1. **檢查應用程式是否正常運行**
   - 訪問部署的 URL
   - 檢查 API 端點：`https://your-domain.vercel.app/api/docs`

2. **檢查資料庫連接**
   - 測試 API 端點是否正常回應
   - 檢查 Vercel 函數日誌是否有資料庫錯誤

3. **檢查環境變數**
   - 確認所有必需的環境變數都已設置
   - 確認 `DATABASE_URL` 格式正確

## 常見問題

### Build 失敗

**問題**：Build 時出現 `DATABASE_URL is not set` 錯誤

**解決**：
- ✅ 已修復：`database/db.ts` 已更新，允許在 build 時沒有 `DATABASE_URL`
- 確保在 Vercel 環境變數中設置了 `DATABASE_URL`

### 資料庫連接失敗

**問題**：運行時出現資料庫連接錯誤

**解決**：
- 檢查 `DATABASE_URL` 是否正確
- 確認 Neon 資料庫允許來自 Vercel 的連接
- 檢查 SSL 模式是否正確（Neon 需要 `?sslmode=require`）

### 遷移失敗

**問題**：資料庫遷移執行失敗

**解決**：
- 確認 `DATABASE_URL` 指向正確的資料庫
- 檢查遷移檔案是否正確生成
- 查看 Vercel 函數日誌了解詳細錯誤

## 生產環境最佳實踐

1. **使用環境變數管理**
   - 為 Production、Preview、Development 設置不同的環境變數
   - 使用 Vercel 的環境變數管理功能

2. **資料庫備份**
   - 定期備份 Neon 資料庫
   - 設置自動備份（如果 Neon 提供）

3. **監控與日誌**
   - 設置 Vercel Analytics
   - 監控 API 回應時間和錯誤率
   - 設置錯誤追蹤（如 Sentry）

4. **安全性**
   - 確保所有敏感資訊都在環境變數中
   - 定期更新依賴套件
   - 使用 HTTPS（Vercel 自動提供）

## 相關文檔

- [Vercel 環境變數文檔](https://vercel.com/docs/concepts/projects/environment-variables)
- [Neon 文檔](https://neon.tech/docs)
- [Drizzle ORM 文檔](https://orm.drizzle.team/docs/overview)

