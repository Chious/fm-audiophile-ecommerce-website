/**
 * R2 預簽名圖片組件
 * 使用預簽名 URL 來顯示 R2 圖片，而不是直接使用公共端點
 */

"use client";

import Image, { ImageProps } from "next/image";
import {
  useR2PresignedUrl,
  useResponsiveR2PresignedUrl,
} from "@/hooks/useR2PresignedUrl";
import { pathToObjectKey } from "@/utils/r2-presigned";

interface R2PresignedImageProps extends Omit<ImageProps, "src"> {
  src: string | { mobile?: string; tablet?: string; desktop?: string };
  device?: "mobile" | "tablet" | "desktop";
  expiresIn?: number; // URL 有效期（秒），默認 3600
  fallback?: string; // 如果預簽名 URL 獲取失敗，使用的備用圖片
}

/**
 * R2 預簽名圖片組件
 * 自動獲取預簽名 URL 並顯示圖片
 */
export default function R2PresignedImage({
  src,
  device = "desktop",
  expiresIn = 3600,
  fallback,
  alt,
  ...props
}: R2PresignedImageProps) {
  // 必須在組件頂部無條件調用所有 Hooks
  const objectKey = typeof src === "string" ? pathToObjectKey(src) : null;
  const singleImageHook = useR2PresignedUrl(objectKey, expiresIn);
  const responsiveImageHook = useResponsiveR2PresignedUrl(
    typeof src === "string" ? null : src,
    device,
    expiresIn
  );

  // 根據 src 類型選擇使用哪個 Hook 的結果
  const { url, loading, error } =
    typeof src === "string" ? singleImageHook : responsiveImageHook;

  if (loading) {
    return (
      <div
        style={{
          width: props.width,
          height: props.height,
          backgroundColor: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading...
      </div>
    );
  }

  if (error || !url) {
    if (fallback) {
      return <Image src={fallback} alt={alt || ""} {...props} />;
    }
    return (
      <div
        style={{
          width: props.width,
          height: props.height,
          backgroundColor: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Failed to load image
      </div>
    );
  }

  return <Image src={url} alt={alt || ""} {...props} />;
}
