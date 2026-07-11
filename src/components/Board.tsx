import { useEffect, useRef, useState } from 'react';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import Column from './Column';
import useBoard from '../hooks/useBoard';
import { TasksState } from '../interfaces/TasksState';

type Edge = 'top' | 'bottom';

const USER_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4',
];

const getUserColor = (userId: string) =>
  USER_COLORS[userId.charCodeAt(0) % USER_COLORS.length];

const COLUMNS = [
  { columnId: 'todo', title: 'To Do' },
  { columnId: 'in-progress', title: 'In Progress' },
  { columnId: 'done', title: 'Done' },
];

const Board = () => {
  const { tasks, updateTasks, connectedUsers, currentUserId, socketConnected } = useBoard();
  const [newTaskTitle, setNewTaskTitle] = useState('');

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

  const handleAddTask = () => {
    const title = newTaskTitle.trim();
    if (!title) return;
    const newTask = { id: `task-${Date.now()}`, title };
    const updatedTasks = { ...tasks };
    updatedTasks['todo'] = [newTask, ...updatedTasks['todo']];
    updateTasks(updatedTasks);
    setNewTaskTitle('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddTask();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Add task */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="New task title…"
            className="w-full bg-[#0d1628] border border-white/10 text-slate-200 placeholder:text-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
        </div>
        <button
          onClick={handleAddTask}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-150 shrink-0"
        >
          Add Task
        </button>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map(({ columnId, title }) => (
          <Column key={columnId} columnId={columnId} title={title} />
        ))}
      </div>

      {/* Connected Users */}
      <div className="flex items-center gap-3 p-3 bg-[#0d1628]/60 border border-white/6 rounded-xl w-fit">
        {socketConnected ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-slate-500 font-medium">
                {connectedUsers.length} online
              </span>
            </div>
            <div className="w-px h-4 bg-white/8" />
            <div className="flex items-center gap-1.5">
              {connectedUsers.map((user) => {
                const isYou = user === currentUserId;
                return (
                  <div key={user} className="relative group">
                    <div
                      className={[
                        'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white transition-transform hover:scale-110',
                        isYou ? 'outline-2 outline-offset-1' : '',
                      ].join(' ')}
                      style={{
                        backgroundColor: getUserColor(user),
                        outline: isYou ? `2px solid ${getUserColor(user)}` : undefined,
                        outlineOffset: '2px',
                      }}
                      title={isYou ? `${user} (you)` : user}
                    >
                      {user.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-800 border border-white/10 rounded text-[10px] text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {user}{isYou ? ' (you)' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-xs text-slate-600 font-medium">
              Not connected — run <code className="text-slate-500 bg-white/5 px-1 rounded">npm run server</code>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Board;
