import { configDefaults, defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    // Testes de integração (ver vitest.integration.config.ts) exigem Supabase
    // local e rodam à parte via `npm run test:integration`.
    exclude: [...configDefaults.exclude, "**/*.integration.test.ts"],
  },
});
