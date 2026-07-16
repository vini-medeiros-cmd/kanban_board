"use client";

import { useState } from "react";
import { signInWithPassword, signUpWithPassword } from "../actions";

export function LoginForm({ error }: { error?: string }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const action = mode === "signin" ? signInWithPassword : signUpWithPassword;

  const inputClass =
    "rounded-lg border border-white/15 bg-background px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      {error && (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted" htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" required className={inputClass} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted" htmlFor="password">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-black hover:brightness-95"
      >
        {mode === "signin" ? "Entrar" : "Criar conta"}
      </button>

      <button
        type="button"
        className="text-xs text-muted underline hover:text-white"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
      >
        {mode === "signin" ? "Não tem conta? Criar uma" : "Já tem conta? Entrar"}
      </button>
    </form>
  );
}
