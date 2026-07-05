import { Brain } from 'lucide-react';
import { getProgressStep } from '../factorCatalog';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function WizardHeader({ step, decisionType, onRestart }) {
  if (step <= 0 || step >= 8) return null;

  const progress = getProgressStep(step, decisionType);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <button
          type="button"
          onClick={onRestart}
          className="font-bold text-slate-900 flex items-center gap-2 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg px-1"
          aria-label="Decision Coach home — restart decision"
        >
          <Brain className="text-indigo-600" aria-hidden /> Decision Coach
        </button>
        <nav aria-label="Wizard progress">
          <ol className="flex gap-1.5 list-none m-0 p-0">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <li key={i}>
                <span
                  className={cn(
                    'block h-1.5 rounded-full transition-all duration-300',
                    progress >= i ? 'w-6 bg-indigo-600' : 'w-2 bg-slate-200'
                  )}
                  aria-label={`Step ${i} of 6${progress >= i ? ', completed or current' : ''}`}
                />
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </header>
  );
}
