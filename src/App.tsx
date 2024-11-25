import { BoardProvider } from './contexts/BoardContext';
import Board from './components/Board';

const App = () => {
  return (
    <BoardProvider>
      <div className="container mx-auto p-5">
        <h1 className="text-3xl font-bold mb-5">Collaborative Task Board</h1>
        <Board />
      </div>
    </BoardProvider>
  );
};

export default App;
