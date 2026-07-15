export interface Task {
  id: string;
  title: string;
  description?: string;
  assigneeId?: string;
  dueDate?: string; // YYYY-MM-DD
}
