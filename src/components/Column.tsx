import { useRef, useEffect, useState } from 'react';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import Task from './Task';
import useBoard from '../hooks/useBoard';
import { ColumnProps } from '../interfaces/ColumnProps';

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

interface ColumnComponentProps extends ColumnProps {
  searchQuery: string;
  onDeleteColumn: (columnId: string) => void;
  onRenameColumn: (columnId: string, title: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const Column = ({ title, columnId, searchQuery, onDeleteColumn, onRenameColumn, onDeleteTask }: ColumnComponentProps) => {
  const { tasks, startEditingTask, stopEditingTask } = useBoard();
  const colRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(title);

  const config = COLUMN_CONFIG[columnId] ?? getFallbackConfig(columnId);
  const columnTasks = tasks[columnId] ?? [];

  const filteredTasks = searchQuery.trim()
    ? columnTasks.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : columnTasks;

  const isEmpty = columnTasks.length === 0;

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

  useEffect(() => {
    setTitleDraft(title);
  }, [title]);

  const startTitleEdit = () => {
    setIsEditingTitle(true);
    setTimeout(() => {
      titleInputRef.current?.select();
    }, 20);
  };

  const commitTitleEdit = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== title) {
      onRenameColumn(columnId, trimmed);
    } else {
      setTitleDraft(title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitTitleEdit();
    if (e.key === 'Escape') { setTitleDraft(title); setIsEditingTitle(false); }
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
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitleEdit}
              onKeyDown={handleTitleKey}
              className="flex-1 min-w-0 bg-white/6 border border-white/15 text-slate-200 rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              autoFocus
            />
          ) : (
            <h2
              className="text-xs font-semibold uppercase tracking-widest text-slate-400 cursor-pointer hover:text-slate-200 transition-colors truncate"
              onDoubleClick={startTitleEdit}
              title="Double-click to rename"
            >
              {title}
            </h2>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-[11px] font-medium rounded-full px-2 py-0.5 tabular-nums ${config.badgeClass}`}>
            {columnTasks.length}
          </span>
          {isEmpty && (
            <button
              onClick={() => onDeleteColumn(columnId)}
              className="p-0.5 rounded text-slate-700 hover:text-red-400 transition-colors"
              title="Remove column"
              aria-label="Remove column"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tasks */}
      <div className="flex flex-col flex-1 gap-2 px-3 pb-4 overflow-y-auto">
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
    </div>
  );
};

export default Column;
