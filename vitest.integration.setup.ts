import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

// Testes de integração rodam fora do Next, que normalmente carrega .env.local
// sozinho. Replicamos isso aqui pra reusar as mesmas credenciais do Supabase
// local que o `npm run dev` usa (ver README, seção Setup local).
const envPath = path.resolve(__dirname, ".env.local");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
