/**
 * React Hook 用於獲取 R2 預簽名 URL
 */

import { useState, useEffect, useMemo, startTransition } from "react";
import {
  getPresignedUrl,
  getResponsivePresignedUrl,
} from "@/utils/r2-presigned";

/**
 * Hook 用於獲取單一圖片的預簽名 URL
 */
export function useR2PresignedUrl(
  objectKey: string | null | undefined,
  expiresIn: number = 3600
) {
  const [url, setUrl] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loading = useMemo(() => {
    if (!objectKey) return false;
    return isFetching;
  }, [objectKey, isFetching]);

  useEffect(() => {
    if (!objectKey) {
      startTransition(() => {
        setUrl(null);
        setError(null);
      });
      return;
    }
  }, [objectKey]);

  useEffect(() => {
    if (!objectKey) {
      return;
    }

    startTransition(() => {
      setIsFetching(true);
      setError(null);
    });

    let cancelled = false;

    getPresignedUrl(objectKey, expiresIn)
      .then((presignedUrl) => {
        if (!cancelled) {
          setUrl(presignedUrl);
          setIsFetching(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setIsFetching(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [objectKey, expiresIn]);

  return { url, loading, error };
}

/**
 * Hook 用於獲取響應式圖片的預簽名 URL
 */
export function useResponsiveR2PresignedUrl(
  imageObj:
    | {
        mobile?: string;
        tablet?: string;
        desktop?: string;
      }
    | null
    | undefined,
  device: "mobile" | "tablet" | "desktop" = "desktop",
  expiresIn: number = 3600
) {
  const [url, setUrl] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 計算 loading 狀態：如果沒有 imageObj，則不應該 loading
  const loading = useMemo(() => {
    if (!imageObj) return false;
    return isFetching;
  }, [imageObj, isFetching]);

  // 當 imageObj 變為 null 時，重置狀態（使用 startTransition 避免同步更新）
  useEffect(() => {
    if (!imageObj) {
      startTransition(() => {
        setUrl(null);
        setError(null);
      });
      return;
    }
  }, [imageObj]);

  useEffect(() => {
    if (!imageObj) {
      return;
    }

    startTransition(() => {
      setIsFetching(true);
      setError(null);
    });

    let cancelled = false;

    getResponsivePresignedUrl(imageObj, device, expiresIn)
      .then((presignedUrl) => {
        if (!cancelled) {
          setUrl(presignedUrl);
          setIsFetching(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setIsFetching(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [imageObj, device, expiresIn]);

  return { url, loading, error };
}
