/**
 * R2 圖片工具函數
 * 將相對路徑轉換為 R2 公共 URL
 */

const R2_BASE_URL =
  process.env.NEXT_PUBLIC_R2_BASE_URL ||
  "https://ebfb0cb50a1b67772c2ab6d0c1310129.r2.cloudflarestorage.com/fm-audiophile-ecommerce-website";

/**
 * 將相對路徑轉換為 R2 URL
 * @param path 相對路徑，例如: "./assets/product-yx1-earphones/mobile/image-product.jpg"
 * @returns R2 完整 URL
 */
export function getR2ImageUrl(path: string): string {
  // 移除 "./" 前綴（如果存在）
  let cleanPath = path.replace(/^\.\//, "");

  // 移除 "assets/" 前綴（如果存在），因為上傳時已經移除了
  cleanPath = cleanPath.replace(/^assets\//, "");

  // 構建完整 URL
  return `${R2_BASE_URL}/${cleanPath}`;
}

/**
 * 獲取響應式圖片 URL
 * @param imageObj 包含 mobile, tablet, desktop 的圖片對象
 * @param device 設備類型: 'mobile' | 'tablet' | 'desktop'
 * @returns R2 完整 URL
 */
export function getResponsiveImageUrl(
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
  return getR2ImageUrl(path);
}
