import { createClient } from "@/lib/supabase/server";
import type { BoardWithColumns } from "../types";

/**
 * Busca um board com colunas, tarefas e subtarefas aninhadas, já ordenadas por
 * posição. RLS garante que só membros do board recebem uma linha de volta —
 * se o usuário não for membro, `data` vem null (não é erro, é 0 linhas).
 */
export async function getBoardWithColumns(boardId: string): Promise<BoardWithColumns | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("boards")
    .select(
      `
        id, name, created_at,
        columns (
          id, name, position,
          tasks (
            id, title, description, position, version,
            subtasks ( id, title, is_completed, position )
          )
        )
      `
    )
    .eq("id", boardId)
    .order("position", { referencedTable: "columns" })
    .order("position", { referencedTable: "columns.tasks" })
    .order("position", { referencedTable: "columns.tasks.subtasks" })
    .maybeSingle();

  if (error) {
    console.error("[getBoardWithColumns]", error.message);
    return null;
  }

  return data as BoardWithColumns | null;
}
