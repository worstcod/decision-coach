import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function MethodComparison({ monteCarloWinner, topsis, minimaxRegret }) {
  const data = [
    { method: 'Monte Carlo', winner: monteCarloWinner, score: 100, color: '#4f46e5' },
    { method: 'TOPSIS', winner: topsis?.winnerName, score: topsis?.ranking?.[0]?.scorePct ?? 0, color: '#10b981' },
    { method: 'Minimax Regret', winner: minimaxRegret?.winnerName, score: minimaxRegret?.ranking?.[0]?.scorePct ?? 0, color: '#f59e0b' },
  ];

  const agreement = new Set(data.map(d => d.winner)).size === 1;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-2">Method comparison</h3>
      <p className="text-sm text-slate-500 mb-4">
        Monte Carlo uses uncertainty; TOPSIS and Minimax Regret use your most-likely estimates only.
        {agreement ? ' All three methods agree on the winner.' : ' Methods disagree — review trade-offs carefully.'}
      </p>
      <div className="h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis type="category" dataKey="method" width={100} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v, name, props) => [`${props.payload.winner} (${v}%)`, 'Top pick']} />
            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        {data.map(row => (
          <div key={row.method} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="font-semibold text-slate-800">{row.method}</div>
            <div className="text-indigo-700 font-medium">{row.winner}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
