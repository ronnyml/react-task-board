import { useState, useEffect, createContext } from 'react';
import io, { Socket } from 'socket.io-client';
import { BoardContextProps } from '../interfaces/BoardContextProps';
import { BoardProviderProps } from '../interfaces/BoardProviderProps';
import { TasksState } from '../interfaces/TasksState';
import { config } from '../config/config';

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
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    // `ignore` prevents stale state updates from the effect's first run
    // when React StrictMode unmounts and remounts the component in dev.
    // socket.disconnect() fires the 'disconnect' event synchronously, so
    // without this flag the cleanup-triggered disconnect would set
    // socketConnected = false after the new socket has already connected.
    let ignore = false;

    const serverUrl = config.serverURL;
    socket = io(serverUrl, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      if (ignore) return;
      setSocketConnected(true);
      if (socket?.id) {
        const shortId = socket.id.slice(0, 5);
        setCurrentUserId(shortId);
        socket.emit('new-user');
      }
    });

    socket.on('connect_error', () => {
      if (!ignore) setSocketConnected(false);
    });

    socket.on('disconnect', () => {
      if (!ignore) setSocketConnected(false);
    });

    socket.on('tasks-update', (updatedTasks: TasksState) => {
      if (!ignore) setTasks(updatedTasks);
    });

    socket.on('user-joined', (users: string[]) => {
      if (!ignore) setConnectedUsers(users);
    });

    socket.on('user-left', (users: string[]) => {
      if (!ignore) setConnectedUsers(users);
    });

    socket.on('task-editing', (updatedEditingUsers: { [key: string]: string }) => {
      if (!ignore) setEditingUsers(updatedEditingUsers);
    });

    return () => {
      ignore = true;
      if (socket) socket.disconnect();
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
    socketConnected,
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
