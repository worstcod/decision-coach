import React, { useState, useMemo } from 'react';
import { Microscope, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getMeasureMeta } from './criterionTypes';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const RUN_LABELS = {
  first: 'First simulation',
  close_call: 'Closest call',
  clear_win: 'Clearest win',
  random: 'Random sample',
  sample: 'Sample',
};

function formatSampled(value) {
  if (Math.abs(value) >= 1000) return Math.round(value).toLocaleString();
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2);
}

export default function SimulationInspector({ simulationData, criteria, onExport }) {
  const [expanded, setExpanded] = useState(true);
  const [selectedRunIndex, setSelectedRunIndex] = useState(0);

  const { sampleRuns = [], factorAttribution = {}, pairwise = [], iterations, winningOptionId, results } = simulationData;
  const winner = results[winningOptionId];
  const runnerUpEntry = factorAttribution.runnerUpId ? results[factorAttribution.runnerUpId] : null;

  const attributionChart = useMemo(() => {
    return (factorAttribution.winnerGap || [])
      .slice(0, 8)
      .map(f => ({
        name: f.name.length > 18 ? `${f.name.slice(0, 16)}…` : f.name,
        fullName: f.name,
        gap: Math.round(f.gap * 1000) / 10,
      }));
  }, [factorAttribution.winnerGap]);

  const selectedRun = sampleRuns[selectedRunIndex] || sampleRuns[0];

  if (!sampleRuns.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <Microscope size={22} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Simulation Inspector</h3>
            <p className="text-sm text-slate-500">
              Audit {iterations.toLocaleString()} runs — see what drove the recommendation
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
      </button>

      {expanded && (
        <div className="px-6 pb-6 space-y-8 border-t border-slate-100 pt-6">
          {/* Factor attribution */}
          {attributionChart.length > 0 && runnerUpEntry && (
            <div>
              <h4 className="font-bold text-slate-900 mb-1">What drove the win?</h4>
              <p className="text-sm text-slate-500 mb-4">
                Average factor contribution gap: <strong>{winner.name}</strong> vs <strong>{runnerUpEntry.name}</strong> (percentage points of total score)
              </p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attributionChart} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} unit=" pts" />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(v) => [`${v} pts`, 'Gap']}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
                    />
                    <Bar dataKey="gap" radius={[0, 4, 4, 0]}>
                      {attributionChart.map((entry, i) => (
                        <Cell key={i} fill={entry.gap >= 0 ? '#4f46e5' : '#f59e0b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Pairwise */}
          {pairwise.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 mb-3">Head-to-head win rates</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b border-slate-100">
                      <th className="pb-2 pr-4">Comparison</th>
                      <th className="pb-2 pr-4">Option A wins</th>
                      <th className="pb-2 pr-4">Option B wins</th>
                      <th className="pb-2">Ties</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pairwise.map((row, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="py-2 pr-4 font-medium text-slate-800">
                          {row.optionA} vs {row.optionB}
                          {row.statisticalTie && (
                            <span className="ml-2 text-xs text-amber-600 font-normal">(CI overlap)</span>
                          )}
                        </td>
                        <td className="py-2 pr-4 text-indigo-600">
                          {row.aWinPct}%
                          {row.aWinCI && (
                            <span className="block text-xs text-slate-400">CI {row.aWinCI.low}–{row.aWinCI.high}%</span>
                          )}
                        </td>
                        <td className="py-2 pr-4 text-emerald-600">
                          {row.bWinPct}%
                          {row.bWinCI && (
                            <span className="block text-xs text-slate-400">CI {row.bWinCI.low}–{row.bWinCI.high}%</span>
                          )}
                        </td>
                        <td className="py-2 text-slate-400">{row.tiePct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Run picker */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3">Step-by-step: inside one simulation</h4>
            <p className="text-sm text-slate-500 mb-4">
              Each run randomly draws values from your ranges, normalizes them, applies weights, and picks the highest utility score.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {sampleRuns.map((run, idx) => (
                <button
                  key={run.index}
                  type="button"
                  onClick={() => setSelectedRunIndex(idx)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    selectedRunIndex === idx
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                  )}
                >
                  {RUN_LABELS[run.label] || run.label} #{run.index + 1}
                </button>
              ))}
            </div>

            {selectedRun && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex flex-wrap gap-4 mb-4 text-sm">
                  <span><strong>Run:</strong> #{selectedRun.index + 1}</span>
                  <span><strong>Winner:</strong> {selectedRun.winnerName}</span>
                  <span><strong>Margin:</strong> {(selectedRun.margin * 100).toFixed(2)} utility pts</span>
                </div>

                <div className="space-y-6">
                  {selectedRun.options.map(opt => {
                    const isWinner = opt.id === selectedRun.winnerId;
                    return (
                      <div
                        key={opt.id}
                        className={cn(
                          'bg-white rounded-xl border overflow-hidden',
                          isWinner ? 'border-indigo-300 ring-1 ring-indigo-100' : 'border-slate-200'
                        )}
                      >
                        <div className={cn(
                          'px-4 py-2 flex justify-between items-center text-sm font-bold',
                          isWinner ? 'bg-indigo-50 text-indigo-900' : 'bg-slate-100 text-slate-700'
                        )}>
                          <span>{opt.name}{isWinner ? ' — Winner' : ''}</span>
                          <span className="font-mono text-xs">
                            Score {(opt.totalScore * 100).toFixed(1)} → Utility {(opt.utilityScore * 100).toFixed(1)}
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-slate-500 border-b border-slate-100">
                                <th className="text-left py-2 px-3">Factor</th>
                                <th className="text-right py-2 px-3">Sampled</th>
                                <th className="text-right py-2 px-3">Norm (0–1)</th>
                                <th className="text-right py-2 px-3">× Weight</th>
                                <th className="text-right py-2 px-3">= Contribution</th>
                              </tr>
                            </thead>
                            <tbody>
                              {opt.factors.map(f => {
                                const crit = criteria.find(c => c.id === f.critId);
                                const meta = crit ? getMeasureMeta(crit) : null;
                                return (
                                  <tr key={f.critId} className="border-b border-slate-50">
                                    <td className="py-2 px-3 font-medium text-slate-800">{f.name}</td>
                                    <td className="py-2 px-3 text-right tabular-nums text-slate-600">
                                      {formatSampled(f.sampled)}{meta ? ` ${meta.unit}` : ''}
                                    </td>
                                    <td className="py-2 px-3 text-right tabular-nums">{f.normalized.toFixed(3)}</td>
                                    <td className="py-2 px-3 text-right tabular-nums">{(f.weight * 100).toFixed(1)}%</td>
                                    <td className="py-2 px-3 text-right tabular-nums font-medium text-indigo-700">
                                      {(f.contribution * 100).toFixed(2)}%
                                    </td>
                                  </tr>
                                );
                              })}
                              <tr className="bg-slate-50 font-bold">
                                <td colSpan={4} className="py-2 px-3 text-right text-slate-700">Total score</td>
                                <td className="py-2 px-3 text-right tabular-nums text-indigo-800">{(opt.totalScore * 100).toFixed(2)}%</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 italic">
            This verifies the math on your inputs — not whether your estimates match real life. Wrong inputs will produce confident but incorrect recommendations.
          </p>
          {onExport && (
            <button
              type="button"
              onClick={onExport}
              className="mt-3 text-sm text-indigo-600 hover:underline font-medium"
            >
              Export inspector data (JSON)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
