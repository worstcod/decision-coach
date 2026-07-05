import { MACRO_SCENARIOS } from './math-engine';

export default function MacroScenarioPicker({ value, onChange }) {
  return (
    <div className="mb-6 p-4 bg-slate-100 border border-slate-200 rounded-xl">
      <h4 className="font-bold text-slate-800 text-sm mb-2">Environment scenario (correlated factors)</h4>
      <p className="text-xs text-slate-600 mb-3">
        Shift all estimates together to model a broadly good or bad environment — factors move in correlation.
      </p>
      <div className="flex flex-wrap gap-2">
        {Object.values(MACRO_SCENARIOS).map(macro => (
          <button
            key={macro.id}
            type="button"
            onClick={() => onChange(macro.id)}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
              value === macro.id
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
            }`}
          >
            {macro.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-2">{MACRO_SCENARIOS[value]?.description}</p>
    </div>
  );
}
