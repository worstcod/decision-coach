import { Shield } from 'lucide-react';
import { getMeasureMeta } from './criterionTypes';

export default function VetoEditor({ criteria, setCriteria }) {
  const update = (idx, patch) => {
    setCriteria(criteria.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  };

  return (
    <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-2xl">
      <h3 className="font-bold text-rose-900 flex items-center gap-2 mb-2">
        <Shield size={18} /> Must-have rules (optional)
      </h3>
      <p className="text-sm text-rose-800 mb-4">
        Disqualify an option in any simulation where it breaks a hard limit (e.g. commute must stay under 60 min).
      </p>
      <div className="space-y-3">
        {criteria.map((crit, idx) => {
          const meta = getMeasureMeta(crit);
          const isMin = crit.vetoDirection !== 'max';
          return (
            <div key={crit.id} className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-xl border border-rose-100">
              <label className="flex items-center gap-2 min-w-[140px]">
                <input
                  type="checkbox"
                  checked={!!crit.vetoEnabled}
                  onChange={e => update(idx, {
                    vetoEnabled: e.target.checked,
                    vetoThreshold: crit.vetoThreshold ?? (crit.isPositive === false ? meta.defaults.likely : meta.defaults.pessimistic),
                    vetoDirection: crit.vetoDirection ?? (crit.isPositive === false ? 'max' : 'min'),
                  })}
                  className="rounded border-rose-300 text-rose-600"
                />
                <span className="text-sm font-medium text-slate-800">{crit.name}</span>
              </label>
              {crit.vetoEnabled && (
                <>
                  <select
                    value={crit.vetoDirection || 'min'}
                    onChange={e => update(idx, { vetoDirection: e.target.value })}
                    className="text-sm border border-slate-200 rounded-lg px-2 py-1"
                  >
                    <option value="min">Must be at least</option>
                    <option value="max">Must not exceed</option>
                  </select>
                  <input
                    type="number"
                    value={crit.vetoThreshold ?? ''}
                    onChange={e => update(idx, { vetoThreshold: Number(e.target.value) })}
                    className="w-24 text-sm border border-slate-200 rounded-lg px-2 py-1 text-right"
                  />
                  <span className="text-xs text-slate-500">{meta.unit}</span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
