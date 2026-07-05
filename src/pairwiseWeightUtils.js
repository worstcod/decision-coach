/** Convert pairwise comparisons into normalized weights (0–100 scale). */
export function pairwiseToWeights(criteria, comparisons) {
  const scores = Object.fromEntries(criteria.map(c => [c.id, 1]));

  for (let i = 0; i < criteria.length; i++) {
    for (let j = i + 1; j < criteria.length; j++) {
      const a = criteria[i];
      const b = criteria[j];
      const key = pairKey(a.id, b.id);
      const pick = comparisons[key];
      if (pick === a.id) {
        scores[a.id] += 1;
      } else if (pick === b.id) {
        scores[b.id] += 1;
      } else {
        scores[a.id] += 0.5;
        scores[b.id] += 0.5;
      }
    }
  }

  const total = Object.values(scores).reduce((s, v) => s + v, 0) || 1;
  return criteria.map(c => ({
    ...c,
    weight: Math.max(1, Math.round((scores[c.id] / total) * 100)),
  }));
}

export function pairKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function getPairList(criteria) {
  const pairs = [];
  for (let i = 0; i < criteria.length; i++) {
    for (let j = i + 1; j < criteria.length; j++) {
      pairs.push({ a: criteria[i], b: criteria[j], key: pairKey(criteria[i].id, criteria[j].id) });
    }
  }
  return pairs;
}
