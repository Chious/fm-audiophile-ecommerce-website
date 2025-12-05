# Database Setup

這個資料庫使用 Drizzle ORM + PostgreSQL，支援本地開發（Docker）和生產環境（Neon）。

## 資料庫架構

### 主要表格

#### Better Auth 表格（認證系統）

- **user** - 用戶表（支援 admin 和 consumer 角色）
- **session** - 會話表（管理用戶登入狀態）
- **account** - 帳號表（支援 OAuth 和 email/password）
- **verification** - 驗證表（email 驗證、密碼重置等）

#### 電商表格

- **categories** - 商品分類（headphones, speakers, earphones）
- **products** - 商品主表（包含庫存數量）
- **product_images** - 商品圖片（支援多種尺寸和類型）
- **product_includes** - 商品包含項目（包裝內容）
- **related_products** - 相關商品關聯
- **orders** - 訂單主表（可選關聯到 user）
- **order_items** - 訂單項目
- **stock_reservations** - 庫存預留表（購物車暫存 30 分鐘）

### 資料庫關聯圖

```mermaid
erDiagram
    users ||--o{ sessions : "has many"
    users ||--o{ accounts : "has many"
    users ||--o{ orders : "has many"
    categories ||--o{ products : "has many"
    products ||--o{ product_images : "has many"
    products ||--o{ product_includes : "has many"
    products ||--o{ related_products : "has many (as product)"
    products ||--o{ related_products : "has many (as related)"
    products ||--o{ order_items : "has many"
    orders ||--o{ order_items : "has many"

    users {
        varchar id PK
        varchar name
        varchar email UK
        boolean emailVerified
        varchar image
        enum role "admin|consumer"
        timestamp createdAt
        timestamp updatedAt
    }

    sessions {
        varchar id PK
        timestamp expiresAt
        varchar token UK
        varchar ipAddress
        varchar userAgent
        varchar userId FK
        timestamp createdAt
        timestamp updatedAt
    }

    accounts {
        varchar id PK
        varchar accountId
        varchar providerId
        varchar userId FK
        text accessToken
        text refreshToken
        text idToken
        timestamp accessTokenExpiresAt
        timestamp refreshTokenExpiresAt
        varchar scope
        varchar password
        timestamp createdAt
        timestamp updatedAt
    }

    categories {
        varchar id PK
        varchar slug UK
        varchar name
        text description
        timestamp created_at
        timestamp updated_at
    }

    products {
        varchar id PK
        varchar slug UK
        varchar name
        varchar category_id FK
        decimal price
        integer stock
        boolean is_new
        text description
        text features
        timestamp created_at
        timestamp updated_at
    }

    stock_reservations {
        varchar id PK
        varchar product_id FK
        varchar user_id FK "optional"
        varchar session_id "for guests"
        integer quantity
        timestamp expires_at
        timestamp created_at
    }

    product_images {
        varchar id PK
        varchar product_id FK
        enum type "product|category|gallery|related"
        enum size "mobile|tablet|desktop"
        varchar url
        integer order
        timestamp created_at
    }

    product_includes {
        varchar id PK
        varchar product_id FK
        integer quantity
        varchar item
        integer order
        timestamp created_at
    }

    related_products {
        varchar id PK
        varchar product_id FK
        varchar related_product_id FK
        integer order
        timestamp created_at
    }

    orders {
        varchar id PK
        varchar order_number UK
        enum status "pending|processing|shipped|delivered|cancelled"
        varchar user_id FK "optional"
        varchar customer_name
        varchar customer_email
        varchar customer_phone
        text shipping_address
        varchar shipping_zip
        varchar shipping_city
        varchar shipping_country
        enum payment_method "emoney|cash"
        varchar emoney_number
        varchar emoney_pin
        decimal subtotal
        decimal shipping
        decimal vat
        decimal grand_total
        timestamp created_at
        timestamp updated_at
    }

    order_items {
        varchar id PK
        varchar order_id FK
        varchar product_id FK
        varchar product_slug
        varchar product_name
        integer quantity
        decimal unit_price
        decimal total
        timestamp created_at
    }
```

## 本地開發環境設置

### 1. 設置環境變數

複製 `.env.example` 到 `.env.local` 並填入正確的值：

```bash
cp .env.example .env.local
```

**注意**：本專案支援 `.env` 和 `.env.local` 兩種檔案。`.env.local` 建議用於本地開發，因為它通常會被 git 忽略。

編輯 `.env.local` 文件，確保 `DATABASE_URL` 指向本地 PostgreSQL：

```env
# Development Database (Docker PostgreSQL)
DATABASE_URL=postgresql://audiophile:audiophile123@localhost:5432/audiophile_db

# PostgreSQL Docker Compose Settings
POSTGRES_USER=audiophile
POSTGRES_PASSWORD=audiophile123
POSTGRES_DB=audiophile_db
POSTGRES_PORT=5432
```

### 2. 啟動 PostgreSQL（使用 Docker）

```bash
docker-compose up -d
```

這會啟動一個 PostgreSQL 16 容器。確認容器正在運行：

```bash
docker ps
```

你應該會看到 `audiophile-postgres` 容器正在運行。

### 3. 生成遷移檔案

```bash
bun run db:generate
```

這會在 `database/migrations` 目錄下生成遷移檔案。

### 4. 執行遷移

**開發環境（推薦）**：

```bash
bun run db:push
```

這會直接將 schema 變更推送到資料庫，適合開發階段。

**生產環境**：

```bash
bun run db:migrate
```

這會執行遷移檔案，適合生產環境使用。

### 5. 填充初始資料

```bash
bun run db:seed
```

這會從 `data/data.json` 讀取資料並填充到資料庫中，包括：

- 分類（categories）
- 商品（products）
- 商品圖片（product_images）
- 商品包含項目（product_includes）
- 相關商品（related_products）

所有商品預設庫存為 100。

## 生產環境（Neon）

### 1. 在 Neon 創建資料庫

1. 前往 [Neon Console](https://console.neon.tech/)
2. 創建新專案
3. 選擇 PostgreSQL 版本（建議 16）
4. 取得連接字串

### 2. 設置環境變數

在生產環境的 `.env` 或 `.env.local` 文件中設置：

```env
# Production Database (Neon)
DATABASE_URL=postgresql://user:password@host.neon.tech:5432/database?sslmode=require
```

### 3. 執行遷移和 seed

```bash
# 執行遷移
bun run db:migrate

# 填充初始資料（可選）
bun run db:seed
```

**注意**：生產環境建議使用遷移檔案（`db:migrate`）而不是 `db:push`。

## 常用命令

- `bun run db:generate` - 生成遷移檔案
- `bun run db:push` - 推送 schema 變更到資料庫（開發用）
- `bun run db:migrate` - 執行遷移（生產用）
- `bun run db:studio` - 開啟 Drizzle Studio（視覺化資料庫管理）
- `bun run db:seed` - 填充初始資料

## 資料庫設計說明

### 圖片儲存策略

圖片 URL 儲存在 `product_images` 表中，支援：

- **類型**: product, category, gallery, related
- **尺寸**: mobile, tablet, desktop
- **順序**: 用於 gallery 和 related products 的排序

圖片實際儲存在 Vercel Blob 或 R2，URL 儲存在資料庫中。

### 訂單設計

訂單表包含：

- 客戶資訊（姓名、郵件、電話）
- 配送地址
- 付款方式
- 金額明細（小計、運費、稅金、總額）

訂單項目表包含商品快照，確保歷史訂單不受商品變更影響。

### 庫存管理

系統支援完整的庫存管理功能：

- **庫存追蹤**：每個商品都有 `stock` 欄位記錄可用數量
- **庫存預留**：當商品加入購物車時，會建立 `stock_reservations` 記錄
- **30 分鐘保留**：預留的庫存會在 30 分鐘後自動釋放
- **庫存檢查**：購買前會檢查 `available_stock = stock - reserved_stock >= 0`
- **支援登入用戶和訪客**：登入用戶使用 `user_id`，訪客使用 `session_id`

**庫存計算邏輯**：

```sql
available_stock = products.stock - SUM(stock_reservations.quantity WHERE expires_at > NOW())
```

如果 `available_stock < 0`，商品將無法加入購物車或結帳。
