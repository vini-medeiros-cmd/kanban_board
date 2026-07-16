"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { nextPosition } from "../position";

export async function createTask(boardId: string, columnId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: existing } = await supabase
    .from("tasks")
    .select("position")
    .eq("column_id", columnId);

  const position = nextPosition((existing ?? []).map((t) => t.position));

  const { error } = await supabase
    .from("tasks")
    .insert({ column_id: columnId, title, position, created_by: user?.id ?? null });

  if (error) {
    console.error("[createTask]", error.message);
    return;
  }

  revalidatePath(`/boards/${boardId}`);
}
