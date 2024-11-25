import { Task } from './Task';

export interface TasksState {
  [key: string]: Task[];
}
