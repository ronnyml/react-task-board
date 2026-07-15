import { TasksState } from './TasksState';
import { ConnectedUser } from './ConnectedUser';
import { ColumnDef } from './ColumnDef';
import { Task } from './Task';

export interface BoardContextProps {
  connectedUsers: ConnectedUser[];
  userNames: { [id: string]: string };
  editingUsers: { [key: string]: string | null };
  currentUserId: string | null;
  userName: string;
  editingTask: string | null;
  socketConnected: boolean;
  setUserName: (name: string) => void;
  startEditingTask: (taskId: string) => void;
  stopEditingTask: (taskId: string) => void;
  tasks: TasksState;
  updateTasks: (newTasks: TasksState) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  columns: ColumnDef[];
  updateColumns: (cols: ColumnDef[]) => void;
  selectedTaskId: string | null;
  selectedTaskColumnId: string | null;
  openTask: (taskId: string, columnId: string) => void;
  closeTask: () => void;
}
