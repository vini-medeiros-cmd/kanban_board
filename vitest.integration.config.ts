import { defineConfig } from "vitest/config";
import path from "node:path";

// Config separada da padrão (vitest.config.ts): estes testes exigem o Supabase
// local rodando (`npx supabase start`) e não devem ser pegos pelo `npm test`
// nem rodados no CI, que não tem Docker disponível.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    include: ["**/*.integration.test.ts"],
    setupFiles: ["./vitest.integration.setup.ts"],
    hookTimeout: 30000,
    testTimeout: 30000,
  },
});
