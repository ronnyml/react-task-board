import { useRef, useEffect, useState } from 'react';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import Task from './Task';
import useBoard from '../hooks/useBoard';
import { ColumnProps } from '../interfaces/ColumnProps';

const COLUMN_CONFIG: Record<string, {
  accent: string;
  badgeClass: string;
  iconPath: string;
  glowClass: string;
}> = {
  'todo': {
    accent: '#3b82f6',
    badgeClass: 'bg-blue-500/15 text-blue-400 ring-1 ring-inset ring-blue-500/25',
    iconPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z',
    glowClass: 'ring-blue-500/30',
  },
  'in-progress': {
    accent: '#f59e0b',
    badgeClass: 'bg-amber-500/15 text-amber-400 ring-1 ring-inset ring-amber-500/25',
    iconPath: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83',
    glowClass: 'ring-amber-500/30',
  },
  'done': {
    accent: '#10b981',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-inset ring-emerald-500/25',
    iconPath: 'M20 6L9 17l-5-5',
    glowClass: 'ring-emerald-500/30',
  },
};

const Column = ({ title, columnId }: ColumnProps) => {
  const { tasks, startEditingTask, stopEditingTask } = useBoard();
  const colRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const config = COLUMN_CONFIG[columnId];
  const columnTasks = tasks[columnId] ?? [];

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

  return (
    <div
      ref={colRef}
      className={[
        'flex flex-col rounded-xl border bg-[#0d1628]/90 backdrop-blur-sm',
        'transition-all duration-200 min-h-[480px]',
        isDragOver
          ? `border-white/20 ring-1 ${config?.glowClass ?? 'ring-slate-500/30'} shadow-lg`
          : 'border-white/8',
      ].join(' ')}
    >
      {/* Column accent bar */}
      <div
        className="h-0.5 rounded-t-xl"
        style={{ background: config?.accent ?? '#64748b' }}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke={config?.accent ?? '#64748b'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {columnId === 'in-progress' ? (
              <path d={config?.iconPath} />
            ) : (
              <path d={config?.iconPath} />
            )}
          </svg>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {title}
          </h2>
        </div>
        <span className={`text-[11px] font-medium rounded-full px-2 py-0.5 tabular-nums ${config?.badgeClass ?? ''}`}>
          {columnTasks.length}
        </span>
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
        ) : (
          columnTasks.map((task, index) => (
            <div
              key={task.id}
              onMouseEnter={() => startEditingTask(task.id)}
              onMouseLeave={() => stopEditingTask(task.id)}
              onMouseUp={() => stopEditingTask(task.id)}
            >
              <Task task={task} index={index} columnId={columnId} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Column;
