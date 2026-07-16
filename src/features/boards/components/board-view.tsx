"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { createClient } from "@/lib/supabase/client";
import { moveTask } from "@/features/tasks/actions/move-task";
import type { BoardWithColumns, Column, Task } from "../types";
import { ColumnView } from "./column-view";
import { TaskCard } from "@/features/tasks/components/task-card";

export function BoardView({ board }: { board: BoardWithColumns }) {
  const [columns, setColumns] = useState<Column[]>(board.columns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  // Espelha a prop mais recente vista, pra detectar mudança durante a
  // renderização (padrão recomendado pelo React em vez de useEffect+setState,
  // que causaria uma renderização em cascata extra).
  const [syncedColumns, setSyncedColumns] = useState(board.columns);
  if (board.columns !== syncedColumns) {
    setSyncedColumns(board.columns);
    setColumns(board.columns);
  }

  // Colaboração em tempo real: qualquer INSERT/UPDATE/DELETE em tasks de uma
  // coluna deste board reaplica um refresh simples (busca o board de novo).
  // Uma otimização futura seria mesclar só a linha alterada via payload.new.
  useEffect(() => {
    const supabase = createClient();
    const columnIds = board.columns.map((c) => c.id);
    if (columnIds.length === 0) return;

    const channel = supabase
      .channel(`board-${board.id}-tasks`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `column_id=in.(${columnIds.join(",")})`,
        },
        () => {
          window.location.reload();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [board.id, board.columns]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function findColumnOf(taskId: string): Column | undefined {
    return columns.find((c) => c.tasks.some((t) => t.id === taskId));
  }

  function handleDragStart(event: DragStartEvent) {
    const task = columns.flatMap((c) => c.tasks).find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const sourceColumn = findColumnOf(String(active.id));
    if (!sourceColumn) return;

    // "over" pode ser outra tarefa (solta em cima dela) ou a própria coluna (vazia).
    const targetColumn =
      columns.find((c) => c.id === over.id) ?? findColumnOf(String(over.id)) ?? sourceColumn;

    const sourceIndex = sourceColumn.tasks.findIndex((t) => t.id === active.id);
    const overIndex = targetColumn.tasks.findIndex((t) => t.id === over.id);
    const targetIndex = overIndex >= 0 ? overIndex : targetColumn.tasks.length;

    if (sourceColumn.id === targetColumn.id && sourceIndex === targetIndex) return;

    const movedTask = sourceColumn.tasks[sourceIndex];

    setColumns((prev) => {
      const next = prev.map((c) => ({ ...c, tasks: [...c.tasks] }));
      const src = next.find((c) => c.id === sourceColumn.id)!;
      const dst = next.find((c) => c.id === targetColumn.id)!;

      src.tasks.splice(sourceIndex, 1);
      if (src.id === dst.id) {
        dst.tasks.splice(targetIndex > sourceIndex ? targetIndex - 1 : targetIndex, 0, movedTask);
      } else {
        dst.tasks.splice(targetIndex, 0, movedTask);
      }

      src.tasks = src.tasks.map((t, i) => ({ ...t, position: i }));
      dst.tasks = dst.tasks.map((t, i) => ({ ...t, position: i }));
      return next;
    });

    const finalIndex = Math.min(targetIndex, targetColumn.tasks.length);
    void moveTask(board.id, movedTask.id, targetColumn.id, finalIndex);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <ColumnView key={column.id} boardId={board.id} column={column} />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard boardId={board.id} task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
