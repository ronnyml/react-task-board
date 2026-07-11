import { useState, useEffect, useMemo, createContext } from 'react';
import io, { Socket } from 'socket.io-client';
import { BoardContextProps } from '../interfaces/BoardContextProps';
import { BoardProviderProps } from '../interfaces/BoardProviderProps';
import { TasksState } from '../interfaces/TasksState';
import { ConnectedUser } from '../interfaces/ConnectedUser';
import { config } from '../config/config';

const BoardContext = createContext<BoardContextProps | undefined>(undefined);

let socket: Socket | undefined;

const LS_KEY = 'taskboard-username';

export const BoardProvider = ({ children }: BoardProviderProps) => {
  const [tasks, setTasks] = useState<TasksState>({
    'todo': [],
    'in-progress': [],
    'done': []
  });
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingUsers, setEditingUsers] = useState<{ [key: string]: string | null }>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [userName, setUserNameState] = useState<string>(
    () => localStorage.getItem(LS_KEY) ?? ''
  );

  const userNames = useMemo(
    () => Object.fromEntries(connectedUsers.map((u) => [u.id, u.name])),
    [connectedUsers]
  );

  useEffect(() => {
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
        const storedName = localStorage.getItem(LS_KEY);
        if (storedName) socket.emit('set-name', storedName);
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

    socket.on('user-joined', (users: ConnectedUser[]) => {
      if (!ignore) setConnectedUsers(users);
    });

    socket.on('user-left', (users: ConnectedUser[]) => {
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

  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem(LS_KEY, name);
    if (socket?.connected) socket.emit('set-name', name);
  };

  const updateTasks = (newTasks: TasksState) => {
    setTasks(newTasks);
    if (socket) socket.emit('tasks-update', newTasks);
  };

  const startEditingTask = (taskId: string) => {
    setEditingTask(taskId);
    if (socket && currentUserId) {
      const updated = { ...editingUsers, [taskId]: currentUserId };
      setEditingUsers(updated);
      socket.emit('task-editing', updated);
    }
  };

  const stopEditingTask = (taskId: string) => {
    setEditingTask(null);
    if (socket && currentUserId) {
      const updated = { ...editingUsers };
      if (updated[taskId] === currentUserId) delete updated[taskId];
      setEditingUsers(updated);
      socket.emit('task-editing', updated);
    }
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = { ...tasks };
    for (const column in updatedTasks) {
      updatedTasks[column] = updatedTasks[column].filter((t) => t.id !== taskId);
    }
    updateTasks(updatedTasks);
  };

  const contextValues: BoardContextProps = {
    currentUserId,
    connectedUsers,
    userNames,
    editingUsers,
    tasks,
    editingTask,
    socketConnected,
    userName,
    setUserName,
    updateTasks,
    startEditingTask,
    stopEditingTask,
    deleteTask,
  };

  return (
    <BoardContext.Provider value={contextValues}>
      {children}
    </BoardContext.Provider>
  );
};

export { BoardContext };
