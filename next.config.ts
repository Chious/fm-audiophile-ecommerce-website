import type { NextConfig } from "next";

const bucketName = process.env.R2_BUCKET_NAME;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

const getR2Hostname = (): string => {
  if (!bucketName || !accountId) {
    // TODO: throw error
    return "";
  }

  return `${bucketName}.${accountId}.r2.cloudflarestorage.com`;
};

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: getR2Hostname(),
      },
    ],
  },
};

export default nextConfig;
