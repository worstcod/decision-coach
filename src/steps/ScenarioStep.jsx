import { DOMAINS, getScenariosForDomain } from '../factorCatalog';

export default function ScenarioStep({ decisionType, onSelect, onBack }) {
  const scenarios = getScenariosForDomain(decisionType);
  const domain = DOMAINS[decisionType];

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <p className="text-sm font-medium text-indigo-600 mb-2">{domain?.icon} {domain?.title}</p>
        <h2 className="text-3xl font-bold text-slate-900">What kind of {domain?.title.toLowerCase()} decision?</h2>
        <p className="text-slate-500 mt-2">Pick the closest match — we'll suggest the right factors.</p>
      </div>
      <div className="space-y-3" role="list">
        {scenarios.map(scenario => (
          <button
            key={scenario.id}
            type="button"
            role="listitem"
            onClick={() => onSelect(scenario.id)}
            className="w-full text-left p-5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 group"
          >
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700">{scenario.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{scenario.example}</p>
          </button>
        ))}
      </div>
      <div className="mt-10">
        <button type="button" onClick={onBack} className="px-6 py-2 text-slate-600 hover:text-slate-900 font-medium">Back</button>
      </div>
    </div>
  );
}
