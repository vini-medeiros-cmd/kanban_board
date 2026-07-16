export type Subtask = {
  id: string;
  title: string;
  is_completed: boolean;
  position: number;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  position: number;
  version: number;
  subtasks: Subtask[];
};

export type Column = {
  id: string;
  name: string;
  position: number;
  tasks: Task[];
};

export type BoardSummary = {
  id: string;
  name: string;
  created_at: string;
};

export type BoardWithColumns = BoardSummary & {
  columns: Column[];
};
