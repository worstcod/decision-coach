import { AlertTriangle, RotateCcw } from 'lucide-react';
import InfoTooltip from '../InfoTooltip';
import PairwiseWeights from '../PairwiseWeights';
import VetoEditor from '../VetoEditor';
import { pairwiseToWeights } from '../pairwiseWeightUtils';

export default function WeightsStep({
  criteria,
  setCriteria,
  totalWeight,
  showPairwise,
  setShowPairwise,
  pairwiseComparisons,
  setPairwiseComparisons,
  onBack,
  onNext,
}) {
  const handleAutoBalance = () => {
    const eqWeight = Math.floor(100 / criteria.length);
    const remainder = 100 % criteria.length;
    setCriteria(criteria.map((c, i) => ({
      ...c,
      weight: eqWeight + (i === 0 ? remainder : 0),
    })));
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-3xl font-bold text-slate-900 mb-2">How important is each factor?</h2>
      <p className="text-slate-500 mb-6">
        Assign relative importance to each factor. The numbers will be automatically normalized into percentages.
        <InfoTooltip>
          <strong>Weights</strong> determine how much influence a factor has on the final decision. Because they are normalized, giving two factors "10" and "10" is mathematically identical to giving them "50" and "50".
        </InfoTooltip>
      </p>

      {!showPairwise && criteria.length >= 2 && criteria.length <= 6 && (
        <button
          type="button"
          onClick={() => setShowPairwise(true)}
          className="mb-6 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          Use pairwise comparison helper instead →
        </button>
      )}

      {showPairwise && (
        <PairwiseWeights
          criteria={criteria}
          comparisons={pairwiseComparisons}
          setComparisons={setPairwiseComparisons}
          onApply={() => {
            setCriteria(pairwiseToWeights(criteria, pairwiseComparisons));
            setShowPairwise(false);
          }}
          onSkip={() => setShowPairwise(false)}
        />
      )}

      <VetoEditor criteria={criteria} setCriteria={setCriteria} />

      <div className="mb-8 p-4 rounded-xl flex items-center justify-between border shadow-sm transition-colors duration-300 bg-white">
        <div className="font-medium text-slate-700">Total Raw Points:</div>
        <div className="text-2xl font-bold text-indigo-600">
          {totalWeight}
        </div>
      </div>

      <div className="space-y-6">
        {criteria.map((crit, idx) => {
          const weightPercent = totalWeight > 0 ? (crit.weight / totalWeight) * 100 : 0;
          return (
            <div key={crit.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="flex justify-between mb-3">
                <label className="font-semibold text-slate-900" htmlFor={`weight-${crit.id}`}>
                  {crit.name || `Factor ${idx + 1}`}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">{Math.round(weightPercent)}% weight</span>
                  <span className="text-indigo-600 font-mono font-bold bg-indigo-50 px-2 py-0.5 rounded-md">{crit.weight} pts</span>
                </div>
              </div>
              {weightPercent > 50 && criteria.length > 1 && (
                <div className="mb-3 flex items-center text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                  <AlertTriangle size={14} className="mr-1.5 flex-shrink-0" aria-hidden /> Heads up! This factor will strongly dominate the decision mathematically.
                </div>
              )}
              <input
                id={`weight-${crit.id}`}
                type="range"
                min="0"
                max="100"
                value={crit.weight}
                onChange={e => {
                  const newC = [...criteria];
                  newC[idx].weight = Number(e.target.value);
                  setCriteria(newC);
                }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                aria-label={`${crit.name || `Factor ${idx + 1}`} importance weight`}
              />
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden" aria-hidden>
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${weightPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleAutoBalance}
          className="flex items-center text-sm text-slate-500 hover:text-slate-900 font-medium"
        >
          <RotateCcw size={16} className="mr-1" aria-hidden /> Auto-balance
        </button>
      </div>

      <div className="mt-12 flex justify-between">
        <button type="button" onClick={onBack} className="px-6 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors">Back</button>
        <button
          type="button"
          onClick={onNext}
          disabled={totalWeight === 0}
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}
