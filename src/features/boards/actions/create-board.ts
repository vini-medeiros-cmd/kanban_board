"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createBoard(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("boards")
    .insert({ name, owner_id: user.id })
    .select("id")
    .single();

  if (error) {
    console.error("[createBoard]", error.message);
    return;
  }

  revalidatePath("/boards");
  redirect(`/boards/${data.id}`);
}
