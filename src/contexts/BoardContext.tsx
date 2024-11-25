import { useState, useEffect, createContext } from 'react';
import io, { Socket } from 'socket.io-client';
import { BoardContextProps } from '../interfaces/BoardContextProps';
import { BoardProviderProps } from '../interfaces/BoardProviderProps';
import { TasksState } from '../interfaces/TasksState';

const BoardContext = createContext<BoardContextProps | undefined>(undefined);

let socket: Socket | undefined;

export const BoardProvider = ({ children }: BoardProviderProps) => {
  const [tasks, setTasks] = useState<TasksState>({
    'todo': [],
    'in-progress': [],
    'done': []
  });
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const [editingTask, setEditingTask] = useState<string | null>(null);

  useEffect(() => {
    socket = io('http://localhost:3000', { transports: ['websocket', 'polling'] });

    socket.emit('new-user');

    socket.on('tasks-update', (updatedTasks: TasksState) => {
      setTasks(updatedTasks);
    });

    socket.on('user-joined', (users: string[]) => {
      setConnectedUsers(users);
    });

    socket.on('user-left', (users: string[]) => {
      setConnectedUsers(users);
    });

    socket.on('task-editing', (taskId: string) => {
      setEditingTask(taskId);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const updateTasks = (newTasks: TasksState) => {
    setTasks(newTasks);
    if (socket) {
      socket.emit('tasks-update', newTasks);
    }
  };

  const startEditingTask = (taskId: string) => {
    setEditingTask(taskId);
    if (socket) {
      socket.emit('task-editing', taskId);
    }
  };

  return (
    <BoardContext.Provider value={{ tasks, updateTasks, connectedUsers, editingTask, startEditingTask }}>
      {children}
    </BoardContext.Provider>
  );
};

export { BoardContext };
