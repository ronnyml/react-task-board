import { useState, useRef, useEffect } from 'react';
import useBoard from '../hooks/useBoard';

const NamePrompt = () => {
  const { setUserName } = useBoard();
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const name = value.trim();
    if (!name) return;
    setUserName(name);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const initial = value.trim().charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030810]/80 backdrop-blur-md">
      <div className="w-full max-w-sm mx-4 bg-[#0d1628] border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/60">
        {/* Logo mark */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-slate-100 text-center mb-1">
          Join the board
        </h2>
        <p className="text-sm text-slate-500 text-center mb-6">
          Enter your name
        </p>

        {/* Avatar preview */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xl font-bold text-white shadow-lg transition-all duration-200">
            {initial || (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Your name…"
          maxLength={24}
          className="w-full bg-[#060d1f] border border-white/10 text-slate-200 placeholder:text-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/60 focus:border-blue-500/40 transition-all mb-4"
        />

        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors duration-150"
        >
          Join board
        </button>
      </div>
    </div>
  );
};

export default NamePrompt;
