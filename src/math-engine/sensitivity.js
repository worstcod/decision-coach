import { runSimulation } from './index.js';

export const SENSITIVITY_ITERATIONS = 2500;
const MULTIPLIERS = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5];

export function scaleWeights(criteria, targetCritId, multiplier) {
  const total = criteria.reduce((sum, c) => sum + Number(c.weight || 0), 0);
  if (total <= 0) return criteria;

  const target = criteria.find(c => c.id === targetCritId);
  if (!target) return criteria;

  const newTargetWeight = Math.max(0, Number(target.weight) * multiplier);
  const othersTotal = total - Number(target.weight);
  const remaining = Math.max(0, total - newTargetWeight);

  return criteria.map(c => {
    if (c.id === targetCritId) return { ...c, weight: newTargetWeight };
    if (othersTotal <= 0) {
      const share = remaining / Math.max(1, criteria.length - 1);
      return { ...c, weight: share };
    }
    return { ...c, weight: Number(c.weight) * (remaining / othersTotal) };
  });
}

function getWinnerId(simData) {
  return simData.winningOptionId;
}

function getRunnerUpName(simData) {
  const sorted = Object.values(simData.results).sort(
    (a, b) => b.winProbability - a.winProbability
  );
  return sorted[1]?.name ?? null;
}

/**
 * For each factor, sweep weight multipliers and find where the recommended option changes.
 */
export function runSensitivityAnalysis(
  options,
  criteria,
  uncertainties,
  riskUtility,
  baseWinnerId,
  iterations = SENSITIVITY_ITERATIONS
) {
  const totalWeight = criteria.reduce((sum, c) => sum + Number(c.weight || 0), 0);
  const baseWinnerName = options.find(o => o.id === baseWinnerId)?.name ?? '';

  return criteria.map(crit => {
    const currentPct = totalWeight > 0 ? (Number(crit.weight) / totalWeight) * 100 : 0;
    const curve = MULTIPLIERS.map(mult => {
      const adjusted = scaleWeights(criteria, crit.id, mult);
      const sim = runSimulation(options, adjusted, uncertainties, iterations, riskUtility);
      const winnerId = getWinnerId(sim);
      return {
        multiplier: mult,
        weightPct: Math.round(
          (adjusted.find(c => c.id === crit.id)?.weight / totalWeight) * 100
        ),
        winnerId,
        winnerName: options.find(o => o.id === winnerId)?.name ?? '',
        winProbability: Math.round((sim.results[winnerId]?.winProbability ?? 0) * 100),
        flipped: winnerId !== baseWinnerId,
      };
    });

    const decreaseFlip = [...curve].reverse().find(p => p.multiplier < 1 && p.flipped);
    const increaseFlip = curve.find(p => p.multiplier > 1 && p.flipped);
    const runnerUp = getRunnerUpName(
      runSimulation(options, criteria, uncertainties, iterations, riskUtility)
    );

    let summary;
    if (!decreaseFlip && !increaseFlip) {
      summary = `Stable — changing "${crit.name}" weight (±50%) does not change the recommendation.`;
    } else if (decreaseFlip && increaseFlip) {
      summary = `Sensitive — drops below ${Math.round(decreaseFlip.multiplier * 100)}% or rises above ${Math.round(increaseFlip.multiplier * 100)}% of current weight may flip the winner.`;
    } else if (decreaseFlip) {
      summary = `If "${crit.name}" matters ${Math.round((1 - decreaseFlip.multiplier) * 100)}% less, "${decreaseFlip.winnerName}" may win instead of "${baseWinnerName}".`;
    } else {
      summary = `If "${crit.name}" matters ${Math.round((increaseFlip.multiplier - 1) * 100)}% more, "${increaseFlip.winnerName}" may win instead of "${baseWinnerName}".`;
    }

    return {
      critId: crit.id,
      name: crit.name,
      currentWeightPct: Math.round(currentPct),
      stable: !decreaseFlip && !increaseFlip,
      decreaseFlipAt: decreaseFlip?.multiplier ?? null,
      increaseFlipAt: increaseFlip?.multiplier ?? null,
      flipToName: decreaseFlip?.winnerName || increaseFlip?.winnerName || runnerUp,
      curve,
      summary,
    };
  });
}
