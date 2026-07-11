import { useRef, useEffect, useState } from 'react';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { TaskProps } from '../interfaces/TaskProps';
import useBoard from '../hooks/useBoard';

type Edge = 'top' | 'bottom';

const COLUMN_TASK_BORDER: Record<string, string> = {
  'todo': 'border-l-blue-500',
  'in-progress': 'border-l-amber-500',
  'done': 'border-l-emerald-500',
};

const DROP_LINE_COLOR: Record<string, string> = {
  'todo': 'bg-blue-500',
  'in-progress': 'bg-amber-500',
  'done': 'bg-emerald-500',
};

const Task = ({ task, index, columnId }: TaskProps) => {
  const { editingUsers, currentUserId, deleteTask } = useBoard();
  const cardRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

  const isBeingEdited = editingUsers[task.id] && editingUsers[task.id] !== currentUserId;
  const editingUser = editingUsers[task.id];

  const borderClass = COLUMN_TASK_BORDER[columnId] ?? 'border-l-slate-500';
  const dropLineClass = DROP_LINE_COLOR[columnId] ?? 'bg-slate-500';

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const cleanupDraggable = draggable({
      element: el,
      getInitialData: () => ({ type: 'task', taskId: task.id, columnId }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });

    const cleanupDropTarget = dropTargetForElements({
      element: el,
      getData: ({ input, element: target }) =>
        attachClosestEdge(
          { type: 'task', taskId: task.id, columnId, index },
          { element: target, input, allowedEdges: ['top', 'bottom'] }
        ),
      canDrop: ({ source }) =>
        source.data.type === 'task' && source.data.taskId !== task.id,
      onDrag: ({ self }) => {
        const edge = extractClosestEdge(self.data) as Edge | null;
        setClosestEdge(edge);
        setIsDragOver(true);
      },
      onDragLeave: () => {
        setClosestEdge(null);
        setIsDragOver(false);
      },
      onDrop: () => {
        setClosestEdge(null);
        setIsDragOver(false);
      },
    });

    return () => {
      cleanupDraggable();
      cleanupDropTarget();
    };
  }, [task.id, columnId, index]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
    }
  };

  return (
    <div className="relative select-none">
      {isDragOver && closestEdge === 'top' && (
        <div className={`h-0.5 rounded-full mx-1 mb-1 ${dropLineClass}`} />
      )}

      <div
        ref={cardRef}
        className={[
          'group flex items-start justify-between gap-2 rounded-lg p-3',
          'bg-[#0f1c36] border border-white/6 border-l-2',
          borderClass,
          'cursor-grab active:cursor-grabbing',
          'transition-all duration-150',
          'hover:bg-[#132140] hover:border-white/10 hover:shadow-lg hover:shadow-black/30',
          isDragging ? 'opacity-30 scale-[0.97]' : '',
          isBeingEdited ? 'ring-1 ring-blue-500/60' : '',
        ].join(' ')}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-200 leading-snug break-words">{task.title}</p>
          {isBeingEdited && (
            <span className="mt-1.5 flex items-center gap-1 text-[11px] text-blue-400">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              {editingUser} is viewing…
            </span>
          )}
        </div>

        <button
          onClick={handleDelete}
          aria-label="Delete task"
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 rounded text-slate-600 hover:text-red-400 hover:bg-red-400/10"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>

      {isDragOver && closestEdge === 'bottom' && (
        <div className={`h-0.5 rounded-full mx-1 mt-1 ${dropLineClass}`} />
      )}
    </div>
  );
};

export default Task;
