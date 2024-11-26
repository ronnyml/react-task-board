import { TasksState } from './TasksState';

export interface BoardContextProps {
  connectedUsers: string[];
  editingUsers: { [key: string]: string | null };
  currentUserId: string | null;
  editingTask: string | null;
  startEditingTask: (taskId: string) => void;
  stopEditingTask: (taskId: string) => void;
  tasks: TasksState;
  updateTasks: (newTasks: TasksState) => void;
  deleteTask: (taskId: string) => void;
}
