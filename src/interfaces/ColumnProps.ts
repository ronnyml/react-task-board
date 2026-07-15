export interface ColumnProps {
  title: string;
  columnId: string;
  searchQuery: string;
  onDeleteColumn: (columnId: string) => void;
  onRenameColumn: (columnId: string, title: string) => void;
  onDeleteTask: (taskId: string) => void;
}
