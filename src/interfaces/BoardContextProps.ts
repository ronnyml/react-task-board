import { TasksState } from './TasksState';

export interface BoardContextProps {
  tasks: TasksState;
  updateTasks: (newTasks: TasksState) => void;
  connectedUsers: string[];
  editingTask: string | null;
  startEditingTask: (taskId: string) => void;
}
