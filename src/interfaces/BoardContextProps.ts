import { TasksState } from './TasksState';

export interface BoardContextProps {
  tasks: TasksState;
  updateTasks: (newTasks: TasksState) => void;
}
