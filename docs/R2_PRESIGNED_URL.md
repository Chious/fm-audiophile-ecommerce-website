# R2 預簽名 URL 使用指南

本指南說明如何使用預簽名 URL 來訪問 R2 圖片，而不是直接使用公共端點。這樣可以：

- 更好的安全性（可以控制訪問權限）
- 使用 Cloudflare 的功能（Access、Caching 等）
- 避免使用限速的 r2.dev URL

## 配置

### 1. 環境變數

在 `.env.local` 或 `.env` 中添加以下環境變數：

```env
# Cloudflare 配置
CLOUDFLARE_ACCOUNT_ID=你的帳號ID

# R2 訪問憑證（需要創建 R2 API Token）
R2_ACCESS_KEY_ID=你的R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY=你的R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME=fm-audiophile-ecommerce-website
```

### 2. 獲取 R2 訪問憑證

1. 前往 Cloudflare Dashboard: https://dash.cloudflare.com
2. 導航到 **R2** > **Manage R2 API Tokens**
3. 創建新的 API Token
4. 複製 `Access Key ID` 和 `Secret Access Key`
5. 將它們添加到環境變數中

## 使用方法

### 方法 1: 使用 R2PresignedImage 組件（推薦）

最簡單的方式，組件會自動處理預簽名 URL 的獲取：

```tsx
import R2PresignedImage from "@/app/components/R2PresignedImage";
import data from "@/app/data/data.json";

export function ProductCard({ product }: { product: (typeof data)[0] }) {
  return (
    <R2PresignedImage
      src={product.image} // 直接使用 data.json 中的圖片對象
      device="desktop"
      alt={product.name}
      width={500}
      height={500}
      expiresIn={3600} // URL 有效期（秒），默認 1 小時
    />
  );
}
```

### 方法 2: 使用 React Hook

如果需要更多控制，可以使用 Hook：

```tsx
"use client";

import Image from "next/image";
import { useResponsiveR2PresignedUrl } from "@/app/hooks/useR2PresignedUrl";

export function ProductImage({ product }: { product: any }) {
  const { url, loading, error } = useResponsiveR2PresignedUrl(
    product.image,
    "desktop",
    3600 // 1 小時有效期
  );

  if (loading) {
    return <div>Loading image...</div>;
  }

  if (error || !url) {
    return <div>Failed to load image</div>;
  }

  return <Image src={url} alt={product.name} width={500} height={500} />;
}
```

### 方法 3: 直接調用 API

如果需要服務端渲染或批量獲取：

```tsx
import {
  getPresignedUrl,
  getResponsivePresignedUrl,
} from "@/app/utils/r2-presigned";

// 服務端組件
export async function ServerProductImage({ product }: { product: any }) {
  const imageUrl = await getResponsivePresignedUrl(
    product.image,
    "desktop",
    3600
  );

  return <Image src={imageUrl} alt={product.name} width={500} height={500} />;
}
```

### 方法 4: 批量獲取預簽名 URL

用於優化性能，一次性獲取多個圖片的預簽名 URL：

```tsx
import {
  getBatchPresignedUrls,
  pathToObjectKey,
} from "@/app/utils/r2-presigned";

export async function ProductList({ products }: { products: any[] }) {
  // 收集所有圖片路徑
  const imageKeys = products
    .flatMap((product) => [
      pathToObjectKey(product.image.mobile || ""),
      pathToObjectKey(product.image.tablet || ""),
      pathToObjectKey(product.image.desktop || ""),
    ])
    .filter(Boolean);

  // 批量獲取預簽名 URL
  const presignedUrls = await getBatchPresignedUrls(imageKeys, 3600);

  return (
    <div>
      {products.map((product) => {
        const desktopKey = pathToObjectKey(product.image.desktop || "");
        const imageUrl = presignedUrls[desktopKey];

        return (
          <Image
            key={product.id}
            src={imageUrl}
            alt={product.name}
            width={500}
            height={500}
          />
        );
      })}
    </div>
  );
}
```

## API 端點

### GET /api/r2/presigned-url

生成預簽名 URL 的 API 端點。

**查詢參數:**

- `key` (必需): R2 object key，例如 `assets/product-yx1-earphones/mobile/image-product.jpg`
- `expiresIn` (可選): URL 有效期（秒），範圍 1-604800（7 天），默認 3600（1 小時）

**示例:**

```bash
curl "http://localhost:3000/api/r2/presigned-url?key=assets/product-yx1-earphones/mobile/image-product.jpg&expiresIn=3600"
```

**響應:**

```json
{
  "url": "https://...r2.cloudflarestorage.com/...?X-Amz-Algorithm=...",
  "expiresIn": 3600,
  "key": "assets/product-yx1-earphones/mobile/image-product.jpg"
}
```

## 工具函數說明

### `pathToObjectKey(path: string)`

將相對路徑轉換為 R2 object key。

```tsx
const key = pathToObjectKey(
  "./assets/product-yx1-earphones/mobile/image-product.jpg"
);
// 返回: "assets/product-yx1-earphones/mobile/image-product.jpg"
```

### `getPresignedUrl(objectKey: string, expiresIn?: number)`

獲取單一圖片的預簽名 URL。

```tsx
const url = await getPresignedUrl(
  "assets/product-yx1-earphones/mobile/image-product.jpg",
  3600
);
```

### `getResponsivePresignedUrl(imageObj, device, expiresIn?)`

獲取響應式圖片的預簽名 URL。

```tsx
const url = await getResponsivePresignedUrl(
  {
    mobile: "./assets/product-yx1-earphones/mobile/image-product.jpg",
    tablet: "./assets/product-yx1-earphones/tablet/image-product.jpg",
    desktop: "./assets/product-yx1-earphones/desktop/image-product.jpg",
  },
  "desktop",
  3600
);
```

### `getBatchPresignedUrls(objectKeys: string[], expiresIn?)`

批量獲取預簽名 URL。

```tsx
const urls = await getBatchPresignedUrls(
  [
    "assets/product-yx1-earphones/mobile/image-product.jpg",
    "assets/product-yx1-earphones/tablet/image-product.jpg",
  ],
  3600
);
// 返回: { "assets/...": "https://...", ... }
```

## React Hooks

### `useR2PresignedUrl(objectKey, expiresIn?)`

Hook 用於獲取單一圖片的預簽名 URL。

```tsx
const { url, loading, error } = useR2PresignedUrl(
  "assets/product-yx1-earphones/mobile/image-product.jpg",
  3600
);
```

### `useResponsiveR2PresignedUrl(imageObj, device, expiresIn?)`

Hook 用於獲取響應式圖片的預簽名 URL。

```tsx
const { url, loading, error } = useResponsiveR2PresignedUrl(
  product.image,
  "desktop",
  3600
);
```

## 與 data.json 配合使用

`data.json` 中的圖片路徑可以直接使用：

```tsx
import R2PresignedImage from "@/app/components/R2PresignedImage";
import data from "@/app/data/data.json";

export function ProductList() {
  return (
    <div>
      {data.map((product) => (
        <R2PresignedImage
          key={product.id}
          src={product.image}
          device="desktop"
          alt={product.name}
          width={500}
          height={500}
        />
      ))}
    </div>
  );
}
```

## 注意事項

1. **安全性**: 預簽名 URL 包含在服務端生成，客戶端無法偽造
2. **有效期**: URL 有時間限制，過期後需要重新獲取
3. **性能**: 預簽名 URL 可以緩存，但建議在 URL 過期前重新獲取
4. **環境變數**: `R2_ACCESS_KEY_ID` 和 `R2_SECRET_ACCESS_KEY` 必須保密，不要提交到版本控制
5. **Bucket 配置**: R2 bucket 不需要配置為公共訪問，預簽名 URL 可以訪問私有 bucket

## 故障排除

### 預簽名 URL 生成失敗

1. 檢查環境變數是否正確設置
2. 確認 R2 API Token 有讀取權限
3. 檢查 object key 是否正確（路徑必須與 R2 中的 object key 匹配）

### 圖片無法顯示

1. 確認預簽名 URL 未過期
2. 檢查 Next.js Image 配置是否允許該域名
3. 查看瀏覽器控制台的錯誤信息

### 性能問題

1. 使用批量獲取 API 來減少請求次數
2. 考慮緩存預簽名 URL（但要注意有效期）
3. 使用服務端組件來預先獲取 URL

## 遷移指南

從直接使用公共端點遷移到預簽名 URL：

### 之前（公共端點）:

```tsx
import { getR2ImageUrl } from "@/app/utils/r2-image";

<Image src={getR2ImageUrl("./assets/...")} />;
```

### 之後（預簽名 URL）:

```tsx
import R2PresignedImage from "@/app/components/R2PresignedImage";

<R2PresignedImage src="./assets/..." />;
```

或使用 Hook:

```tsx
import { useR2PresignedUrl } from "@/app/hooks/useR2PresignedUrl";
import { pathToObjectKey } from "@/app/utils/r2-presigned";

const { url } = useR2PresignedUrl(pathToObjectKey("./assets/..."));
<Image src={url || ""} />;
```
