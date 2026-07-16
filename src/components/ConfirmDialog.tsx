interface ConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({ onConfirm, onCancel }: ConfirmDialogProps) => (
  <div
    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
  >
    <div className="bg-[#0d1628] border border-white/10 rounded-xl shadow-2xl shadow-black/60 px-5 py-4 flex items-center gap-4">
      <p className="text-sm font-semibold text-slate-200">Delete task?</p>
      <div className="flex items-center gap-2">
        <button
          onClick={onCancel}
          className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/6 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmDialog;
