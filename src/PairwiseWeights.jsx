import { useState } from 'react';
import { Scale } from 'lucide-react';
import { getPairList } from './pairwiseWeightUtils';

export default function PairwiseWeights({ criteria, comparisons, setComparisons, onApply, onSkip }) {
  const pairs = getPairList(criteria);
  const [idx, setIdx] = useState(0);

  if (pairs.length === 0) return null;

  const current = pairs[idx];
  const progress = Math.round(((idx + 1) / pairs.length) * 100);

  const pick = (choice) => {
    setComparisons(prev => ({ ...prev, [current.key]: choice }));
    if (idx < pairs.length - 1) {
      setIdx(idx + 1);
    }
  };

  const currentPick = comparisons[current.key];

  return (
    <div className="mb-8 p-6 bg-indigo-50 border border-indigo-100 rounded-2xl">
      <div className="flex items-center gap-2 mb-2">
        <Scale size={18} className="text-indigo-600" />
        <h3 className="font-bold text-indigo-900">Pairwise weight helper</h3>
        <span className="text-xs text-indigo-600 ml-auto">{idx + 1} / {pairs.length}</span>
      </div>
      <p className="text-sm text-indigo-800 mb-4">
        Which matters <strong>more</strong> for this decision?
      </p>
      <div className="w-full bg-indigo-200 h-1.5 rounded-full mb-4">
        <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => pick(current.a.id)}
          className={`p-4 rounded-xl border font-semibold transition-all ${
            currentPick === current.a.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-indigo-200 hover:border-indigo-400'
          }`}
        >
          {current.a.name}
        </button>
        <button
          type="button"
          onClick={() => pick('equal')}
          className={`p-4 rounded-xl border font-medium transition-all ${
            currentPick === 'equal' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-indigo-200 hover:border-indigo-400'
          }`}
        >
          Equal
        </button>
        <button
          type="button"
          onClick={() => pick(current.b.id)}
          className={`p-4 rounded-xl border font-semibold transition-all ${
            currentPick === current.b.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-indigo-200 hover:border-indigo-400'
          }`}
        >
          {current.b.name}
        </button>
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        {idx < pairs.length - 1 ? (
          <button type="button" onClick={() => setIdx(idx + 1)} className="text-sm text-indigo-600 hover:underline">Skip this pair</button>
        ) : (
          <button type="button" onClick={onApply} className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700">
            Apply weights from comparisons
          </button>
        )}
        <button type="button" onClick={onSkip} className="text-sm text-slate-500 hover:underline">Use sliders instead</button>
      </div>
    </div>
  );
}
