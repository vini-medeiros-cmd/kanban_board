"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { updateTask } from "../actions/update-task";
import { createSubtask, toggleSubtask } from "../actions/subtask-actions";
import type { Task } from "@/features/boards/types";

export function TaskCard({
  boardId,
  task,
  isOverlay = false,
}: {
  boardId: string;
  task: Task;
  isOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [addingSubtask, setAddingSubtask] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const completedCount = task.subtasks.filter((s) => s.is_completed).length;

  async function handleSave() {
    const trimmed = title.trim();
    if (!trimmed || trimmed === task.title) {
      setEditing(false);
      setTitle(task.title);
      return;
    }

    const result = await updateTask(boardId, task.id, task.version, { title: trimmed });
    if (!result.ok) {
      setConflictMessage(
        "Essa tarefa foi editada por outra pessoa enquanto você digitava. Recarregue para ver a versão mais recente antes de salvar de novo."
      );
      return;
    }
    setEditing(false);
  }

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={isOverlay ? undefined : style}
      {...(isOverlay ? {} : attributes)}
      {...(isOverlay ? {} : listeners)}
      className={`rounded-lg border border-white/10 bg-background p-3 text-sm shadow-sm ${
        isOverlay ? "rotate-2 shadow-lg" : "cursor-grab active:cursor-grabbing"
      }`}
    >
      {conflictMessage && (
        <p className="mb-2 rounded bg-red-500/10 px-2 py-1 text-xs text-red-400">
          {conflictMessage}
        </p>
      )}

      {editing ? (
        <div className="flex flex-col gap-2">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="rounded border border-white/15 bg-surface px-2 py-1 text-sm text-white focus:outline-none"
          />
          <div className="flex gap-2 text-xs">
            <button onClick={handleSave} className="text-primary-light">
              Salvar
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setTitle(task.title);
              }}
              className="text-muted hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <p onDoubleClick={() => setEditing(true)} className="font-medium text-white">
          {task.title}
        </p>
      )}

      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-1 text-xs text-muted hover:text-white"
      >
        {task.subtasks.length > 0
          ? `${completedCount}/${task.subtasks.length} subtarefas`
          : "sem subtarefas"}
      </button>

      {expanded && (
        <div className="mt-2 flex flex-col gap-1 border-t border-white/10 pt-2">
          {task.subtasks.map((subtask) => (
            <label key={subtask.id} className="flex items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={subtask.is_completed}
                onChange={(e) => toggleSubtask(boardId, subtask.id, e.target.checked)}
              />
              <span className={subtask.is_completed ? "line-through" : ""}>{subtask.title}</span>
            </label>
          ))}

          {addingSubtask ? (
            <form
              action={async (formData) => {
                await createSubtask(boardId, task.id, formData);
                setAddingSubtask(false);
              }}
              className="mt-1 flex gap-1"
            >
              <input
                name="title"
                autoFocus
                required
                placeholder="Nova subtarefa"
                className="flex-1 rounded border border-white/15 bg-surface px-2 py-1 text-xs text-white focus:outline-none"
              />
              <button type="submit" className="text-xs text-primary-light">
                OK
              </button>
            </form>
          ) : (
            <button
              onClick={() => setAddingSubtask(true)}
              className="mt-1 text-left text-xs text-muted hover:text-white"
            >
              + subtarefa
            </button>
          )}
        </div>
      )}
    </div>
  );
}
