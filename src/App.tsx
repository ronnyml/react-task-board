import { BoardProvider } from './contexts/BoardContext';
import Board from './components/Board';
import NamePrompt from './components/NamePrompt';
import useBoard from './hooks/useBoard';

const Header = () => {
  const { socketConnected } = useBoard();
  return (
    <header className="sticky top-0 z-20 border-b border-white/8 bg-[#060d1f]/80 backdrop-blur-md">
      <div className="container mx-auto px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow shadow-blue-500/30">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <span className="text-base font-semibold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            React Task Board
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/4 border border-white/8 rounded-full">
          {socketConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
              <span className="text-xs text-slate-400 font-medium">Collaborative · Live</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs text-red-400 font-medium">Server disconnected</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const AppContent = () => {
  const { userName } = useBoard();
  return (
    <div className="min-h-screen bg-[#060d1f]">
      {!userName && <NamePrompt />}
      <Header />
      <main className="container mx-auto px-6 py-7">
        <Board />
      </main>
    </div>
  );
};

const App = () => (
  <BoardProvider>
    <AppContent />
  </BoardProvider>
);

export default App;
