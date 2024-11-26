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
  const [editingUsers, setEditingUsers] = useState<{ [key: string]: string | null }>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    socket = io('http://localhost:3000', { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      if (socket && socket.id) {
        const shortId = socket.id.slice(0, 5);
        setCurrentUserId(shortId);
        socket.emit('new-user');
      }
    });

    socket.on('tasks-update', (updatedTasks: TasksState) => {
      setTasks(updatedTasks);
    });

    socket.on('user-joined', (users: string[]) => {
      setConnectedUsers(users);
    });

    socket.on('user-left', (users: string[]) => {
      setConnectedUsers(users);
    });

    socket.on('task-editing', (editingUsers: { [key: string]: string }) => {
      setEditingUsers(editingUsers);
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
    if (socket && currentUserId) {
      const updatedEditingUsers = { ...editingUsers, [taskId]: currentUserId };
      setEditingUsers(updatedEditingUsers);
      socket.emit('task-editing', updatedEditingUsers);
    }
  };

  const stopEditingTask = (taskId: string) => {
    if (socket && currentUserId) {
      const updatedEditingUsers = { ...editingUsers };
      if (updatedEditingUsers[taskId] === currentUserId) {
        delete updatedEditingUsers[taskId];
        setEditingUsers(updatedEditingUsers);
        socket.emit('task-editing', updatedEditingUsers);
      }
    }
    setEditingTask(null);
  };

  return (
    <BoardContext.Provider value={{ tasks, updateTasks, connectedUsers, editingUsers, editingTask, startEditingTask, stopEditingTask, currentUserId }}>
      {children}
    </BoardContext.Provider>
  );
};

export { BoardContext };
