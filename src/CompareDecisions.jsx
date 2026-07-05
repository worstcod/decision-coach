import { GitCompare } from 'lucide-react';
import { loadHistory } from './sessionStorage';

export default function CompareDecisions({ currentSnapshot, onClose }) {
  const history = loadHistory().filter(h => h.snapshot?.results);

  if (history.length < 1) {
    return (
      <div className="p-6 bg-white border border-slate-200 rounded-2xl">
        <p className="text-slate-600 text-sm">Save at least one past decision to compare over time.</p>
        <button type="button" onClick={onClose} className="mt-4 text-sm text-indigo-600 hover:underline">Close</button>
      </div>
    );
  }

  const currentWinner = currentSnapshot?.results?.results?.[currentSnapshot.results.winningOptionId];

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl">
      <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
        <GitCompare size={18} className="text-indigo-500" /> Compare with saved decisions
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2 pr-4">Decision</th>
              <th className="py-2 pr-4">Winner</th>
              <th className="py-2 pr-4">Win %</th>
              <th className="py-2">Saved</th>
            </tr>
          </thead>
          <tbody>
            {currentWinner && (
              <tr className="border-b border-indigo-100 bg-indigo-50/50 font-medium">
                <td className="py-2 pr-4">Current</td>
                <td className="py-2 pr-4">{currentWinner.name}</td>
                <td className="py-2 pr-4">{Math.round(currentWinner.winProbability * 100)}%</td>
                <td className="py-2">Now</td>
              </tr>
            )}
            {history.map(entry => {
              const w = entry.snapshot.results.results[entry.snapshot.results.winningOptionId];
              return (
                <tr key={entry.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{entry.name}</td>
                  <td className="py-2 pr-4">{w?.name ?? '—'}</td>
                  <td className="py-2 pr-4">{w ? `${Math.round(w.winProbability * 100)}%` : '—'}</td>
                  <td className="py-2">{new Date(entry.savedAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={onClose} className="mt-4 text-sm text-indigo-600 hover:underline">Close</button>
    </div>
  );
}
