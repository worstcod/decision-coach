import jStat from 'jstat';
import { createRng } from './rng.js';
import { wilsonInterval, isStatisticalTie } from './statistics.js';
import { violatesVeto } from './veto.js';

export const DEFAULT_ITERATIONS = 10000;

export function normalizeScore(value, globalMin, globalMax, isPositive) {
  if (globalMax <= globalMin) return 1;
  const normalized = (value - globalMin) / (globalMax - globalMin);
  return isPositive ? normalized : 1 - normalized;
}

export function samplePERT(min, mode, max, lambda = 4) {
  if (min >= max) return min;

  const safeMode = Math.max(min, Math.min(mode, max));
  const mean = (min + lambda * safeMode + max) / (lambda + 2);
  const stdev = (max - min) / (lambda + 2);
  const variance = stdev * stdev;

  const v = ((mean - min) * (max - mean) / variance) - 1;
  const alpha = Math.max(0.1, ((mean - min) / (max - min)) * v);
  const betaParam = Math.max(0.1, ((max - mean) / (max - min)) * v);

  return min + jStat.beta.sample(alpha, betaParam) * (max - min);
}

export function percentile(values, p) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

export function getUtilityFunction(type) {
  if (type === 'safe' || type === 'risk-averse') {
    return (x) => Math.log1p(x * 9) / Math.log1p(9);
  }
  if (type === 'aggressive' || type === 'risk-seeking') {
    return (x) => Math.pow(x, 2);
  }
  return (x) => x;
}

function computeIteration(options, normalizedCriteria, criteriaBounds, uncertainties, utilityFn, rng = Math.random) {
  const optionData = {};

  options.forEach(opt => {
    let score = 0;
    let vetoViolated = false;
    const factors = [];

    normalizedCriteria.forEach(crit => {
      const key = `${opt.id}_${crit.id}`;
      const input = uncertainties[key] || { min: 0, mode: 0, max: 0 };
      const safeMin = Math.min(input.min, input.mode, input.max);
      const safeMax = Math.max(input.min, input.mode, input.max);
      const safeMode = Math.max(safeMin, Math.min(input.mode, safeMax));

      const sampledValue = samplePERT(safeMin, safeMode, safeMax);
      if (violatesVeto(crit, sampledValue)) vetoViolated = true;

      const bounds = criteriaBounds[crit.id];
      const normalized = normalizeScore(sampledValue, bounds.min, bounds.max, crit.isPositive);
      const contribution = crit.normWeight * normalized;
      score += contribution;

      factors.push({
        critId: crit.id,
        name: crit.name,
        sampled: sampledValue,
        normalized,
        weight: crit.normWeight,
        contribution,
        vetoViolated: violatesVeto(crit, sampledValue),
      });
    });

    optionData[opt.id] = {
      totalScore: score,
      utilityScore: vetoViolated ? -1 : utilityFn(score),
      vetoViolated,
      factors,
    };
  });

  let maxUtility = -Infinity;
  let winnerId = null;
  let tieIds = [];

  options.forEach(opt => {
    const utilityScore = optionData[opt.id].utilityScore;
    if (utilityScore > maxUtility) {
      maxUtility = utilityScore;
      winnerId = opt.id;
      tieIds = [opt.id];
    } else if (utilityScore === maxUtility) {
      tieIds.push(opt.id);
    }
  });

  winnerId = tieIds[Math.floor(rng() * tieIds.length)];

  const sortedUtilities = options
    .map(opt => optionData[opt.id].utilityScore)
    .sort((a, b) => b - a);
  const margin = sortedUtilities.length > 1 ? sortedUtilities[0] - sortedUtilities[1] : sortedUtilities[0];

  return { optionData, winnerId, margin };
}

function buildRunSnapshot(index, label, options, optionData, winnerId, margin) {
  return {
    index,
    label,
    winnerId,
    winnerName: options.find(o => o.id === winnerId)?.name || '',
    margin,
    options: options.map(opt => ({
      id: opt.id,
      name: opt.name,
      totalScore: optionData[opt.id].totalScore,
      utilityScore: optionData[opt.id].utilityScore,
      factors: optionData[opt.id].factors,
    })),
  };
}

function buildFactorAttribution(options, normalizedCriteria, attributionSums, iterations, winningOptionId, results) {
  const sorted = [...options].sort(
    (a, b) => (results[b.id]?.winProbability || 0) - (results[a.id]?.winProbability || 0)
  );
  const runnerUpId = sorted.find(o => o.id !== winningOptionId)?.id;

  const byOption = {};
  options.forEach(opt => {
    byOption[opt.id] = normalizedCriteria.map(crit => {
      const avg = attributionSums[opt.id][crit.id] / iterations;
      const total = Object.values(attributionSums[opt.id]).reduce((s, v) => s + v, 0) || 1;
      return {
        critId: crit.id,
        name: crit.name,
        avgContribution: avg,
        pctOfTotal: avg / total,
      };
    }).sort((a, b) => b.avgContribution - a.avgContribution);
  });

  let winnerGap = [];
  if (runnerUpId) {
    winnerGap = normalizedCriteria.map(crit => {
      const winnerAvg = attributionSums[winningOptionId][crit.id] / iterations;
      const runnerAvg = attributionSums[runnerUpId][crit.id] / iterations;
      return {
        critId: crit.id,
        name: crit.name,
        winnerAvg,
        runnerUpAvg: runnerAvg,
        gap: winnerAvg - runnerAvg,
      };
    }).sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
  }

  return { byOption, winnerGap, runnerUpId };
}

export function runSimulation(
  options,
  criteria,
  uncertainties,
  iterations = DEFAULT_ITERATIONS,
  riskUtility = 'neutral',
  seed = null
) {
  const rng = createRng(seed);
  const restoreRandom = seed != null ? patchMathRandom(rng) : () => {};

  try {
    return runSimulationCore(options, criteria, uncertainties, iterations, riskUtility, rng, seed);
  } finally {
    restoreRandom();
  }
}

function patchMathRandom(rng) {
  const original = Math.random;
  Math.random = rng;
  return () => { Math.random = original; };
}

function runSimulationCore(options, criteria, uncertainties, iterations, riskUtility, rng, seed) {
  const totalWeight = criteria.reduce((sum, c) => sum + Number(c.weight || 0), 0);
  const normalizedCriteria = criteria.map(c => ({
    ...c,
    normWeight: totalWeight > 0 ? Number(c.weight) / totalWeight : 0,
    isPositive: c.isPositive !== false,
  }));

  const criteriaBounds = {};
  normalizedCriteria.forEach(crit => {
    let globalMin = Infinity;
    let globalMax = -Infinity;
    options.forEach(opt => {
      const key = `${opt.id}_${crit.id}`;
      const input = uncertainties[key] || { min: 0, mode: 0, max: 0 };
      [input.min, input.mode, input.max].forEach(v => {
        if (v < globalMin) globalMin = v;
        if (v > globalMax) globalMax = v;
      });
    });
    if (globalMin === globalMax) globalMax += 0.001;
    criteriaBounds[crit.id] = { min: globalMin, max: globalMax };
  });

  const utilityFn = getUtilityFunction(riskUtility);
  const simulatedScores = Object.fromEntries(options.map(o => [o.id, []]));
  const attributionSums = Object.fromEntries(
    options.map(o => [o.id, Object.fromEntries(normalizedCriteria.map(c => [c.id, 0]))])
  );
  const allRegrets = Object.fromEntries(options.map(o => [o.id, []]));
  const wins = Object.fromEntries(options.map(o => [o.id, 0]));
  const pairwiseKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  const pairwiseWins = {};

  options.forEach((a, i) => {
    options.slice(i + 1).forEach(b => {
      pairwiseWins[pairwiseKey(a.id, b.id)] = { aId: a.id, bId: b.id, aWins: 0, bWins: 0, ties: 0 };
    });
  });

  const closeCalls = [];
  let clearWinSnap = null;
  let firstSnap = null;
  const reservoir = [];
  const MAX_CLOSE = 3;
  const MAX_RESERVOIR = 8;

  for (let i = 0; i < iterations; i++) {
    const { optionData, winnerId, margin } = computeIteration(
      options, normalizedCriteria, criteriaBounds, uncertainties, utilityFn, rng
    );

    let maxUtility = -Infinity;
    options.forEach(opt => {
      const raw = optionData[opt.id].totalScore;
      const utility = optionData[opt.id].utilityScore;
      simulatedScores[opt.id].push(raw);
      if (utility > maxUtility) maxUtility = utility;

      optionData[opt.id].factors.forEach(f => {
        attributionSums[opt.id][f.critId] += f.contribution;
      });
    });

    options.forEach(opt => {
      allRegrets[opt.id].push(maxUtility - optionData[opt.id].utilityScore);
    });

    wins[winnerId] += 1;

    options.forEach((a, ai) => {
      options.slice(ai + 1).forEach(b => {
        const key = pairwiseKey(a.id, b.id);
        const ua = optionData[a.id].utilityScore;
        const ub = optionData[b.id].utilityScore;
        if (ua > ub) pairwiseWins[key].aWins += 1;
        else if (ub > ua) pairwiseWins[key].bWins += 1;
        else pairwiseWins[key].ties += 1;
      });
    });

    const snap = buildRunSnapshot(i, 'sample', options, optionData, winnerId, margin);
    if (i === 0) firstSnap = { ...snap, label: 'first' };
    if (!clearWinSnap || margin > clearWinSnap.margin) {
      clearWinSnap = { ...snap, label: 'clear_win' };
    }
    if (closeCalls.length < MAX_CLOSE || margin < closeCalls[closeCalls.length - 1].margin) {
      closeCalls.push({ margin, snap: { ...snap, label: 'close_call' } });
      closeCalls.sort((a, b) => a.margin - b.margin);
      if (closeCalls.length > MAX_CLOSE) closeCalls.pop();
    }
    const seen = i + 1;
    if (reservoir.length < MAX_RESERVOIR) {
      reservoir.push({ ...snap, label: 'random' });
    } else {
      const j = Math.floor(rng() * seen);
      if (j < MAX_RESERVOIR) reservoir[j] = { ...snap, label: 'random' };
    }
  }

  const results = {};
  options.forEach(opt => {
    const scores = simulatedScores[opt.id];
    const utilityScores = scores.map(utilityFn);
    const mean = scores.reduce((a, b) => a + b, 0) / iterations;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / iterations;
    const expectedUtility = utilityScores.reduce((a, b) => a + b, 0) / iterations;
    const stdDev = Math.sqrt(variance);
    const utilityStdDev = Math.sqrt(
      utilityScores.reduce((a, b) => a + Math.pow(b - expectedUtility, 2), 0) / iterations
    );
    const downsideThreshold = expectedUtility - utilityStdDev;

    const ci = wilsonInterval(wins[opt.id], iterations);
    results[opt.id] = {
      id: opt.id,
      name: opt.name,
      mean,
      variance,
      stdDev,
      expectedUtility,
      downsideRisk: utilityScores.filter(s => s < downsideThreshold).length / iterations,
      percentiles: {
        p10: percentile(scores, 10),
        p50: percentile(scores, 50),
        p90: percentile(scores, 90),
      },
      wins: wins[opt.id],
      winProbability: wins[opt.id] / iterations,
      winProbabilityCI: ci,
      expectedRegret: allRegrets[opt.id].reduce((a, b) => a + b, 0) / iterations,
      scores,
    };
  });

  const ciList = options.map(opt => results[opt.id].winProbabilityCI);
  const statisticalTie = isStatisticalTie(ciList);

  let winningOptionId = options[0]?.id;
  let maxWinProb = -1;
  options.forEach(opt => {
    if (results[opt.id].winProbability > maxWinProb) {
      maxWinProb = results[opt.id].winProbability;
      winningOptionId = opt.id;
    }
  });

  const sampleByIndex = new Map();
  if (firstSnap) sampleByIndex.set(firstSnap.index, firstSnap);
  closeCalls.forEach(c => sampleByIndex.set(c.snap.index, c.snap));
  if (clearWinSnap) sampleByIndex.set(clearWinSnap.index, clearWinSnap);
  reservoir.forEach(r => sampleByIndex.set(r.index, r));
  const sampleRuns = [...sampleByIndex.values()].sort((a, b) => a.index - b.index);

  const factorAttribution = buildFactorAttribution(
    options, normalizedCriteria, attributionSums, iterations, winningOptionId, results
  );

  const pairwise = Object.values(pairwiseWins).map(p => {
    const aCi = wilsonInterval(p.aWins, iterations);
    const bCi = wilsonInterval(p.bWins, iterations);
    const pairwiseTie = aCi.low <= bCi.high && bCi.low <= aCi.high;
    return {
      optionA: options.find(o => o.id === p.aId)?.name,
      optionB: options.find(o => o.id === p.bId)?.name,
      aWinPct: Math.round((p.aWins / iterations) * 100),
      bWinPct: Math.round((p.bWins / iterations) * 100),
      tiePct: Math.round((p.ties / iterations) * 100),
      aWinCI: { low: Math.round(aCi.low * 100), high: Math.round(aCi.high * 100) },
      bWinCI: { low: Math.round(bCi.low * 100), high: Math.round(bCi.high * 100) },
      statisticalTie: pairwiseTie,
    };
  });

  return {
    results,
    winningOptionId,
    normalizedCriteria,
    criteriaBounds,
    iterations,
    riskUtility,
    seed: seed ?? null,
    statisticalTie,
    sampleRuns,
    factorAttribution,
    pairwise,
  };
}

export function generateInsights(simulationData, criteria) {
  const { results, winningOptionId, riskUtility = 'neutral', factorAttribution } = simulationData;
  const optionsList = Object.values(results);
  const winner = results[winningOptionId];
  optionsList.sort((a, b) => b.winProbability - a.winProbability);
  const runnerUp = optionsList.length > 1 ? optionsList[1] : null;

  const insights = {
    descriptive: [],
    diagnostic: [],
    prescriptive: [],
    humanTake: '',
    warnings: [],
    confidence: 'Medium',
    sensitivity: [],
  };

  if (winner.winProbability > 0.75 && !simulationData.statisticalTie) insights.confidence = 'High';
  else if (winner.winProbability < 0.55 || simulationData.statisticalTie) insights.confidence = 'Low';

  if (winner.winProbability < 0.55) {
    insights.warnings.push("Weak decision: The winning option doesn't have a strong lead.");
  }

  if (simulationData.statisticalTie) {
    insights.warnings.push('Statistical tie: Win-probability confidence intervals overlap — the top options may not be distinguishable.');
  }

  const highVarianceOption = optionsList.find(o => o.stdDev > winner.mean * 0.3);
  if (highVarianceOption) {
    insights.warnings.push(`Risk warning: ${highVarianceOption.name} has very high variability.`);
  }

  const highRegretOption = optionsList.find(o => o.expectedRegret > winner.mean * 0.5);
  if (highRegretOption) {
    insights.warnings.push(`Regret warning: Choosing ${highRegretOption.name} could lead to significant regret if things go wrong.`);
  }

  const biasedCriterion = criteria.find(c => (c.weight / criteria.reduce((sum, x) => sum + x.weight, 0)) > 0.5);
  if (biasedCriterion) {
    insights.warnings.push(`Bias warning: Your decision is heavily dominated by "${biasedCriterion.name}".`);
  }

  const riskLabels = {
    'risk-averse': 'risk-averse (stability-focused)',
    neutral: 'risk-neutral',
    'risk-seeking': 'risk-seeking (upside-focused)',
  };

  if (winner.winProbabilityCI) {
    const lo = Math.round(winner.winProbabilityCI.low * 100);
    const hi = Math.round(winner.winProbabilityCI.high * 100);
    insights.descriptive.push(`95% confidence interval for win rate: ${lo}%–${hi}%.`);
  }

  insights.descriptive.push(`"${winner.name}" wins in ${Math.round(winner.winProbability * 100)}% of ${simulationData.iterations.toLocaleString()} simulated scenarios.`);
  if (riskUtility !== 'neutral') {
    insights.descriptive.push(`Rankings reflect your ${riskLabels[riskUtility] || riskUtility} profile.`);
  }

  const topGap = factorAttribution?.winnerGap?.[0];
  if (topGap && runnerUp && Math.abs(topGap.gap) > 0.01) {
    insights.diagnostic.push(
      `"${topGap.name}" contributed the most to "${winner.name}" beating "${runnerUp.name}" on average across simulations.`
    );
  } else if (biasedCriterion) {
    insights.diagnostic.push(`This outcome is strongly driven by the high importance you placed on "${biasedCriterion.name}".`);
  } else {
    insights.diagnostic.push('The outcome is fairly balanced across multiple factors.');
  }

  if (insights.confidence === 'High') {
    insights.humanTake = `The numbers are clear: ${winner.name} is the strongest choice here. Even accounting for the uncertainties you entered, it consistently outperforms the alternatives. Unless you have unstated reservations, you can move forward with confidence.`;
  } else if (insights.confidence === 'Medium') {
    insights.humanTake = `${winner.name} comes out slightly ahead, but it's not a blowout. Use the simulation inspector below to see exactly how close the alternatives were.`;
  } else {
    insights.humanTake = `This is a toss-up. The options are statistically very close. Review sample runs in the simulation inspector — many universes could go either way.`;
  }

  if (biasedCriterion && runnerUp) {
    insights.sensitivity.push(`If the importance of "${biasedCriterion.name}" drops by 10–15%, the result might flip towards ${runnerUp.name}.`);
  }

  return insights;
}

export { runSensitivityAnalysis, scaleWeights, SENSITIVITY_ITERATIONS } from './sensitivity.js';
export { createRng, randomSeed } from './rng.js';
export { wilsonInterval, isStatisticalTie } from './statistics.js';
export { applyMacroScenario, MACRO_SCENARIOS } from './macroScenarios.js';
export { violatesVeto, getVetoLabel } from './veto.js';
export { runTOPSIS, runMinimaxRegret } from './alternativeMethods.js';
