# R2 預簽名 URL 快速開始

## 1. 配置環境變數

在 `.env.local` 中添加：

```env
CLOUDFLARE_ACCOUNT_ID=你的帳號ID
R2_ACCESS_KEY_ID=你的R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY=你的R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME=fm-audiophile-ecommerce-website
```

## 2. 獲取 R2 訪問憑證

1. 前往 https://dash.cloudflare.com
2. 導航到 **R2** > **Manage R2 API Tokens**
3. 創建新的 API Token
4. 複製 `Access Key ID` 和 `Secret Access Key`

## 3. 使用組件

最簡單的方式：

```tsx
import R2PresignedImage from "@/app/components/R2PresignedImage";
import data from "@/app/data/data.json";

export function ProductCard({ product }: { product: (typeof data)[0] }) {
  return (
    <R2PresignedImage
      src={product.image}
      device="desktop"
      alt={product.name}
      width={500}
      height={500}
    />
  );
}
```

## 更多信息

查看完整文檔：

- [R2_PRESIGNED_URL.md](./R2_PRESIGNED_URL.md) - 詳細使用指南
- [app/examples/r2-presigned-usage.tsx](../app/examples/r2-presigned-usage.tsx) - 使用示例
