/** TOPSIS on most-likely estimates (weighted distance to ideal). */

function normalizeScore(value, globalMin, globalMax, isPositive) {
  if (globalMax <= globalMin) return 1;
  const normalized = (value - globalMin) / (globalMax - globalMin);
  return isPositive ? normalized : 1 - normalized;
}

function buildLikelyMatrix(options, criteria, uncertainties, criteriaBounds) {
  return options.map(opt =>
    criteria.map(crit => {
      const key = `${opt.id}_${crit.id}`;
      const input = uncertainties[key] || { mode: 0 };
      const bounds = criteriaBounds[crit.id];
      return normalizeScore(input.mode, bounds.min, bounds.max, crit.isPositive !== false);
    })
  );
}

function normalizeWeights(criteria) {
  const total = criteria.reduce((s, c) => s + Number(c.weight || 0), 0) || 1;
  return criteria.map(c => Number(c.weight) / total);
}

/** TOPSIS on most-likely estimates (weighted distance to ideal). */
export function runTOPSIS(options, criteria, uncertainties, criteriaBounds) {
  const matrix = buildLikelyMatrix(options, criteria, uncertainties, criteriaBounds);
  const weights = normalizeWeights(criteria);
  const n = options.length;
  const m = criteria.length;

  const weighted = matrix.map(row =>
    row.map((val, j) => val * weights[j])
  );

  const idealBest = Array.from({ length: m }, (_, j) =>
    Math.max(...weighted.map(row => row[j]))
  );
  const idealWorst = Array.from({ length: m }, (_, j) =>
    Math.min(...weighted.map(row => row[j]))
  );

  const scores = weighted.map(row => {
    const dPlus = Math.sqrt(row.reduce((s, v, j) => s + (v - idealBest[j]) ** 2, 0));
    const dMinus = Math.sqrt(row.reduce((s, v, j) => s + (v - idealWorst[j]) ** 2, 0));
    return dMinus / (dPlus + dMinus + 1e-9);
  });

  const ranked = options
    .map((opt, i) => ({ id: opt.id, name: opt.name, score: scores[i] }))
    .sort((a, b) => b.score - a.score);

  return {
    method: 'TOPSIS',
    winnerId: ranked[0]?.id,
    winnerName: ranked[0]?.name,
    ranking: ranked.map(r => ({
      ...r,
      scorePct: Math.round(r.score * 100),
    })),
  };
}

/** Minimax regret on most-likely normalized values. */
export function runMinimaxRegret(options, criteria, uncertainties, criteriaBounds) {
  const matrix = buildLikelyMatrix(options, criteria, uncertainties, criteriaBounds);
  const m = criteria.length;

  const bestPerCriterion = Array.from({ length: m }, (_, j) =>
    Math.max(...matrix.map(row => row[j]))
  );

  const maxRegrets = matrix.map((row, i) => {
    const regrets = row.map((val, j) => bestPerCriterion[j] - val);
    return { option: options[i], maxRegret: Math.max(...regrets) };
  });

  const ranked = maxRegrets
    .map(r => ({
      id: r.option.id,
      name: r.option.name,
      maxRegret: r.maxRegret,
    }))
    .sort((a, b) => a.maxRegret - b.maxRegret);

  return {
    method: 'Minimax Regret',
    winnerId: ranked[0]?.id,
    winnerName: ranked[0]?.name,
    ranking: ranked.map(r => ({
      ...r,
      scorePct: Math.round((1 - r.maxRegret) * 100),
    })),
  };
}
