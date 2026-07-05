import { useState, useEffect } from 'react';
import { Scale, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { runSensitivityAnalysis, SENSITIVITY_ITERATIONS } from './math-engine/sensitivity';

export default function SensitivityPanel({ options, criteria, uncertainties, riskUtility, baseWinnerId, baseWinnerName }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!options?.length || !criteria?.length || !baseWinnerId) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      const result = runSensitivityAnalysis(
        options,
        criteria,
        uncertainties,
        riskUtility,
        baseWinnerId
      );
      setData(result);
      setLoading(false);
    }, 50);

    return () => clearTimeout(timer);
  }, [options, criteria, uncertainties, riskUtility, baseWinnerId]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 flex items-center mb-2">
          <Scale size={18} className="mr-2 text-indigo-500" /> Weight sensitivity
        </h3>
        <div className="flex items-center gap-3 text-slate-500 text-sm py-8 justify-center">
          <Loader2 size={20} className="animate-spin text-indigo-500" />
          Testing weight changes ({SENSITIVITY_ITERATIONS.toLocaleString()} runs per scenario)…
        </div>
      </div>
    );
  }

  if (!data?.length) return null;

  const sensitiveCount = data.filter(d => !d.stable).length;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-900 flex items-center mb-2">
        <Scale size={18} className="mr-2 text-indigo-500" /> Weight sensitivity
      </h3>
      <p className="text-sm text-slate-500 mb-6">
        Each factor&apos;s weight was scaled from 50% to 150% of your setting (others adjusted proportionally).
        {sensitiveCount === 0
          ? ` "${baseWinnerName}" stays ahead across all tests.`
          : ` ${sensitiveCount} factor${sensitiveCount > 1 ? 's' : ''} could change the recommendation if your priorities shift.`}
      </p>

      <div className="space-y-4">
        {data.map(row => (
          <div
            key={row.critId}
            className={`p-4 rounded-xl border ${row.stable ? 'bg-slate-50 border-slate-200' : 'bg-amber-50/50 border-amber-200'}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                {row.stable ? (
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                )}
                {row.name}
              </div>
              <span className="text-xs font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                {row.currentWeightPct}% weight
              </span>
            </div>
            <p className="text-sm text-slate-600">{row.summary}</p>
            {!row.stable && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {row.curve.filter(p => p.flipped).slice(0, 3).map(p => (
                  <span
                    key={p.multiplier}
                    className="text-xs px-2 py-1 rounded-md bg-white border border-amber-200 text-amber-900"
                  >
                    At {Math.round(p.multiplier * 100)}% weight → {p.winnerName} ({p.winProbability}%)
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
