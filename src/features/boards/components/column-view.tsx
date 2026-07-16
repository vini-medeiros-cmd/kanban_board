"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { createTask } from "@/features/tasks/actions/create-task";
import { TaskCard } from "@/features/tasks/components/task-card";
import type { Column } from "../types";

export function ColumnView({ boardId, column }: { boardId: string; column: Column }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [adding, setAdding] = useState(false);

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col gap-3 rounded-xl border p-3 transition-colors ${
        isOver ? "border-primary/60 bg-surface-hover" : "border-white/10 bg-surface"
      }`}
    >
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          {column.name}
        </h2>
        <span className="text-xs text-muted">{column.tasks.length}</span>
      </div>

      <SortableContext items={column.tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {column.tasks.map((task) => (
            <TaskCard key={task.id} boardId={boardId} task={task} />
          ))}
        </div>
      </SortableContext>

      {adding ? (
        <form
          action={async (formData) => {
            await createTask(boardId, column.id, formData);
            setAdding(false);
          }}
          className="flex flex-col gap-2"
        >
          <input
            name="title"
            autoFocus
            required
            placeholder="Título da tarefa"
            className="rounded-lg border border-white/15 bg-background px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white"
            >
              Adicionar
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="text-xs text-muted hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="rounded-lg px-2 py-1.5 text-left text-xs text-muted hover:bg-surface-hover hover:text-white"
        >
          + Adicionar tarefa
        </button>
      )}
    </div>
  );
}
