#!/usr/bin/env node

/**
 * 上傳 app/assets 目錄中的所有文件到 Vercel Blob
 *
 * 需要環境變數（可在根目錄的 .env 文件中設置）:
 *   - AUDIOPHILE_READ_WRITE_TOKEN (Vercel Blob 的讀寫令牌)
 *
 * 使用方法:
 *   1. 在根目錄創建 .env 文件並設置環境變數
 *   2. node scripts/upload-assets-to-r2.mjs
 *
 *   或者使用命令行環境變數:
 *   AUDIOPHILE_READ_WRITE_TOKEN=xxx node scripts/upload-assets-to-r2.mjs
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";
import { put } from "@vercel/blob";

// 讀取 .env 文件
function loadEnvFile() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const projectRoot = join(__dirname, "..");
  const envPath = join(projectRoot, ".env.local");

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

// Vercel Blob 使用 BLOB_READ_WRITE_TOKEN 環境變數
// 但用戶使用的是 AUDIOPHILE_READ_WRITE_TOKEN，所以需要設置
const blobToken = process.env.AUDIOPHILE_READ_WRITE_TOKEN;

console.log("blobToken", blobToken);

if (!blobToken) {
  console.error("❌ 錯誤: 需要設置環境變數:");
  console.error("   - AUDIOPHILE_READ_WRITE_TOKEN (Vercel Blob 的讀寫令牌)");
  console.error("\n可以在根目錄的 .env 文件中設置，或使用命令行環境變數");
  process.exit(1);
}

// 設置 Vercel Blob SDK 需要的環境變數
process.env.BLOB_READ_WRITE_TOKEN = blobToken;

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

// 上傳文件到 Vercel Blob
async function uploadFile(filePath, blobName) {
  const fileContent = readFileSync(filePath);
  const contentType = getContentType(filePath);

  try {
    const blob = await put(blobName, fileContent, {
      access: "public",
      contentType: contentType,
    });
    return { success: true, url: blob.url };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 主函數
async function uploadAssets() {
  try {
    // 檢查 assets 目錄是否存在
    try {
      statSync(assetsDir);
    } catch {
      throw new Error(`Assets 目錄不存在: ${assetsDir}`);
    }

    // 獲取所有文件
    console.log("🔍 正在掃描 app/assets 目錄...\n");
    const allFiles = getAllFiles(assetsDir);
    console.log(
      `📋 找到 ${allFiles.length} 個文件，開始上傳到 Vercel Blob...\n`
    );

    let uploaded = 0;
    let failed = 0;

    for (const filePath of allFiles) {
      // 計算相對路徑作為 blob name（保留目錄結構）
      const relativePath = relative(assetsDir, filePath);
      const blobName = relativePath.replace(/\\/g, "/"); // Windows 路徑轉換

      try {
        const result = await uploadFile(filePath, blobName);
        if (result.success) {
          uploaded++;
          process.stdout.write(
            `\r✅ 已上傳: ${blobName} (${uploaded}/${allFiles.length})`
          );
        } else {
          failed++;
          console.error(`\n❌ 上傳失敗: ${blobName} - ${result.error}`);
        }
      } catch (error) {
        failed++;
        console.error(`\n❌ 上傳錯誤: ${blobName} - ${error.message}`);
      }
    }

    console.log(`\n\n📊 上傳完成:`);
    console.log(`   ✅ 成功: ${uploaded}`);
    console.log(`   ❌ 失敗: ${failed}`);

    if (failed === 0) {
      console.log(`\n✅ 所有文件已成功上傳到 Vercel Blob！`);
    } else {
      console.log(`\n⚠️  有 ${failed} 個文件上傳失敗，請檢查後重試`);
    }
  } catch (error) {
    console.error(`\n❌ 錯誤: ${error.message}`);
    process.exit(1);
  }
}

uploadAssets();
