import { Lightbulb } from 'lucide-react';
import { fromStoredUncertainty, getMeasureMeta } from './criterionTypes';

export function collectBiasHints(options, criteria, uncertainties) {
  const hints = [];
  const validOptions = options.filter(o => o.name.trim());
  const validCriteria = criteria.filter(c => c.name.trim());

  validCriteria.forEach(crit => {
    validOptions.forEach(opt => {
      const key = `${opt.id}_${crit.id}`;
      const est = fromStoredUncertainty(crit, uncertainties[key]);
      const range = Math.abs(est.optimistic - est.pessimistic);
      const base = Math.abs(est.likely) || 1;
      if (range / base < 0.05 && crit.measureType !== 'score10') {
        hints.push({
          id: `${key}-narrow`,
          level: 'info',
          text: `"${opt.name}" → ${crit.name}: very narrow range — you may be faking precision. Consider widening bad/good scenarios.`,
        });
      }
    });
  });

  validCriteria.forEach(crit => {
    if (crit.isPositive === false && !crit.vetoEnabled) {
      const meta = getMeasureMeta(crit);
      validOptions.forEach(opt => {
        const est = fromStoredUncertainty(crit, uncertainties[`${opt.id}_${crit.id}`]);
        if (est.likely > meta.defaults.likely * 1.5) {
          hints.push({
            id: `${opt.id}-${crit.id}-veto`,
            level: 'warn',
            text: `"${crit.name}" for "${opt.name}" looks high (${est.likely}${meta.unit}). Consider a must-not-exceed rule on the weights step.`,
          });
        }
      });
    }
  });

  const weightTotal = validCriteria.reduce((s, c) => s + Number(c.weight || 0), 0);
  validCriteria.forEach(crit => {
    if (weightTotal > 0 && crit.weight / weightTotal > 0.6) {
      hints.push({
        id: `weight-${crit.id}`,
        level: 'warn',
        text: `"${crit.name}" has ${Math.round((crit.weight / weightTotal) * 100)}% weight — one factor may be driving everything. Try pairwise comparison.`,
      });
    }
  });

  return hints.slice(0, 6);
}

export default function BiasHints({ hints }) {
  if (!hints?.length) return null;

  return (
    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
      <h4 className="font-bold text-amber-900 flex items-center gap-2 mb-2 text-sm">
        <Lightbulb size={16} /> Estimate coaching
      </h4>
      <ul className="space-y-2">
        {hints.map(h => (
          <li key={h.id} className={`text-sm ${h.level === 'warn' ? 'text-amber-900' : 'text-amber-800'}`}>
            • {h.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
