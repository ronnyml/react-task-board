import { TasksState } from './TasksState';
import { ConnectedUser } from './ConnectedUser';

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
  deleteTask: (taskId: string) => void;
}
