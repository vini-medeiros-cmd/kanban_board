"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createColumn(boardId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const supabase = await createClient();

  // Próxima posição = quantidade de colunas já existentes no board.
  const { count } = await supabase
    .from("columns")
    .select("id", { count: "exact", head: true })
    .eq("board_id", boardId);

  const { error } = await supabase
    .from("columns")
    .insert({ board_id: boardId, name, position: count ?? 0 });

  if (error) {
    console.error("[createColumn]", error.message);
    return;
  }

  revalidatePath(`/boards/${boardId}`);
}
