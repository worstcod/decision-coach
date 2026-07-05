/** Shift all factor estimates together to model correlated good/bad environments. */
export const MACRO_SCENARIOS = {
  neutral: {
    id: 'neutral',
    label: 'Neutral baseline',
    description: 'Use your estimates as entered.',
    shift: 0,
  },
  optimistic: {
    id: 'optimistic',
    label: 'Optimistic environment',
    description: 'Positive factors trend better; costs and risks trend lower.',
    shift: 0.12,
  },
  pessimistic: {
    id: 'pessimistic',
    label: 'Pessimistic environment',
    description: 'Positive factors trend worse; costs and risks trend higher.',
    shift: -0.12,
  },
};

function shiftValue(value, delta, isPositive) {
  const v = Number(value);
  if (Number.isNaN(v)) return value;
  const sign = isPositive !== false ? 1 : -1;
  const shifted = v * (1 + sign * delta);
  return Math.max(0, shifted);
}

export function applyMacroScenario(uncertainties, criteria, macroId = 'neutral') {
  const macro = MACRO_SCENARIOS[macroId] || MACRO_SCENARIOS.neutral;
  if (macro.shift === 0) return uncertainties;

  const critById = Object.fromEntries(criteria.map(c => [c.id, c]));
  const next = {};

  Object.entries(uncertainties).forEach(([key, stored]) => {
    const critId = key.split('_').slice(1).join('_');
    const crit = critById[critId];
    if (!crit || !stored) {
      next[key] = stored;
      return;
    }
    next[key] = {
      min: shiftValue(stored.min, macro.shift, crit.isPositive),
      mode: shiftValue(stored.mode, macro.shift, crit.isPositive),
      max: shiftValue(stored.max, macro.shift, crit.isPositive),
    };
    if (crit.isPositive === false) {
      const vals = [next[key].min, next[key].mode, next[key].max].sort((a, b) => a - b);
      next[key] = { min: vals[0], mode: vals[1], max: vals[2] };
    } else {
      const vals = [next[key].min, next[key].mode, next[key].max].sort((a, b) => a - b);
      next[key] = { min: vals[0], mode: vals[1], max: vals[2] };
    }
  });

  return next;
}
