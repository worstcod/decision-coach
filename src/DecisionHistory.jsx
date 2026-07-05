import { useState } from 'react';
import { History, Trash2, ChevronRight } from 'lucide-react';
import { loadHistory, deleteFromHistory } from './sessionStorage';

export default function DecisionHistory({ onLoad }) {
  const [history, setHistory] = useState(() => loadHistory());

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Remove this saved decision?')) return;
    setHistory(deleteFromHistory(id));
  };

  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mt-12 text-left">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <History size={16} /> My past decisions
      </h3>
      <div className="space-y-2">
        {history.map(entry => {
          const winner = entry.snapshot?.results?.results?.[entry.snapshot.results.winningOptionId];
          const options = (entry.snapshot?.options || []).filter(o => o.name?.trim()).map(o => o.name);
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => onLoad(entry.snapshot)}
              className="w-full flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all text-left group"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 truncate">{entry.name}</div>
                <div className="text-xs text-slate-500 mt-0.5 truncate">
                  {options.join(' vs ') || 'Untitled'}
                  {winner ? ` · ${Math.round(winner.winProbability * 100)}% → ${winner.name}` : ''}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {new Date(entry.savedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => handleDelete(e, entry.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete saved decision"
              >
                <Trash2 size={16} />
              </button>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
