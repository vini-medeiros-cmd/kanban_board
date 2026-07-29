import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBoardWithColumns } from "@/features/boards/queries/get-board-with-columns";
import { createColumn } from "@/features/boards/actions/create-column";
import { BoardView } from "@/features/boards/components/board-view";
import { InviteMemberForm } from "@/features/boards/components/invite-member-form";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const board = await getBoardWithColumns(boardId);
  if (!board) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-muted">
          Board não encontrado, ou você não tem acesso a ele.{" "}
          <Link href="/boards" className="text-primary-light underline">
            Voltar
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="flex w-full flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/boards" className="text-xs text-muted hover:text-white">
            ← Boards
          </Link>
          <h1 className="text-2xl font-bold">{board.name}</h1>
        </div>

        {board.owner_id === user.id && <InviteMemberForm boardId={board.id} />}

        <form
          action={async (formData: FormData) => {
            "use server";
            await createColumn(board.id, formData);
          }}
          className="flex gap-2"
        >
          <input
            name="name"
            placeholder="Nova coluna"
            required
            className="rounded-lg border border-white/15 bg-surface px-3 py-1.5 text-sm text-white focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:brightness-95"
          >
            + Coluna
          </button>
        </form>
      </header>

      {board.columns.length === 0 ? (
        <p className="text-sm text-muted">
          Este board ainda não tem colunas. Crie a primeira acima (ex: &ldquo;A fazer&rdquo;,
          &ldquo;Em progresso&rdquo;, &ldquo;Concluído&rdquo;).
        </p>
      ) : (
        <BoardView board={board} />
      )}
    </main>
  );
}
