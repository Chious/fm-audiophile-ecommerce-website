/**
 * R2 預簽名 URL 工具函數
 * 通過 API 路由獲取預簽名 URL，而不是直接使用公共端點
 */

const PRESIGNED_URL_API = "/api/r2/presigned-url";

/**
 * 將相對路徑轉換為 R2 object key
 * @param path 相對路徑，例如: "./assets/product-yx1-earphones/mobile/image-product.jpg"
 * @returns R2 object key（移除 assets/ 前綴，因為上傳時已經移除了）
 */
export function pathToObjectKey(path: string): string {
  // 移除 "./" 前綴（如果存在）
  let cleanPath = path.replace(/^\.\//, "");

  // 移除 "assets/" 前綴（如果存在），因為上傳腳本已經移除了
  cleanPath = cleanPath.replace(/^assets\//, "");

  return cleanPath;
}

/**
 * 獲取預簽名 URL（客戶端使用）
 * @param objectKey R2 object key，例如: "assets/product-yx1-earphones/mobile/image-product.jpg"
 * @param expiresIn URL 有效期（秒），默認 3600（1小時）
 * @returns 預簽名 URL
 */
export async function getPresignedUrl(
  objectKey: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const response = await fetch(
      `${PRESIGNED_URL_API}?key=${encodeURIComponent(
        objectKey
      )}&expiresIn=${expiresIn}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get presigned URL");
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error fetching presigned URL:", error);
    throw error;
  }
}

/**
 * 獲取響應式圖片的預簽名 URL
 * @param imageObj 包含 mobile, tablet, desktop 的圖片對象
 * @param device 設備類型: 'mobile' | 'tablet' | 'desktop'
 * @param expiresIn URL 有效期（秒），默認 3600（1小時）
 * @returns 預簽名 URL
 */
export async function getResponsivePresignedUrl(
  imageObj: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  },
  device: "mobile" | "tablet" | "desktop" = "desktop",
  expiresIn: number = 3600
): Promise<string> {
  const path =
    imageObj[device] ||
    imageObj.desktop ||
    imageObj.tablet ||
    imageObj.mobile ||
    "";

  if (!path) {
    throw new Error("No image path found");
  }

  const objectKey = pathToObjectKey(path);
  return getPresignedUrl(objectKey, expiresIn);
}

/**
 * 批量獲取預簽名 URL（用於優化性能）
 * @param objectKeys R2 object keys 數組
 * @param expiresIn URL 有效期（秒），默認 3600（1小時）
 * @returns 預簽名 URL 映射對象
 */
export async function getBatchPresignedUrls(
  objectKeys: string[],
  expiresIn: number = 3600
): Promise<Record<string, string>> {
  const promises = objectKeys.map(async (key) => {
    try {
      const url = await getPresignedUrl(key, expiresIn);
      return [key, url] as [string, string];
    } catch (error) {
      console.error(`Failed to get presigned URL for ${key}:`, error);
      return [key, ""] as [string, string];
    }
  });

  const results = await Promise.all(promises);
  return Object.fromEntries(results);
}
