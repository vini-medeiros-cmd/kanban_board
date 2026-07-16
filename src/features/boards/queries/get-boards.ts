import { createClient } from "@/lib/supabase/server";
import type { BoardSummary } from "../types";

/** Lista os boards de que o usuário atual é membro (RLS filtra automaticamente). */
export async function getBoards(): Promise<BoardSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boards")
    .select("id, name, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getBoards]", error.message);
    return [];
  }
  return data ?? [];
}
