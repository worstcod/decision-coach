/** Returns true if sampled value violates a must-have (veto) rule. */
export function violatesVeto(criterion, sampledValue) {
  if (!criterion.vetoEnabled) return false;
  const threshold = Number(criterion.vetoThreshold);
  if (Number.isNaN(threshold)) return false;

  if (criterion.vetoDirection === 'max') {
    return sampledValue > threshold;
  }
  return sampledValue < threshold;
}

export function getVetoLabel(criterion) {
  if (!criterion.vetoEnabled) return null;
  const t = criterion.vetoThreshold;
  if (criterion.vetoDirection === 'max') {
    return `Must not exceed ${t}`;
  }
  return `Must be at least ${t}`;
}
