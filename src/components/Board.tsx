import { useEffect, useRef, useState, useCallback } from 'react';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import Column from './Column';
import TaskModal from './TaskModal';
import ConfirmDialog from './ConfirmDialog';
import useBoard from '../hooks/useBoard';
import { TasksState } from '../interfaces/TasksState';
import { Task } from '../interfaces/Task';

type Edge = 'top' | 'bottom';

const USER_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4',
];

const getUserColor = (userId: string) =>
  USER_COLORS[userId.charCodeAt(0) % USER_COLORS.length];

interface UndoState {
  task: Task;
  columnId: string;
  index: number;
}

const Board = () => {
  const {
    tasks, updateTasks, deleteTask,
    columns,
    connectedUsers, currentUserId, socketConnected, userName, setUserName,
    selectedTaskId, closeTask,
  } = useBoard();

  const [searchQuery, setSearchQuery] = useState('');
  const [undoQueue, setUndoQueue] = useState<UndoState[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tasksRef = useRef<TasksState>(tasks);
  tasksRef.current = tasks;

  const updateTasksRef = useRef(updateTasks);
  updateTasksRef.current = updateTasks;

  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => source.data.type === 'task',
      onDrop({ source, location }) {
        const dropTargets = location.current.dropTargets;
        if (!dropTargets.length) return;

        const sourceTaskId = source.data.taskId as string;
        const sourceColumnId = source.data.columnId as string;

        const currentTasks = tasksRef.current;
        const newTasks = { ...currentTasks };

        const innerTarget = dropTargets[0];
        const innerData = innerTarget.data;

        if (innerData.type === 'task') {
          const destTaskId = innerData.taskId as string;
          const destColumnId = innerData.columnId as string;
          const closestEdge = extractClosestEdge(innerData) as Edge | null;

          const sourceColTasks = [...newTasks[sourceColumnId]];
          const sourceIdx = sourceColTasks.findIndex((t) => t.id === sourceTaskId);
          if (sourceIdx === -1) return;
          const [movedTask] = sourceColTasks.splice(sourceIdx, 1);

          if (sourceColumnId === destColumnId) {
            const destIdx = sourceColTasks.findIndex((t) => t.id === destTaskId);
            if (destIdx === -1) { sourceColTasks.push(movedTask); }
            else {
              const insertIdx = closestEdge === 'bottom' ? destIdx + 1 : destIdx;
              sourceColTasks.splice(insertIdx, 0, movedTask);
            }
            newTasks[sourceColumnId] = sourceColTasks;
          } else {
            const destColTasks = [...newTasks[destColumnId]];
            const destIdx = destColTasks.findIndex((t) => t.id === destTaskId);
            if (destIdx === -1) { destColTasks.push(movedTask); }
            else {
              const insertIdx = closestEdge === 'bottom' ? destIdx + 1 : destIdx;
              destColTasks.splice(insertIdx, 0, movedTask);
            }
            newTasks[sourceColumnId] = sourceColTasks;
            newTasks[destColumnId] = destColTasks;
          }
        } else if (innerData.type === 'column') {
          const destColumnId = innerData.columnId as string;
          const sourceColTasks = [...newTasks[sourceColumnId]];
          const sourceIdx = sourceColTasks.findIndex((t) => t.id === sourceTaskId);
          if (sourceIdx === -1) return;
          const [movedTask] = sourceColTasks.splice(sourceIdx, 1);

          if (sourceColumnId === destColumnId) {
            sourceColTasks.push(movedTask);
            newTasks[sourceColumnId] = sourceColTasks;
          } else {
            const destColTasks = [...newTasks[destColumnId]];
            destColTasks.push(movedTask);
            newTasks[sourceColumnId] = sourceColTasks;
            newTasks[destColumnId] = destColTasks;
          }
        } else {
          return;
        }

        updateTasksRef.current(newTasks);
      },
    });
  }, []);

  const handleDeleteWithUndo = useCallback((taskId: string) => {
    let found: UndoState | null = null;
    for (const colId in tasks) {
      const idx = tasks[colId].findIndex((t) => t.id === taskId);
      if (idx !== -1) {
        found = { task: tasks[colId][idx], columnId: colId, index: idx };
        break;
      }
    }
    if (!found) return;

    deleteTask(taskId);
    setUndoQueue(prev => [...prev, found!]);

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setUndoQueue([]), 5000);
  }, [tasks, deleteTask]);

  const handleUndo = () => {
    if (!undoQueue.length) return;
    const latest = undoQueue[undoQueue.length - 1];
    const newTasks = { ...tasksRef.current };
    const col = [...(newTasks[latest.columnId] ?? [])];
    col.splice(latest.index, 0, latest.task);
    newTasks[latest.columnId] = col;
    updateTasks(newTasks);
    setUndoQueue(prev => prev.slice(0, -1));
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    if (undoQueue.length > 1) {
      undoTimerRef.current = setTimeout(() => setUndoQueue([]), 5000);
    }
  };

  const requestDelete = useCallback((taskId: string) => {
    if (selectedTaskId === taskId) closeTask();
    setPendingDeleteId(taskId);
  }, [selectedTaskId, closeTask]);

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    handleDeleteWithUndo(pendingDeleteId);
    setPendingDeleteId(null);
  };

  const cancelDelete = () => setPendingDeleteId(null);


  return (
    <div className="flex flex-col gap-5">
      {/* Search bar */}
      <div className="relative w-full sm:w-72">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks…"
          className="w-full bg-[#0d1628] border border-white/8 text-slate-300 placeholder:text-slate-700 rounded-lg pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500/30 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-3 flex items-center text-slate-600 hover:text-slate-400"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {columns.map(({ id, title }) => (
          <Column
            key={id}
            columnId={id}
            title={title}
            searchQuery={searchQuery}
            onDeleteTask={requestDelete}
          />
        ))}
      </div>

      {/* Connected Users */}
      <div className="flex items-center gap-3 p-3 bg-[#0d1628]/60 border border-white/6 rounded-xl">
        {socketConnected ? (
          <>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-slate-500 font-medium">
                {connectedUsers.length} online
              </span>
            </div>
            <div className="w-px h-4 bg-white/8 shrink-0" />
            <div className="flex items-center gap-2 flex-wrap">
              {connectedUsers.map((user) => {
                const isYou = user.id === currentUserId;
                return (
                  <div key={user.id} className="flex items-center gap-1.5">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{
                        backgroundColor: getUserColor(user.id),
                        outline: isYou ? `2px solid ${getUserColor(user.id)}` : undefined,
                        outlineOffset: '2px',
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {user.name}{isYou ? <span className="text-slate-600"> (you)</span> : null}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="w-px h-4 bg-white/8 shrink-0" />
            <button
              onClick={() => {
                const newName = window.prompt('Change your name:', userName);
                if (newName?.trim()) setUserName(newName.trim());
              }}
              className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors shrink-0"
              title="Change your name"
            >
              ✎ rename
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-xs text-slate-600 font-medium">
              Not connected — run <code className="text-slate-500 bg-white/5 px-1 rounded">npm run dev</code>
            </span>
          </div>
        )}
      </div>

      {/* Task modal */}
      {selectedTaskId && <TaskModal onDelete={requestDelete} />}

      {/* Confirm delete dialog */}
      {pendingDeleteId && (
        <ConfirmDialog
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {/* Undo toast */}
      {undoQueue.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-[#1a2744] border border-white/12 rounded-xl px-4 py-3 shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 shrink-0">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          </svg>
          <span className="text-xs text-slate-400">
            <span className="text-slate-300 font-medium">"{undoQueue[undoQueue.length - 1].task.title}"</span> deleted
            {undoQueue.length > 1 && <span className="text-slate-600 ml-1">+{undoQueue.length - 1} more</span>}
          </span>
          <button
            onClick={handleUndo}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors ml-1"
          >
            Undo
          </button>
          <button
            onClick={() => { setUndoQueue([]); if (undoTimerRef.current) clearTimeout(undoTimerRef.current); }}
            className="text-slate-600 hover:text-slate-400 transition-colors ml-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default Board;
