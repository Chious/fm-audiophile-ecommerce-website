import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    deps: {
      interopDefault: true,
    },
  },
  resolve: {
    alias: {
      "@/": path.resolve(__dirname, "./app"),
      "@/api": path.resolve(__dirname, "./app/api"),
      "@/database": path.resolve(__dirname, "./database"),
      "@/components": path.resolve(__dirname, "./components"),
      "@/hooks": path.resolve(__dirname, "./hooks"),
      "@/lib": path.resolve(__dirname, "./lib"),
      "@/types": path.resolve(__dirname, "./types"),
      "@/utils": path.resolve(__dirname, "./utils"),
      "@/assets": path.resolve(__dirname, "./app/assets"),
      "@/styles": path.resolve(__dirname, "./styles"),
      "@/data": path.resolve(__dirname, "./data"),
    },
  },
});
