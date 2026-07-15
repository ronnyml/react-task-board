import { useRef, useEffect, useState } from 'react';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import Task from './Task';
import useBoard from '../hooks/useBoard';
import { ColumnProps } from '../interfaces/ColumnProps';
import { Task as TaskType } from '../interfaces/Task';

const COLUMN_CONFIG: Record<string, {
  accent: string;
  badgeClass: string;
  glowClass: string;
}> = {
  'todo': {
    accent: '#3b82f6',
    badgeClass: 'bg-blue-500/15 text-blue-400 ring-1 ring-inset ring-blue-500/25',
    glowClass: 'ring-blue-500/30',
  },
  'in-progress': {
    accent: '#f59e0b',
    badgeClass: 'bg-amber-500/15 text-amber-400 ring-1 ring-inset ring-amber-500/25',
    glowClass: 'ring-amber-500/30',
  },
  'done': {
    accent: '#10b981',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-inset ring-emerald-500/25',
    glowClass: 'ring-emerald-500/30',
  },
};

const FALLBACK_ACCENTS = ['#6366f1', '#ec4899', '#14b8a6', '#f97316', '#a855f7'];
const getFallbackConfig = (columnId: string) => {
  const color = FALLBACK_ACCENTS[columnId.charCodeAt(0) % FALLBACK_ACCENTS.length];
  return { accent: color, badgeClass: 'bg-slate-700/60 text-slate-400 ring-1 ring-inset ring-white/10', glowClass: 'ring-slate-500/30' };
};

const Column = ({ title, columnId, searchQuery, onDeleteTask }: ColumnProps) => {
  const { tasks, updateTasks, startEditingTask, stopEditingTask } = useBoard();
  const colRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const config = COLUMN_CONFIG[columnId] ?? getFallbackConfig(columnId);
  const columnTasks = tasks[columnId] ?? [];

  const filteredTasks = searchQuery.trim()
    ? columnTasks.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : columnTasks;

  useEffect(() => {
    const el = colRef.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      getData: () => ({ type: 'column', columnId }),
      canDrop: ({ source }) => source.data.type === 'task',
      onDragEnter: () => setIsDragOver(true),
      onDragLeave: () => setIsDragOver(false),
      onDrop: () => setIsDragOver(false),
    });
  }, [columnId]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTaskTitle.trim();
    if (!trimmed) return;
    const newTask: TaskType = { id: `task-${Date.now()}`, title: trimmed };
    const updatedTasks = { ...tasks };
    updatedTasks[columnId] = [newTask, ...(updatedTasks[columnId] ?? [])];
    updateTasks(updatedTasks);
    setNewTaskTitle('');
  };

  return (
    <div
      ref={colRef}
      className={[
        'flex flex-col rounded-xl border bg-[#0d1628]/90 backdrop-blur-sm',
        'transition-all duration-200 min-h-[420px]',
        isDragOver
          ? `border-white/20 ring-1 ${config.glowClass} shadow-lg`
          : 'border-white/8',
      ].join(' ')}
    >
      {/* Accent bar */}
      <div
        className="h-0.5 rounded-t-xl"
        style={{ background: config.accent }}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 truncate">
          {title}
        </h2>
        <span className={`text-[11px] font-medium rounded-full px-2 py-0.5 tabular-nums shrink-0 ${config.badgeClass}`}>
          {columnTasks.length}
        </span>
      </div>

      {/* Tasks */}
      <div className="flex flex-col flex-1 gap-2 px-3 overflow-y-auto">
        {columnTasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10 gap-2 border-2 border-dashed border-white/6 rounded-lg m-1">
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-700">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <p className="text-xs text-slate-700">Drop tasks here</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-8">
            <p className="text-xs text-slate-700">No matches</p>
          </div>
        ) : (
          filteredTasks.map((task, index) => (
            <div
              key={task.id}
              onMouseEnter={() => startEditingTask(task.id)}
              onMouseLeave={() => stopEditingTask(task.id)}
              onMouseUp={() => stopEditingTask(task.id)}
            >
              <Task
                task={task}
                index={index}
                columnId={columnId}
                onDelete={() => onDeleteTask(task.id)}
              />
            </div>
          ))
        )}
      </div>

      {/* Add task input */}
      <div className="px-3 pb-3 pt-2">
        <form onSubmit={handleAddTask}>
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="+ Add a task…"
            className="w-full bg-transparent text-xs text-slate-500 placeholder:text-slate-700 focus:placeholder:text-slate-600 focus:text-slate-300 focus:bg-white/4 rounded-lg px-2.5 py-2 border border-transparent focus:border-white/10 outline-none transition-all"
          />
        </form>
      </div>
    </div>
  );
};

export default Column;
