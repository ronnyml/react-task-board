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

  useEffect(() => {
    socket = io('http://localhost:5173');

    socket.on('tasks-update', (updatedTasks: TasksState) => {
      setTasks(updatedTasks);
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

  return (
    <BoardContext.Provider value={{ tasks, updateTasks }}>
      {children}
    </BoardContext.Provider>
  );
};

export { BoardContext };
