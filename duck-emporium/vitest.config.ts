import { defineConfig } from "vitest/config";

// Ensure config-required env vars are present for contract tests that import
// src/server.ts (which evaluates src/config.ts at module load).
process.env.ADMIN_SECRET ||= "test-admin-secret";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["tests/**/*.test.ts"],
  },
});
