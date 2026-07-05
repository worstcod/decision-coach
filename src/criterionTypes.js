/**
 * Defines how each factor is measured and what default estimates look like.
 * Users pick a type — they never need to guess what "unit" means.
 */
export const MEASURE_TYPES = {
  score10: {
    id: 'score10',
    label: 'Rating (1–10)',
    unit: '/10',
    hint: '1 = poor, 10 = excellent. Use whole numbers.',
    defaults: { pessimistic: 4, likely: 7, optimistic: 9 },
    placeholders: { pessimistic: '4', likely: '7', optimistic: '9' },
  },
  score100: {
    id: 'score100',
    label: 'Rating (0–100)',
    unit: '/100',
    hint: '0 = terrible, 100 = perfect.',
    defaults: { pessimistic: 30, likely: 60, optimistic: 85 },
    placeholders: { pessimistic: '30', likely: '60', optimistic: '85' },
  },
  salary: {
    id: 'salary',
    label: 'Annual salary (USD)',
    unit: '$/yr',
    hint: 'Enter the full yearly amount, e.g. 90000 for $90k.',
    defaults: { pessimistic: 70000, likely: 95000, optimistic: 130000 },
    placeholders: { pessimistic: '70000', likely: '95000', optimistic: '130000' },
  },
  salary_inr: {
    id: 'salary_inr',
    label: 'Annual salary (INR)',
    unit: '₹/yr',
    hint: 'Enter lakhs as full amount, e.g. 1800000 for ₹18L.',
    defaults: { pessimistic: 1200000, likely: 1800000, optimistic: 2800000 },
    placeholders: { pessimistic: '1200000', likely: '1800000', optimistic: '2800000' },
  },
  salary_eur: {
    id: 'salary_eur',
    label: 'Annual salary (EUR)',
    unit: '€/yr',
    hint: 'Enter the full yearly amount in euros.',
    defaults: { pessimistic: 45000, likely: 65000, optimistic: 90000 },
    placeholders: { pessimistic: '45000', likely: '65000', optimistic: '90000' },
  },
  dollars: {
    id: 'dollars',
    label: 'One-time cost (USD)',
    unit: '$',
    hint: 'Total upfront cost in dollars.',
    defaults: { pessimistic: 5000, likely: 15000, optimistic: 30000 },
    placeholders: { pessimistic: '5000', likely: '15000', optimistic: '30000' },
  },
  dollars_inr: {
    id: 'dollars_inr',
    label: 'One-time cost (INR)',
    unit: '₹',
    hint: 'Total upfront cost in rupees.',
    defaults: { pessimistic: 50000, likely: 200000, optimistic: 500000 },
    placeholders: { pessimistic: '50000', likely: '200000', optimistic: '500000' },
  },
  dollars_eur: {
    id: 'dollars_eur',
    label: 'One-time cost (EUR)',
    unit: '€',
    hint: 'Total upfront cost in euros.',
    defaults: { pessimistic: 3000, likely: 12000, optimistic: 25000 },
    placeholders: { pessimistic: '3000', likely: '12000', optimistic: '25000' },
  },
  percent: {
    id: 'percent',
    label: 'Percent (%)',
    unit: '%',
    hint: 'Enter as a number, e.g. 8 for 8%.',
    defaults: { pessimistic: 2, likely: 7, optimistic: 12 },
    placeholders: { pessimistic: '2', likely: '7', optimistic: '12' },
  },
  minutes: {
    id: 'minutes',
    label: 'Minutes',
    unit: 'min',
    hint: 'Daily one-way commute or wait time in minutes.',
    defaults: { pessimistic: 75, likely: 45, optimistic: 20 },
    placeholders: { pessimistic: '75', likely: '45', optimistic: '20' },
  },
  hours: {
    id: 'hours',
    label: 'Hours per week',
    unit: 'hrs/wk',
    hint: 'Time commitment per week.',
    defaults: { pessimistic: 60, likely: 40, optimistic: 25 },
    placeholders: { pessimistic: '60', likely: '40', optimistic: '25' },
  },
  years: {
    id: 'years',
    label: 'Years',
    unit: 'yrs',
    hint: 'Duration in years (e.g. lock-up period).',
    defaults: { pessimistic: 5, likely: 3, optimistic: 1 },
    placeholders: { pessimistic: '5', likely: '3', optimistic: '1' },
  },
};

export const CURRENCY_OPTIONS = [
  { id: 'USD', label: 'USD ($)', salaryType: 'salary', costType: 'dollars' },
  { id: 'INR', label: 'INR (₹)', salaryType: 'salary_inr', costType: 'dollars_inr' },
  { id: 'EUR', label: 'EUR (€)', salaryType: 'salary_eur', costType: 'dollars_eur' },
];

const SALARY_TYPES = new Set(['salary', 'salary_inr', 'salary_eur']);
const COST_TYPES = new Set(['dollars', 'dollars_inr', 'dollars_eur']);

export function applyCurrencyToCriterion(criterion, currencyId = 'USD') {
  const currency = CURRENCY_OPTIONS.find(c => c.id === currencyId) || CURRENCY_OPTIONS[0];
  if (SALARY_TYPES.has(criterion.measureType)) {
    return enrichCriterion({ ...criterion, measureType: currency.salaryType });
  }
  if (COST_TYPES.has(criterion.measureType)) {
    return enrichCriterion({ ...criterion, measureType: currency.costType });
  }
  return enrichCriterion(criterion);
}

export function applySimpleModeToCriterion(criterion) {
  return enrichCriterion({
    ...criterion,
    measureType: 'score10',
    isPositive: criterion.isPositive !== false,
  });
}

export function toSimpleModeUncertainty(criterion, likelyValue) {
  const l = Number(likelyValue);
  const spread = 2;
  if (criterion.isPositive !== false) {
    return toStoredUncertainty(criterion, {
      pessimistic: Math.max(1, l - spread),
      likely: l,
      optimistic: Math.min(10, l + spread),
    });
  }
  return toStoredUncertainty(criterion, {
    pessimistic: Math.min(10, l + spread),
    likely: l,
    optimistic: Math.max(1, l - spread),
  });
}

const UNIT_TO_MEASURE = {
  '/10': 'score10',
  '/100': 'score100',
  $: 'salary',
  '%': 'percent',
  mins: 'minutes',
  min: 'minutes',
  hrs: 'hours',
  'hrs/wk': 'hours',
  yrs: 'years',
  '$/yr': 'salary',
};

export function resolveMeasureType(criterion) {
  if (criterion.measureType && MEASURE_TYPES[criterion.measureType]) {
    return criterion.measureType;
  }
  if (criterion.unit && UNIT_TO_MEASURE[criterion.unit]) {
    return UNIT_TO_MEASURE[criterion.unit];
  }
  return 'score100';
}

export function getMeasureMeta(criterion) {
  return MEASURE_TYPES[resolveMeasureType(criterion)];
}

/** Map user-facing bad/likely/good to internal min/mode/max storage. */
export function toStoredUncertainty(criterion, { pessimistic, likely, optimistic }) {
  const p = Number(pessimistic);
  const l = Number(likely);
  const o = Number(optimistic);
  if (criterion.isPositive !== false) {
    return { min: p, mode: l, max: o };
  }
  // Lower is better: bad scenario = highest number
  return { min: p, mode: l, max: o };
}

export function fromStoredUncertainty(criterion, stored) {
  if (!stored) return getDefaultEstimates(criterion);
  return {
    pessimistic: stored.min,
    likely: stored.mode,
    optimistic: stored.max,
  };
}

export function getDefaultEstimates(criterion, optionIndex = 0) {
  const meta = getMeasureMeta(criterion);
  let { pessimistic, likely, optimistic } = meta.defaults;

  // Measure-type defaults are often written low→high; invert for lower-is-better factors
  if (criterion.isPositive === false && pessimistic < optimistic) {
    [pessimistic, optimistic] = [optimistic, pessimistic];
  }

  const bump = optionIndex * 0.02;
  if (criterion.isPositive !== false) {
    return {
      pessimistic: Math.round(pessimistic * (1 - bump)),
      likely: Math.round(likely * (1 + bump * 0.5)),
      optimistic: Math.round(optimistic * (1 + bump)),
    };
  }
  return {
    pessimistic: Math.round(pessimistic * (1 + bump)),
    likely: Math.round(likely * (1 - bump * 0.5)),
    optimistic: Math.round(optimistic * (1 - bump)),
  };
}

export function getScenarioLabels(criterion) {
  const isHigherBetter = criterion.isPositive !== false;
  if (isHigherBetter) {
    return {
      pessimistic: 'If things go badly',
      likely: 'Most likely',
      optimistic: 'If things go well',
      orderHint: 'Enter low → high (bad scenario has the smallest number)',
    };
  }
  return {
    pessimistic: 'If things go badly',
    likely: 'Most likely',
    optimistic: 'If things go well',
    orderHint: 'Enter high → low (bad scenario has the largest number)',
  };
}

export function isEstimateValid(criterion, { pessimistic, likely, optimistic }) {
  const p = Number(pessimistic);
  const l = Number(likely);
  const o = Number(optimistic);
  if ([p, l, o].some(n => Number.isNaN(n))) return false;

  if (criterion.isPositive !== false) {
    return p <= l && l <= o;
  }
  return p >= l && l >= o;
}

export function buildInitialUncertainties(options, criteria) {
  const next = {};
  options.forEach((opt, optIdx) => {
    criteria.forEach(crit => {
      const key = `${opt.id}_${crit.id}`;
      const estimates = getDefaultEstimates(crit, optIdx);
      next[key] = toStoredUncertainty(crit, estimates);
    });
  });
  return next;
}

export function enrichCriterion(criterion) {
  const measureType = resolveMeasureType(criterion);
  const meta = MEASURE_TYPES[measureType];
  return {
    ...criterion,
    measureType,
    unit: meta.unit,
    isPositive: criterion.isPositive !== false,
  };
}
