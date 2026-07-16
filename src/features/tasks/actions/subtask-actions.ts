"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { nextPosition } from "../position";

export async function createSubtask(boardId: string, taskId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("subtasks")
    .select("position")
    .eq("task_id", taskId);

  const position = nextPosition((existing ?? []).map((s) => s.position));

  const { error } = await supabase.from("subtasks").insert({ task_id: taskId, title, position });
  if (error) {
    console.error("[createSubtask]", error.message);
    return;
  }

  revalidatePath(`/boards/${boardId}`);
}

export async function toggleSubtask(boardId: string, subtaskId: string, isCompleted: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("subtasks")
    .update({ is_completed: isCompleted })
    .eq("id", subtaskId);

  if (error) {
    console.error("[toggleSubtask]", error.message);
    return;
  }

  revalidatePath(`/boards/${boardId}`);
}
