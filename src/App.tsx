import { BoardProvider } from './contexts/BoardContext';
import Board from './components/Board';

const App = () => {
  return (
    <BoardProvider>
      <div className="min-h-screen bg-[#060d1f]">
        <header className="sticky top-0 z-20 border-b border-white/8 bg-[#060d1f]/80 backdrop-blur-md">
          <div className="container mx-auto px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-base font-semibold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                React Task Board
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/4 border border-white/8 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
              <span className="text-xs text-slate-400 font-medium">Collaborative · Live</span>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-7">
          <Board />
        </main>
      </div>
    </BoardProvider>
  );
};

export default App;
