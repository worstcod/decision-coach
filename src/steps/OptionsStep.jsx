import { Plus, Trash2 } from 'lucide-react';
import InfoTooltip from '../InfoTooltip';

export default function OptionsStep({ options, setOptions, scenarioContext, onBack, onNext }) {
  const validCount = options.filter(o => o.name.trim()).length;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-3xl font-bold text-slate-900 mb-2">
        What are your options?
        <InfoTooltip>
          <strong>Options</strong> are the different choices you are deciding between (e.g., Job A vs Job B, or Startup vs Corporate). You can compare up to 5 options.
        </InfoTooltip>
      </h2>
      <p className="text-slate-500 mb-2">{scenarioContext.example}</p>
      <p className="text-slate-500 mb-8">Name the choices you're comparing (2 to 5 options).</p>

      <div className="space-y-4">
        {options.map((opt, idx) => (
          <div key={opt.id} className="flex items-center gap-3">
            <div className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
              <input
                type="text"
                value={opt.name}
                onChange={e => {
                  const newOps = [...options];
                  newOps[idx].name = e.target.value;
                  setOptions(newOps);
                }}
                placeholder={scenarioContext.optionPlaceholders[idx] || `Option ${idx + 1}`}
                className="w-full bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400"
                autoFocus={idx === 0}
                aria-label={`Option ${idx + 1} name`}
              />
            </div>
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => setOptions(options.filter(o => o.id !== opt.id))}
                className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                aria-label={`Remove option ${idx + 1}`}
              >
                <Trash2 size={20} aria-hidden />
              </button>
            )}
          </div>
        ))}
      </div>

      {options.length < 5 && (
        <button
          type="button"
          onClick={() => setOptions([...options, { id: `o${Date.now()}`, name: '' }])}
          className="mt-4 flex items-center text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
        >
          <Plus size={20} className="mr-1" aria-hidden /> Add Option
        </button>
      )}

      <div className="mt-12 flex justify-between">
        <button type="button" onClick={onBack} className="px-6 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors">Back</button>
        <button
          type="button"
          onClick={onNext}
          disabled={validCount < 2}
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
        >
          Next Step
        </button>
      </div>
    </div>
  );
}
