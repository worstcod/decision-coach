/** Wilson score interval for binomial proportion (95% default). */
export function wilsonInterval(wins, trials, z = 1.96) {
  if (trials <= 0) return { low: 0, high: 0, point: 0 };
  const p = wins / trials;
  const z2 = z * z;
  const denom = 1 + z2 / trials;
  const center = (p + z2 / (2 * trials)) / denom;
  const margin = (z * Math.sqrt((p * (1 - p) + z2 / (4 * trials)) / trials)) / denom;
  return {
    point: p,
    low: Math.max(0, center - margin),
    high: Math.min(1, center + margin),
  };
}

export function isStatisticalTie(intervals) {
  const sorted = [...intervals].sort((a, b) => b.point - a.point);
  if (sorted.length < 2) return false;
  return sorted[0].low <= sorted[1].high;
}
