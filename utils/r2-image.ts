/**
 * 圖片 URL 工具函數（使用 Vercel Blob）
 * 將相對路徑轉換為 Vercel Blob 公共 URL
 */

const BLOB_BASE_URL =
  process.env.NEXT_PUBLIC_BLOB_BASE_URL ||
  process.env.BLOB_URL ||
  "https://m2ff5tamt4ozplkq.public.blob.vercel-storage.com";

function normalizePath(path: string): string {
  // 移除 "./" 前綴（如果存在）
  let cleanPath = path.replace(/^\.\//, "");

  // 移除 "assets/" 前綴（如果存在），因為上傳到 Blob 時已經移除了
  cleanPath = cleanPath.replace(/^assets\//, "");

  return cleanPath;
}

/**
 * 將相對路徑轉換為 Vercel Blob URL
 * @param path 相對路徑，例如: "./assets/product-yx1-earphones/mobile/image-product.jpg"
 * @returns Blob 完整 URL
 */
export function getBlobImageUrl(path: string): string {
  const cleanPath = normalizePath(path);
  return `${BLOB_BASE_URL}/${cleanPath}`;
}

/**
 * 獲取響應式圖片 URL
 * @param imageObj 包含 mobile, tablet, desktop 的圖片對象
 * @param device 設備類型: 'mobile' | 'tablet' | 'desktop'
 * @returns Blob 完整 URL
 */
export function getResponsiveBlobImageUrl(
  imageObj: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  },
  device: "mobile" | "tablet" | "desktop" = "desktop"
): string {
  const path =
    imageObj[device] ||
    imageObj.desktop ||
    imageObj.tablet ||
    imageObj.mobile ||
    "";
  return getBlobImageUrl(path);
}

// 向後相容的別名（舊名稱仍可使用）
export const getR2ImageUrl = getBlobImageUrl;
export const getResponsiveImageUrl = getResponsiveBlobImageUrl;
