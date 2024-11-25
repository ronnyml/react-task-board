import { useContext } from 'react';
import { BoardContext } from '../contexts/BoardContext';

const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoard must be used within a BoardProvider");
  }
  return context;
};

export default useBoard;
