import { LoginForm } from "@/features/auth/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-surface p-6">
        <span className="inline-block rounded bg-primary px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
          Kanban Board
        </span>
        <h1 className="mb-6 mt-2 text-xl font-bold text-white">Entrar</h1>
        <LoginForm error={error} />
      </div>
    </main>
  );
}
