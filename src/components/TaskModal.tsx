import { useState, useEffect, useRef } from 'react';
import useBoard from '../hooks/useBoard';

const USER_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4',
];

const getUserColor = (userId: string) =>
  USER_COLORS[userId.charCodeAt(0) % USER_COLORS.length];

const COLUMN_ACCENT: Record<string, string> = {
  'todo': '#3b82f6',
  'in-progress': '#f59e0b',
  'done': '#10b981',
};

interface TaskModalProps {
  onDelete: (taskId: string) => void;
}

const TaskModal = ({ onDelete }: TaskModalProps) => {
  const {
    tasks,
    columns,
    connectedUsers,
    selectedTaskId,
    selectedTaskColumnId,
    updateTask,
    closeTask,
  } = useBoard();

  const task = selectedTaskId && selectedTaskColumnId
    ? (tasks[selectedTaskColumnId] ?? []).find((t) => t.id === selectedTaskId) ?? null
    : null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
  const [dueDate, setDueDate] = useState('');

  const titleRef = useRef<HTMLInputElement>(null);
  const isDirtyRef = useRef(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setAssigneeId(task.assigneeId);
      setDueDate(task.dueDate ?? '');
      isDirtyRef.current = false;
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [selectedTaskId]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [title, description, assigneeId, dueDate, task]);

  if (!selectedTaskId || !task) return null;

  const accent = COLUMN_ACCENT[selectedTaskColumnId ?? ''] ?? '#64748b';
  const columnTitle = columns.find((c) => c.id === selectedTaskColumnId)?.title ?? '';

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    updateTask(task.id, {
      title: trimmed,
      description: description.trim() || undefined,
      assigneeId,
      dueDate: dueDate || undefined,
    });
    closeTask();
  };

  const handleClose = () => {
    closeTask();
  };

  const handleDelete = () => {
    onDelete(task.id);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const assignee = assigneeId ? connectedUsers.find((u) => u.id === assigneeId) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="w-full max-w-lg bg-[#0d1628] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent bar */}
        <div className="h-0.5" style={{ background: accent }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/6">
          <span
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: accent }}
          >
            {columnTitle}
          </span>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/6 transition-colors"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="block text-[11px] text-slate-500 font-medium mb-1.5 uppercase tracking-wider">Title</label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
              className="w-full bg-[#060d1f] border border-white/10 text-slate-100 placeholder:text-slate-700 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/40 transition-all"
              placeholder="Task title…"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] text-slate-500 font-medium mb-1.5 uppercase tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-[#060d1f] border border-white/10 text-slate-200 placeholder:text-slate-700 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/40 transition-all resize-none"
              placeholder="Add a description…"
            />
          </div>

          {/* Assignee + Due date row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Assignee */}
            <div>
              <label className="block text-[11px] text-slate-500 font-medium mb-1.5 uppercase tracking-wider">Assignee</label>
              {connectedUsers.length === 0 ? (
                <p className="text-xs text-slate-600">No users online</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {/* Unassign option */}
                  <button
                    onClick={() => setAssigneeId(undefined)}
                    className={[
                      'w-7 h-7 rounded-full border flex items-center justify-center transition-all',
                      !assigneeId
                        ? 'border-slate-400 bg-slate-700'
                        : 'border-white/10 bg-white/4 hover:bg-white/8',
                    ].join(' ')}
                    title="Unassigned"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                  {connectedUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setAssigneeId(user.id === assigneeId ? undefined : user.id)}
                      title={user.name}
                      className={[
                        'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white transition-all',
                        assigneeId === user.id
                          ? 'ring-2 ring-offset-2 ring-offset-[#0d1628] scale-110'
                          : 'opacity-60 hover:opacity-100',
                      ].join(' ')}
                      style={{
                        backgroundColor: getUserColor(user.id),
                        ...(assigneeId === user.id ? { ringColor: getUserColor(user.id) } : {}),
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
              {assignee && (
                <p className="mt-1.5 text-xs text-slate-500">{assignee.name}</p>
              )}
            </div>

            {/* Due date */}
            <div>
              <label className="block text-[11px] text-slate-500 font-medium mb-1.5 uppercase tracking-wider">Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#060d1f] border border-white/10 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/40 transition-all [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/6">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
            Delete task
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/6 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
