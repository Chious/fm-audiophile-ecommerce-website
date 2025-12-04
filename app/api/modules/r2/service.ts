import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type {
  presignedUrlQuery,
  presignedUrlResponse,
  errorResponse,
} from "./model";

// R2 配置
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName =
  process.env.R2_BUCKET_NAME || "fm-audiophile-ecommerce-website";

// 創建 S3 客戶端（R2 兼容 S3 API）
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
});

export abstract class R2Service {
  static async getPresignedUrl(
    params: presignedUrlQuery
  ): Promise<presignedUrlResponse | errorResponse> {
    if (!accountId || !accessKeyId || !secretAccessKey) {
      return {
        error: "Missing R2 credentials",
        message: "R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY must be set",
      };
    }

    const { key, expiresIn = 3600 } = params;

    // 創建 GetObject 命令
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    // 生成預簽名 URL
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn, // URL 有效期（秒）
    });

    return {
      url: presignedUrl,
      expiresIn,
      key,
    };
  }
}
