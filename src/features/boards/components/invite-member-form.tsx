"use client";

import { useState } from "react";
import { inviteMember } from "../actions/invite-member";

export function InviteMemberForm({ boardId }: { boardId: string }) {
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setMessage(null);
    const result = await inviteMember(boardId, formData);
    setPending(false);

    if (!result.ok) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    setMessage({ type: "ok", text: "Membro adicionado ao board." });
  }

  return (
    <div className="flex flex-col gap-1">
      <form action={handleSubmit} className="flex gap-2">
        <input
          type="email"
          name="email"
          placeholder="e-mail do convidado"
          required
          className="rounded-lg border border-white/15 bg-surface px-3 py-1.5 text-sm text-white focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-white/15 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/5 disabled:opacity-50"
        >
          Convidar
        </button>
      </form>
      {message && (
        <p className={`text-xs ${message.type === "error" ? "text-red-400" : "text-primary-light"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
