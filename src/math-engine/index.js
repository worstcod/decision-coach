import jStat from 'jstat';

// 1. Normalization & Beta-PERT Distribution Sampling
export function normalizeScore(value, globalMin, globalMax, isPositive) {
  if (globalMax <= globalMin) return 1; // Edge case
  const normalized = (value - globalMin) / (globalMax - globalMin);
  return isPositive ? normalized : 1 - normalized;
}

export function samplePERT(min, mode, max, lambda = 4) {
  if (min >= max) return min; // Deterministic fallback
  
  const safeMode = Math.max(min, Math.min(mode, max));
  
  const mean = (min + lambda * safeMode + max) / (lambda + 2);
  const stdev = (max - min) / (lambda + 2);
  const variance = stdev * stdev;
  
  const v = ((mean - min) * (max - mean) / variance) - 1;
  const alpha = Math.max(0.1, ((mean - min) / (max - min)) * v);
  const betaParam = Math.max(0.1, ((max - mean) / (max - min)) * v);

  const betaSample = jStat.beta.sample(alpha, betaParam);
  
  return min + betaSample * (max - min);
}

// 2. Monte Carlo Simulation
export function runSimulation(options, criteria, uncertainties, iterations = 2000, riskUtility = 'neutral') {
  // Normalize weights
  const totalWeight = criteria.reduce((sum, c) => sum + Number(c.weight || 0), 0);
  const normalizedCriteria = criteria.map(c => ({
    ...c,
    normWeight: totalWeight > 0 ? Number(c.weight) / totalWeight : 0,
    isPositive: c.isPositive !== false // Default to true if undefined
  }));

  // Calculate Global Min and Max for every criterion for Normalization
  const criteriaBounds = {};
  normalizedCriteria.forEach(crit => {
    let globalMin = Infinity;
    let globalMax = -Infinity;
    options.forEach(opt => {
      const key = `${opt.id}_${crit.id}`;
      const input = uncertainties[key] || { min: 0, mode: 0, max: 0 };
      if (input.min < globalMin) globalMin = input.min;
      if (input.mode < globalMin) globalMin = input.mode;
      if (input.max < globalMin) globalMin = input.max;
      
      if (input.max > globalMax) globalMax = input.max;
      if (input.min > globalMax) globalMax = input.min;
      if (input.mode > globalMax) globalMax = input.mode;
    });
    if (globalMin === globalMax) globalMax += 0.001;
    criteriaBounds[crit.id] = { min: globalMin, max: globalMax };
  });

  const simulatedScores = {};
  options.forEach(opt => {
    simulatedScores[opt.id] = [];
  });

  const utilityFn = getUtilityFunction(riskUtility);

  // Run iterations
  for (let i = 0; i < iterations; i++) {
    const currentIterationScores = {};
    
    options.forEach(opt => {
      let score = 0;
      normalizedCriteria.forEach(crit => {
        const key = `${opt.id}_${crit.id}`;
        const input = uncertainties[key] || { min: 0, mode: 0, max: 0 };
        // If min > max or min > mode, handle gracefully
        const safeMin = Math.min(input.min, input.mode, input.max);
        const safeMax = Math.max(input.min, input.mode, input.max);
        const safeMode = Math.max(safeMin, Math.min(input.mode, safeMax));
        
        // 1. Sample Beta-PERT
        const sampledValue = samplePERT(safeMin, safeMode, safeMax);
        
        // 2. Normalize to 0-1 scale depending on direction
        const bounds = criteriaBounds[crit.id];
        const normalized = normalizeScore(sampledValue, bounds.min, bounds.max, crit.isPositive);
        
        // 3. Apply normalized weight
        score += crit.normWeight * normalized;
      });
      currentIterationScores[opt.id] = score;
      simulatedScores[opt.id].push(score);
    });
  }

  // Calculate statistics
  const results = {};
  let overallMaxMean = -Infinity;
  let winningOptionId = null;

  options.forEach(opt => {
    const scores = simulatedScores[opt.id];
    const mean = scores.reduce((a, b) => a + b, 0) / iterations;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / iterations;
    const expectedUtility = scores.reduce((a, b) => a + utilityFn(b), 0) / iterations;
    
    // Calculate downside risk (probability of score being less than 80% of the mean of all modes, as a heuristic threshold if not provided)
    // We'll calculate a simple absolute risk for now: P(score < mean - 1 stdDev)
    const stdDev = Math.sqrt(variance);
    const downsideThreshold = mean - stdDev;
    const downsideRisk = scores.filter(s => s < downsideThreshold).length / iterations;

    results[opt.id] = {
      id: opt.id,
      name: opt.name,
      mean,
      variance,
      stdDev,
      expectedUtility,
      downsideRisk,
      wins: 0,
      winProbability: 0,
      scores // Used for histograms
    };
  });

  // Calculate Win Probability & Regret
  const allRegrets = options.reduce((acc, opt) => ({ ...acc, [opt.id]: [] }), {});

  for (let i = 0; i < iterations; i++) {
    let maxScore = -Infinity;
    let winnerId = null;

    options.forEach(opt => {
      const score = simulatedScores[opt.id][i];
      if (score > maxScore) {
        maxScore = score;
        winnerId = opt.id;
      }
    });

    results[winnerId].wins += 1;

    // Regret calculation
    options.forEach(opt => {
      const score = simulatedScores[opt.id][i];
      allRegrets[opt.id].push(maxScore - score);
    });
  }

  options.forEach(opt => {
    results[opt.id].winProbability = results[opt.id].wins / iterations;
    results[opt.id].expectedRegret = allRegrets[opt.id].reduce((a, b) => a + b, 0) / iterations;
    
    if (results[opt.id].mean > overallMaxMean) {
      overallMaxMean = results[opt.id].mean;
      winningOptionId = opt.id;
    }
  });

  // Determine actual winner based on win probability rather than just mean, 
  // to account for heavy tails if desired, but mean is standard. 
  // Let's use max win probability to find the winner.
  let maxWinProb = -1;
  options.forEach(opt => {
    if (results[opt.id].winProbability > maxWinProb) {
      maxWinProb = results[opt.id].winProbability;
      winningOptionId = opt.id;
    }
  });

  return {
    results,
    winningOptionId,
    normalizedCriteria,
    iterations
  };
}

function getUtilityFunction(type) {
  // Score x is now guaranteed to be between 0 and 1
  if (type === 'safe' || type === 'risk-averse') {
    return (x) => Math.log1p(x * 9) / Math.log1p(9);
  } else if (type === 'aggressive' || type === 'risk-seeking') {
    return (x) => Math.pow(x, 2);
  }
  return (x) => x; // risk-neutral
}

// 3. Insight Generation
export function generateInsights(simulationData, criteria) {
  const { results, winningOptionId } = simulationData;
  const optionsList = Object.values(results);
  const winner = results[winningOptionId];
  
  // Sort options by win probability descending
  optionsList.sort((a, b) => b.winProbability - a.winProbability);
  const runnerUp = optionsList.length > 1 ? optionsList[1] : null;

  const insights = {
    descriptive: [],
    diagnostic: [],
    prescriptive: [],
    humanTake: '',
    warnings: [],
    confidence: 'Medium',
    sensitivity: []
  };

  // Confidence Level
  if (winner.winProbability > 0.75) insights.confidence = 'High';
  else if (winner.winProbability < 0.55) insights.confidence = 'Low';

  // Warnings
  if (winner.winProbability < 0.55) {
    insights.warnings.push("Weak decision: The winning option doesn't have a strong lead.");
  }
  
  const highVarianceOption = optionsList.find(o => o.stdDev > (winner.mean * 0.3)); // arbitrary threshold for high risk
  if (highVarianceOption) {
    insights.warnings.push(`Risk warning: ${highVarianceOption.name} has very high variability.`);
  }

  const highRegretOption = optionsList.find(o => o.expectedRegret > (winner.mean * 0.5));
  if (highRegretOption) {
    insights.warnings.push(`Regret warning: Choosing ${highRegretOption.name} could lead to significant regret if things go wrong.`);
  }

  const biasedCriterion = criteria.find(c => (c.weight / criteria.reduce((sum, x) => sum + x.weight, 0)) > 0.5);
  if (biasedCriterion) {
    insights.warnings.push(`Bias warning: Your decision is heavily dominated by "${biasedCriterion.name}".`);
  }

  // Descriptive
  insights.descriptive.push(`"${winner.name}" wins in ${Math.round(winner.winProbability * 100)}% of simulated scenarios.`);
  if (runnerUp) {
    if (winner.variance > runnerUp.variance) {
      insights.descriptive.push(`"${winner.name}" has higher potential upside, but "${runnerUp.name}" is more predictable (lower variance).`);
    } else {
      insights.descriptive.push(`"${runnerUp.name}" has higher variability compared to "${winner.name}".`);
    }
  }

  // Diagnostic
  if (biasedCriterion) {
    insights.diagnostic.push(`This outcome is strongly driven by the high importance you placed on "${biasedCriterion.name}".`);
  } else {
    insights.diagnostic.push(`The outcome is fairly balanced across multiple factors.`);
  }

  // Prescriptive / Human Take
  if (insights.confidence === 'High') {
    insights.humanTake = `The numbers are clear: ${winner.name} is the strongest choice here. Even accounting for the uncertainties you entered, it consistently outperforms the alternatives. Unless you have unstated reservations, you can move forward with confidence.`;
  } else if (insights.confidence === 'Medium') {
    insights.humanTake = `${winner.name} comes out slightly ahead, but it's not a blowout. If you prefer stability and predictability, double-check the variance. If you're comfortable with taking risks for higher upside, ensure your best-case estimates for ${runnerUp ? runnerUp.name : 'the alternatives'} are realistic.`;
  } else {
    insights.humanTake = `This is a toss-up. The options are statistically very close, meaning there is no clear "wrong" choice here. When the math is this tight, you should rely on your intuition. Which option simply *feels* better to you?`;
  }

  // Sensitivity
  if (biasedCriterion && runnerUp) {
    insights.sensitivity.push(`If the importance of "${biasedCriterion.name}" drops by 10-15%, the result might flip towards ${runnerUp.name}.`);
  }

  return insights;
}
