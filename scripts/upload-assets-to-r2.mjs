#!/usr/bin/env node

/**
 * 創建 R2 bucket 並上傳 app/assets 目錄中的所有文件
 *
 * 需要環境變數（可在根目錄的 .env 文件中設置）:
 *   - CLOUDFLARE_ACCOUNT_ID
 *   - CLOUDFLARE_API_TOKEN (需要有 R2:Edit 權限)
 *   - BUCKET_NAME (可選，預設為 fm-audiophile-ecommerce-website)
 *
 * 使用方法:
 *   1. 在根目錄創建 .env 文件並設置環境變數
 *   2. node scripts/upload-assets-to-r2.mjs
 *
 *   或者使用命令行環境變數:
 *   CLOUDFLARE_ACCOUNT_ID=xxx CLOUDFLARE_API_TOKEN=xxx node scripts/upload-assets-to-r2.mjs
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";

// 讀取 .env 文件
function loadEnvFile() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const projectRoot = join(__dirname, "..");
  const envPath = join(projectRoot, ".env");

  try {
    const envContent = readFileSync(envPath, "utf-8");
    const envVars = {};

    envContent.split("\n").forEach((line) => {
      line = line.trim();
      // 忽略註釋和空行
      if (line && !line.startsWith("#")) {
        const [key, ...valueParts] = line.split("=");
        if (key && valueParts.length > 0) {
          // 移除引號（如果有的話）
          let value = valueParts.join("=").trim();
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1);
          }
          envVars[key.trim()] = value;
        }
      }
    });

    // 將 .env 中的變數設置到 process.env（如果尚未設置）
    Object.keys(envVars).forEach((key) => {
      if (!process.env[key]) {
        process.env[key] = envVars[key];
      }
    });
  } catch (error) {
    // .env 文件不存在時不報錯，使用環境變數即可
    if (error.code !== "ENOENT") {
      console.warn(`⚠️  警告: 無法讀取 .env 文件: ${error.message}`);
    }
  }
}

// 載入 .env 文件
loadEnvFile();

const bucketName = process.env.BUCKET_NAME || "fm-audiophile-ecommerce-website";
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;

if (!accountId || !apiToken) {
  console.error("❌ 錯誤: 需要設置環境變數:");
  console.error("   - CLOUDFLARE_ACCOUNT_ID");
  console.error("   - CLOUDFLARE_API_TOKEN (需要有 R2:Edit 權限)");
  console.error("\n可以在根目錄的 .env 文件中設置，或使用命令行環境變數");
  process.exit(1);
}

const API_BASE = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets`;

// 獲取項目根目錄和 assets 目錄路徑
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");
const assetsDir = join(projectRoot, "app", "assets");

// 遞歸獲取所有文件
function getAllFiles(dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// 獲取文件的 MIME 類型
function getContentType(filePath) {
  const ext = filePath.split(".").pop().toLowerCase();
  const mimeTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    svg: "image/svg+xml",
    gif: "image/gif",
    webp: "image/webp",
    ico: "image/x-icon",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

// 創建 bucket
async function createBucket() {
  console.log(`📦 正在創建 bucket "${bucketName}"...\n`);

  const response = await fetch(`${API_BASE}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: bucketName,
    }),
  });

  if (response.ok) {
    console.log(`✅ Bucket "${bucketName}" 創建成功\n`);
    return true;
  } else if (response.status === 409) {
    // Bucket 已存在
    const error = await response.json();
    console.log(`ℹ️  Bucket "${bucketName}" 已存在，繼續上傳文件...\n`);
    return true;
  } else {
    const error = await response.text();
    throw new Error(
      `無法創建 bucket: ${response.status} ${response.statusText}\n${error}`
    );
  }
}

// 上傳文件到 R2
async function uploadFile(filePath, objectKey) {
  const fileContent = readFileSync(filePath);
  const contentType = getContentType(filePath);

  const url = `${API_BASE}/${bucketName}/objects/${encodeURIComponent(
    objectKey
  )}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": contentType,
    },
    body: fileContent,
  });

  return response.ok;
}

// 主函數
async function uploadAssets() {
  try {
    // 檢查 assets 目錄是否存在
    try {
      statSync(assetsDir);
    } catch (error) {
      throw new Error(`Assets 目錄不存在: ${assetsDir}`);
    }

    // 創建 bucket
    await createBucket();

    // 獲取所有文件
    console.log("🔍 正在掃描 app/assets 目錄...\n");
    const allFiles = getAllFiles(assetsDir);
    console.log(`📋 找到 ${allFiles.length} 個文件，開始上傳...\n`);

    let uploaded = 0;
    let failed = 0;

    for (const filePath of allFiles) {
      // 計算相對路徑作為 object key（保留目錄結構）
      const relativePath = relative(assetsDir, filePath);
      const objectKey = relativePath.replace(/\\/g, "/"); // Windows 路徑轉換

      try {
        const success = await uploadFile(filePath, objectKey);
        if (success) {
          uploaded++;
          process.stdout.write(
            `\r✅ 已上傳: ${objectKey} (${uploaded}/${allFiles.length})`
          );
        } else {
          failed++;
          console.error(`\n❌ 上傳失敗: ${objectKey}`);
        }
      } catch (error) {
        failed++;
        console.error(`\n❌ 上傳錯誤: ${objectKey} - ${error.message}`);
      }
    }

    console.log(`\n\n📊 上傳完成:`);
    console.log(`   ✅ 成功: ${uploaded}`);
    console.log(`   ❌ 失敗: ${failed}`);

    if (failed === 0) {
      console.log(`\n✅ 所有文件已成功上傳到 bucket "${bucketName}"！`);
    } else {
      console.log(`\n⚠️  有 ${failed} 個文件上傳失敗，請檢查後重試`);
    }
  } catch (error) {
    console.error(`\n❌ 錯誤: ${error.message}`);
    process.exit(1);
  }
}

uploadAssets();
