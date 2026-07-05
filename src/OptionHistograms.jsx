import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

function buildHistogram(scores, bins = 15) {
  if (!scores?.length) return [];
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const binSize = (max - min) / bins || 1;
  return Array.from({ length: bins }, (_, i) => {
    const binMin = min + i * binSize;
    const binMax = binMin + binSize;
    return {
      bin: Math.round((binMin + binSize / 2) * 100),
      count: scores.filter(s => s >= binMin && (i === bins - 1 ? s <= binMax : s < binMax)).length,
    };
  });
}

export default function OptionHistograms({ results, winningOptionId }) {
  const options = Object.values(results.results);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-2">Outcome distributions (all options)</h3>
      <p className="text-sm text-slate-500 mb-6">
        Score histograms from {results.iterations.toLocaleString()} simulations — higher scores are better.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {options.map((opt, idx) => {
          const hist = buildHistogram(opt.scores);
          return (
            <div key={opt.id} className="h-56">
              <h4 className={`text-sm font-semibold mb-2 ${opt.id === winningOptionId ? 'text-indigo-700' : 'text-slate-700'}`}>
                {opt.name} {opt.id === winningOptionId && '(recommended)'}
              </h4>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={hist}>
                  <XAxis dataKey="bin" tick={{ fontSize: 10 }} />
                  <YAxis hide />
                  <Tooltip formatter={v => [`${v} runs`, 'Count']} labelFormatter={l => `Score ~${l / 100}`} />
                  <Bar dataKey="count" fill={COLORS[idx % COLORS.length]} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>
    </div>
  );
}
