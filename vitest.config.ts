import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Load environment from .env.test
    env: {
      NODE_ENV: "test",
    },
    // Setup file to run before tests
    setupFiles: ["./tests/setup.ts"],
    // Test timeouts
    testTimeout: 10000,
    hookTimeout: 30000,
    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "tests/**",
        "**/*.config.*",
        "**/*.d.ts",
        "**/types/**",
      ],
    },
    // Vitest configuration
    deps: {
      interopDefault: true,
    },
    // Reporter
    reporters: ["verbose"],
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
