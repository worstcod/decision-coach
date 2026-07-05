import { DOMAINS } from '../factorCatalog';

export default function DomainStep({ onSelect }) {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900">What area of life is this decision about?</h2>
        <p className="text-slate-500 mt-2">Pick a domain — you'll choose a specific scenario next (except Custom).</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" role="list">
        {Object.values(DOMAINS).map(domain => (
          <button
            key={domain.id}
            type="button"
            role="listitem"
            onClick={() => onSelect(domain.id)}
            className="flex items-start p-6 text-left bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 group"
          >
            <span className="text-4xl mr-4" aria-hidden>{domain.icon}</span>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{domain.title}</h3>
              <p className="text-slate-500">{domain.subtitle}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
