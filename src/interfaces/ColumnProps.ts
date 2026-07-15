export interface ColumnProps {
  title: string;
  columnId: string;
  searchQuery: string;
  onDeleteTask: (taskId: string) => void;
}
