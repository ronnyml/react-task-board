import { BoardProvider } from './contexts/BoardContext';
import Board from './components/Board';

const App = () => {
  return (
    <BoardProvider>
      <header className="bg-slate-800 text-white p-4">
        <h1 className="text-2xl font-bold">Collaborative Task Board</h1>
      </header>
      <div className="container mx-auto p-5">
        <Board />
      </div>
    </BoardProvider>
  );
};

export default App;
