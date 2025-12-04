import type { NextConfig } from "next";

// 允許從 Vercel Blob 網域載入圖片
const BLOB_BASE_URL =
  process.env.NEXT_PUBLIC_BLOB_BASE_URL ||
  process.env.BLOB_URL ||
  "https://m2ff5tamt4ozplkq.public.blob.vercel-storage.com";

const blobUrl = new URL(BLOB_BASE_URL);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: blobUrl.protocol.replace(":", "") as "http" | "https",
        hostname: blobUrl.hostname,
      },
    ],
  },
};

export default nextConfig;
