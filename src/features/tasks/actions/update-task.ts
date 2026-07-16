"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type UpdateTaskResult = { ok: true } | { ok: false; conflict: true; currentVersion: number };

/**
 * Atualiza título/descrição de uma tarefa com controle de concorrência otimista:
 * o update só é aplicado se `expectedVersion` ainda bater com a versão no banco.
 * Se outra pessoa editou a tarefa nesse meio-tempo, retorna conflict=true com a
 * versão atual, para a UI decidir como avisar o usuário (recarregar, mesclar, etc).
 */
export async function updateTask(
  boardId: string,
  taskId: string,
  expectedVersion: number,
  changes: { title?: string; description?: string }
): Promise<UpdateTaskResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .update(changes)
    .eq("id", taskId)
    .eq("version", expectedVersion)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[updateTask]", error.message);
    return { ok: false, conflict: true, currentVersion: expectedVersion };
  }

  if (!data) {
    // 0 linhas afetadas: a versão não bateu (conflito) OU a tarefa não existe mais.
    const { data: current } = await supabase
      .from("tasks")
      .select("version")
      .eq("id", taskId)
      .maybeSingle();

    return { ok: false, conflict: true, currentVersion: current?.version ?? expectedVersion };
  }

  revalidatePath(`/boards/${boardId}`);
  return { ok: true };
}
