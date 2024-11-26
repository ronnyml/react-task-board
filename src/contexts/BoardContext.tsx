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
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    socket = io(serverUrl, { transports: ['websocket', 'polling'] });

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
    setEditingTask(taskId);
    if (socket && currentUserId) {
      const updatedEditingUsers = { ...editingUsers, [taskId]: currentUserId };
      setEditingUsers(updatedEditingUsers);
      socket.emit('task-editing', updatedEditingUsers);
    }
  };

  const stopEditingTask = (taskId: string) => {
    setEditingTask(null);
    if (socket && currentUserId) {
      const updatedEditingUsers = { ...editingUsers };
      if (updatedEditingUsers[taskId] === currentUserId) {
        delete updatedEditingUsers[taskId];
      }
      setEditingUsers(updatedEditingUsers);
      socket.emit('task-editing', updatedEditingUsers);
    }
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = { ...tasks };
    for (const column in updatedTasks) {
      updatedTasks[column] = updatedTasks[column].filter((task) => task.id !== taskId);
    }
    updateTasks(updatedTasks);
  };

  const contextValues: BoardContextProps = {
    currentUserId,
    connectedUsers,
    editingUsers,
    tasks,
    editingTask,
    updateTasks,
    startEditingTask,
    stopEditingTask,
    deleteTask
  };

  return (
    <BoardContext.Provider value={contextValues}>
      {children}
    </BoardContext.Provider>
  );
};

export { BoardContext };
