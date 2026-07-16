import { useState, useEffect, useMemo, useRef, createContext } from 'react';
import io, { Socket } from 'socket.io-client';
import { BoardContextProps } from '../interfaces/BoardContextProps';
import { BoardProviderProps } from '../interfaces/BoardProviderProps';
import { TasksState } from '../interfaces/TasksState';
import { ConnectedUser } from '../interfaces/ConnectedUser';
import { ColumnDef } from '../interfaces/ColumnDef';
import { Task } from '../interfaces/Task';
import { config } from '../config/config';

const DEFAULT_COLUMNS: ColumnDef[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

const BoardContext = createContext<BoardContextProps | undefined>(undefined);

let socket: Socket | undefined;

const LS_KEY = 'taskboard-username';

export const BoardProvider = ({ children }: BoardProviderProps) => {
  const [tasks, setTasks] = useState<TasksState>({
    'todo': [],
    'in-progress': [],
    'done': []
  });
  const [columns, setColumns] = useState<ColumnDef[]>(DEFAULT_COLUMNS);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [editingUsers, setEditingUsers] = useState<{ [key: string]: string | null }>({});
  const editingUsersRef = useRef<{ [key: string]: string | null }>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [userName, setUserNameState] = useState<string>(
    () => localStorage.getItem(LS_KEY) ?? ''
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTaskColumnId, setSelectedTaskColumnId] = useState<string | null>(null);

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

    socket.on('columns-update', (updatedColumns: ColumnDef[]) => {
      if (!ignore) setColumns(updatedColumns);
    });

    socket.on('user-joined', (users: ConnectedUser[]) => {
      if (!ignore) setConnectedUsers(users);
    });

    socket.on('user-left', (users: ConnectedUser[]) => {
      if (!ignore) setConnectedUsers(users);
    });

    socket.on('task-editing', (updatedEditingUsers: { [key: string]: string }) => {
      if (!ignore) {
        editingUsersRef.current = updatedEditingUsers;
        setEditingUsers(updatedEditingUsers);
      }
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

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    const newTasks = { ...tasks };
    for (const columnId in newTasks) {
      const idx = newTasks[columnId].findIndex((t) => t.id === taskId);
      if (idx !== -1) {
        newTasks[columnId] = [...newTasks[columnId]];
        newTasks[columnId][idx] = { ...newTasks[columnId][idx], ...updates };
        break;
      }
    }
    updateTasks(newTasks);
  };

  const updateColumns = (newColumns: ColumnDef[]) => {
    setColumns(newColumns);
    if (socket) socket.emit('columns-update', newColumns);
  };

  const startEditingTask = (taskId: string) => {
    if (!socket || !currentUserId) return;
    // Remove any prior entry for this user, then set the new one — avoids stale multi-task indicators
    const without = Object.fromEntries(
      Object.entries(editingUsersRef.current).filter(([, uid]) => uid !== currentUserId)
    );
    const updated = { ...without, [taskId]: currentUserId };
    editingUsersRef.current = updated;
    setEditingUsers(updated);
    socket.emit('task-editing', updated);
  };

  const stopEditingTask = (taskId: string) => {
    if (!socket || !currentUserId) return;
    if (editingUsersRef.current[taskId] !== currentUserId) return;
    const updated = { ...editingUsersRef.current };
    delete updated[taskId];
    editingUsersRef.current = updated;
    setEditingUsers(updated);
    socket.emit('task-editing', updated);
  };

  // Clear this user's viewing state when the cursor leaves the browser or the tab is hidden
  useEffect(() => {
    const clearMyEdits = () => {
      if (!currentUserId) return;
      const hasAny = Object.values(editingUsersRef.current).some(uid => uid === currentUserId);
      if (!hasAny) return;
      const updated = Object.fromEntries(
        Object.entries(editingUsersRef.current).filter(([, uid]) => uid !== currentUserId)
      );
      editingUsersRef.current = updated;
      setEditingUsers(updated);
      socket?.emit('task-editing', updated);
    };

    const onVisibilityChange = () => { if (document.hidden) clearMyEdits(); };

    document.addEventListener('mouseleave', clearMyEdits);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('mouseleave', clearMyEdits);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [currentUserId]);

  const deleteTask = (taskId: string) => {
    const updatedTasks = { ...tasks };
    for (const column in updatedTasks) {
      updatedTasks[column] = updatedTasks[column].filter((t) => t.id !== taskId);
    }
    updateTasks(updatedTasks);
  };

  const openTask = (taskId: string, columnId: string) => {
    setSelectedTaskId(taskId);
    setSelectedTaskColumnId(columnId);
  };

  const closeTask = () => {
    setSelectedTaskId(null);
    setSelectedTaskColumnId(null);
  };

  const contextValues: BoardContextProps = {
    currentUserId,
    connectedUsers,
    userNames,
    editingUsers,
    tasks,
    socketConnected,
    userName,
    setUserName,
    updateTasks,
    updateTask,
    startEditingTask,
    stopEditingTask,
    deleteTask,
    columns,
    updateColumns,
    selectedTaskId,
    selectedTaskColumnId,
    openTask,
    closeTask,
  };

  return (
    <BoardContext.Provider value={contextValues}>
      {children}
    </BoardContext.Provider>
  );
};

export { BoardContext };
