import { useRef, useEffect, useState } from 'react';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { TaskProps } from '../interfaces/TaskProps';
import useBoard from '../hooks/useBoard';

type Edge = 'top' | 'bottom';

const USER_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4',
];

const getUserColor = (userId: string) =>
  USER_COLORS[userId.charCodeAt(0) % USER_COLORS.length];

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

const getDueDateStatus = (dueDate: string): 'overdue' | 'soon' | 'upcoming' => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');
  const diff = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 0) return 'overdue';
  if (diff <= 3) return 'soon';
  return 'upcoming';
};

const DUE_DATE_STYLE: Record<string, string> = {
  overdue: 'bg-red-500/15 text-red-400 ring-1 ring-inset ring-red-500/25',
  soon: 'bg-amber-500/15 text-amber-400 ring-1 ring-inset ring-amber-500/25',
  upcoming: 'bg-slate-700/60 text-slate-500 ring-1 ring-inset ring-white/6',
};

const formatDate = (iso: string) => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

interface TaskComponentProps extends TaskProps {
  onDelete: () => void;
}

const Task = ({ task, index, columnId, onDelete }: TaskComponentProps) => {
  const { editingUsers, currentUserId, userNames, connectedUsers, openTask } = useBoard();
  const cardRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

  const editingUserId = editingUsers[task.id];
  const isBeingEdited = !!editingUserId && editingUserId !== currentUserId;
  const editingUserName = editingUserId ? (userNames[editingUserId] ?? editingUserId) : null;

  const borderClass = COLUMN_TASK_BORDER[columnId] ?? 'border-l-slate-500';
  const dropLineClass = DROP_LINE_COLOR[columnId] ?? 'bg-slate-500';

  const assignee = task.assigneeId
    ? connectedUsers.find((u) => u.id === task.assigneeId)
    : null;

  const dueDateStatus = task.dueDate ? getDueDateStatus(task.dueDate) : null;

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

  return (
    <div className="relative select-none">
      {isDragOver && closestEdge === 'top' && (
        <div className={`h-0.5 rounded-full mx-1 mb-1 ${dropLineClass}`} />
      )}

      <div
        ref={cardRef}
        onClick={() => openTask(task.id, columnId)}
        className={[
          'group relative rounded-r-xl p-3.5',
          'bg-[#0f1c36] border border-white/6 border-l-2',
          borderClass,
          'cursor-pointer active:cursor-grabbing',
          'transition-all duration-150',
          'hover:bg-[#132140] hover:border-white/12 hover:shadow-lg hover:shadow-black/40 hover:-translate-y-px',
          isDragging ? 'opacity-30 scale-[0.97]' : '',
          isBeingEdited ? 'ring-1 ring-blue-500/50' : '',
        ].join(' ')}
      >
        {/* Delete button */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          aria-label="Delete task"
          className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-400/10"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>

        {/* Title */}
        <p className="text-sm text-slate-200 leading-snug break-words pr-5 font-medium">
          {task.title}
        </p>

        {/* Description snippet */}
        {task.description && (
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-2 break-words">
            {task.description}
          </p>
        )}

        {/* Editing indicator */}
        {isBeingEdited && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
            {editingUserName} is viewing…
          </div>
        )}

        {/* Footer: due date + assignee */}
        {(task.dueDate || task.assigneeId) && (
          <div className="mt-2.5 flex items-center justify-between gap-2">
            {task.dueDate && dueDateStatus ? (
              <span className={`text-[11px] font-medium rounded-full px-2 py-0.5 ${DUE_DATE_STYLE[dueDateStatus]}`}>
                {dueDateStatus === 'overdue' ? '⚠ ' : ''}{formatDate(task.dueDate)}
              </span>
            ) : <span />}

            {task.assigneeId && (
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                style={{ backgroundColor: getUserColor(task.assigneeId) }}
                title={assignee?.name ?? task.assigneeId}
              >
                {(assignee?.name ?? task.assigneeId).charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}
      </div>

      {isDragOver && closestEdge === 'bottom' && (
        <div className={`h-0.5 rounded-full mx-1 mt-1 ${dropLineClass}`} />
      )}
    </div>
  );
};

export default Task;
