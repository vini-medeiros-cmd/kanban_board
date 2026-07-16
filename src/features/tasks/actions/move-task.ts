"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Move uma tarefa para uma nova coluna/posição (drag-and-drop). Não usa
 * controle de versão — mover é uma operação de "última escrita vence" por
 * natureza (a posição não tem valor semântico pra detectar conflito real).
 */
export async function moveTask(
  boardId: string,
  taskId: string,
  targetColumnId: string,
  newPosition: number
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .update({ column_id: targetColumnId, position: newPosition })
    .eq("id", taskId);

  if (error) {
    console.error("[moveTask]", error.message);
    return;
  }

  revalidatePath(`/boards/${boardId}`);
}
