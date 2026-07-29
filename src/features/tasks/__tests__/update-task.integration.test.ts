import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";

// Cookie jar em memória que simula o armazenamento de sessão que o Next faria
// via cookies HTTP reais. `vi.hoisted` garante que exista antes dos vi.mock
// abaixo serem içados para o topo do módulo.
const { fakeCookieStore } = vi.hoisted(() => {
  const cookieJar = new Map<string, string>();
  return {
    fakeCookieStore: {
      getAll: () => Array.from(cookieJar.entries()).map(([name, value]) => ({ name, value })),
      set: (name: string, value: string) => cookieJar.set(name, value),
    },
  };
});

vi.mock("next/headers", () => ({
  cookies: async () => fakeCookieStore,
}));

vi.mock("next/cache", () => ({
  revalidatePath: () => {},
}));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE_KEY) {
  throw new Error(
    "Faltam variáveis do Supabase local. Rode `npx supabase start` e preencha .env.local (ver README)."
  );
}

const admin = createSupabaseClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_EMAIL = `update-task-${Date.now()}@example.com`;
const TEST_PASSWORD = "test-password-123";

let userId: string;
let boardId: string;
let taskId: string;

beforeAll(async () => {
  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  });
  if (userError || !userData.user) throw userError ?? new Error("falha ao criar usuário de teste");
  userId = userData.user.id;

  const { data: board, error: boardError } = await admin
    .from("boards")
    .insert({ name: "Board de teste (integração)", owner_id: userId })
    .select("id")
    .single();
  if (boardError || !board) throw boardError ?? new Error("falha ao criar board de teste");
  boardId = board.id;

  const { data: column, error: columnError } = await admin
    .from("columns")
    .insert({ board_id: boardId, name: "Coluna de teste", position: 0 })
    .select("id")
    .single();
  if (columnError || !column) throw columnError ?? new Error("falha ao criar coluna de teste");

  const { data: task, error: taskError } = await admin
    .from("tasks")
    .insert({ column_id: column.id, title: "Tarefa original" })
    .select("id")
    .single();
  if (taskError || !task) throw taskError ?? new Error("falha ao criar tarefa de teste");
  taskId = task.id;

  // Autentica no mesmo cookie jar que o updateTask() (via next/headers mockado)
  // vai ler — é assim que a sessão chega até a server action, igual em produção.
  const setupClient = createServerClient<Database>(SUPABASE_URL, ANON_KEY, {
    cookies: {
      getAll: fakeCookieStore.getAll,
      setAll: (cookies) => cookies.forEach(({ name, value }) => fakeCookieStore.set(name, value)),
    },
  });
  const { error: signInError } = await setupClient.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  if (signInError) throw signInError;
});

afterAll(async () => {
  if (boardId) await admin.from("boards").delete().eq("id", boardId);
  if (userId) await admin.auth.admin.deleteUser(userId);
});

describe("updateTask — conflito de edição concorrente", () => {
  it("aplica a primeira escrita e rejeita a segunda, que ainda achava que a versão era a antiga", async () => {
    const { updateTask } = await import("../actions/update-task");

    const first = await updateTask(boardId, taskId, 1, { title: "Editado por A" });
    expect(first).toEqual({ ok: true });

    // Escrita concorrente: não sabe que a versão já virou 2 depois do update de A.
    const second = await updateTask(boardId, taskId, 1, { title: "Editado por B" });
    expect(second.ok).toBe(false);
    if (!second.ok) {
      expect(second.conflict).toBe(true);
      expect(second.currentVersion).toBe(2);
    }

    const { data: current } = await admin
      .from("tasks")
      .select("title, version")
      .eq("id", taskId)
      .single();
    expect(current?.title).toBe("Editado por A");
    expect(current?.version).toBe(2);
  });
});
