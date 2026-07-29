"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type InviteMemberResult = { ok: true } | { ok: false; error: string };

export async function inviteMember(boardId: string, formData: FormData): Promise<InviteMemberResult> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { ok: false, error: "Informe um e-mail." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("invite_board_member", {
    target_board_id: boardId,
    member_email: email,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/boards/${boardId}`);
  return { ok: true };
}
