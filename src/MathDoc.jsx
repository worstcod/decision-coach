import { X, BookOpen } from 'lucide-react';

const sections = [
  {
    title: 'What problem is this?',
    body: 'Multi-criteria decision under uncertainty: you define options, weighted factors, and ranges; the engine simulates thousands of futures and counts how often each option wins. No ML — your numbers + Beta-PERT + Monte Carlo.',
  },
  {
    title: 'One simulation iteration',
    body: 'For each option: (1) sample each factor from Beta-PERT(min, mode, max), (2) normalize to 0–1 using global bounds across options, (3) multiply by normalized weight and sum, (4) apply risk utility curve, (5) pick highest utility. Veto rules set utility to −1 if a sampled value breaks your limit.',
  },
  {
    title: 'Win probability',
    body: 'Win % = (iterations where this option had highest utility) ÷ 10,000. A Wilson 95% confidence interval is computed on that proportion. Overlapping CIs between top options flag a statistical tie.',
  },
  {
    title: 'Beta-PERT sampling',
    body: 'Your three estimates define a distribution peaked at "most likely" with tails toward bad/good. Mean = (min + 4×mode + max) / 6. Samples are drawn via a Beta distribution scaled to [min, max].',
  },
  {
    title: 'Risk profiles',
    body: 'Neutral: U(x)=x. Risk-averse: concave log curve (stability). Risk-seeking: U(x)=x² (upside). Utility is applied per iteration before comparing options.',
  },
  {
    title: 'Sensitivity & alternatives',
    body: 'Sensitivity re-runs with each factor\'s weight scaled 50%–150%. TOPSIS and Minimax Regret use your "most likely" values only — useful cross-checks when Monte Carlo is close.',
  },
  {
    title: 'Limitations',
    body: 'Factors sample independently (macro scenario adds partial correlation). Weighted sum is compensatory unless you use veto rules. Results depend entirely on your estimates. Not professional advice.',
  },
];

export default function MathDoc({ onClose }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="math-doc-title">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 id="math-doc-title" className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen size={22} className="text-indigo-600" aria-hidden /> Mathematical transparency
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 focus:ring-2 focus:ring-indigo-500" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-6 space-y-6">
          <p className="text-slate-600 text-sm">
            Full formulas and file references:{' '}
            <a href="/MATH.md" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium">
              open MATH.md
            </a>
            {' '}(also in the project repository).
          </p>
          {sections.map(s => (
            <section key={s.title}>
              <h3 className="font-bold text-slate-900 mb-2">{s.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{s.body}</p>
            </section>
          ))}
          <p className="text-xs text-slate-400 border-t border-slate-100 pt-4">
            Pipeline: inputs → PERT sample → normalize → weighted sum → utility → 10,000× → win % + CI + regret + percentiles.
          </p>
        </div>
      </div>
    </div>
  );
}
