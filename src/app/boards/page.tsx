import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBoards } from "@/features/boards/queries/get-boards";
import { createBoard } from "@/features/boards/actions/create-board";
import { signOut } from "@/features/auth/actions";

export default async function BoardsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const boards = await getBoards();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Seus boards</h1>
        <form action={signOut}>
          <button type="submit" className="text-sm text-muted hover:text-white">
            Sair
          </button>
        </form>
      </header>

      <form action={createBoard} className="flex gap-2">
        <input
          name="name"
          placeholder="Nome do novo board"
          required
          className="flex-1 rounded-lg border border-white/15 bg-surface px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:brightness-95"
        >
          Criar board
        </button>
      </form>

      {boards.length === 0 ? (
        <p className="text-sm text-muted">
          Você ainda não tem nenhum board. Crie o primeiro acima.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {boards.map((board) => (
            <li key={board.id}>
              <Link
                href={`/boards/${board.id}`}
                className="block rounded-xl border border-white/10 bg-surface p-4 hover:bg-surface-hover"
              >
                <span className="font-medium text-white">{board.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
