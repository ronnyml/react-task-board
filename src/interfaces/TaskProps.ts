import { Task } from './Task';

export interface TaskProps {
  task: Task;
  index: number;
  columnId: string;
  onDelete: () => void;
}
