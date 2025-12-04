/**
 * R2 預簽名 URL 使用示例
 * 這個文件展示了如何在 Next.js 中使用 R2 預簽名 URL
 */

"use client";

import Image from "next/image";
import R2PresignedImage from "@/components/R2PresignedImage";
import {
  useR2PresignedUrl,
  useResponsiveR2PresignedUrl,
} from "@/hooks/useR2PresignedUrl";
import {
  getResponsivePresignedUrl,
  pathToObjectKey,
} from "@/utils/r2-presigned";

// 示例 1: 使用 R2PresignedImage 組件（最簡單）
export function Example1() {
  return (
    <R2PresignedImage
      src="./assets/product-yx1-earphones/mobile/image-product.jpg"
      alt="YX1 Earphones"
      width={500}
      height={500}
      expiresIn={3600}
      fetchPriority="high"
    />
  );
}

// 示例 2: 使用 R2PresignedImage 組件（響應式圖片）
interface Product {
  id: number;
  name: string;
  image: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
}

export function Example2({ product }: { product: Product }) {
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

// 示例 3: 使用 Hook（單一圖片）
export function Example3() {
  const objectKey = pathToObjectKey(
    "./assets/product-yx1-earphones/mobile/image-product.jpg"
  );
  const { url, loading, error } = useR2PresignedUrl(objectKey, 3600);

  if (loading) {
    return <div>Loading image...</div>;
  }

  if (error || !url) {
    return <div>Failed to load image</div>;
  }

  return <Image src={url} alt="YX1 Earphones" width={500} height={500} />;
}

// 示例 4: 使用 Hook（響應式圖片）
export function Example4({ product }: { product: Product }) {
  const { url, loading, error } = useResponsiveR2PresignedUrl(
    product.image,
    "desktop",
    3600
  );

  if (loading) {
    return <div>Loading image...</div>;
  }

  if (error || !url) {
    return <div>Failed to load image</div>;
  }

  return <Image src={url} alt={product.name} width={500} height={500} />;
}

// 示例 5: 服務端組件（使用 async/await）
export async function Example5({ product }: { product: Product }) {
  const imageUrl = await getResponsivePresignedUrl(
    product.image,
    "desktop",
    3600
  );

  return <Image src={imageUrl} alt={product.name} width={500} height={500} />;
}

// 示例 6: 帶有錯誤處理和備用圖片
export function Example6({ product }: { product: Product }) {
  return (
    <R2PresignedImage
      src={product.image}
      device="desktop"
      alt={product.name}
      width={500}
      height={500}
      fallback="/placeholder.jpg" // 如果預簽名 URL 獲取失敗，使用備用圖片
    />
  );
}

// 示例 7: 在列表中使用
export function Example7({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map((product) => (
        <R2PresignedImage
          key={product.id}
          src={product.image}
          device="desktop"
          alt={product.name}
          width={300}
          height={300}
        />
      ))}
    </div>
  );
}
