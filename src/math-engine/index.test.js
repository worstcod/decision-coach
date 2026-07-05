import { describe, it, expect } from 'vitest';
import {
  normalizeScore,
  samplePERT,
  percentile,
  getUtilityFunction,
  runSimulation,
  generateInsights,
  DEFAULT_ITERATIONS,
} from './index.js';

describe('normalizeScore', () => {
  it('maps higher-is-better values to 0-1', () => {
    expect(normalizeScore(50, 0, 100, true)).toBe(0.5);
    expect(normalizeScore(0, 0, 100, true)).toBe(0);
    expect(normalizeScore(100, 0, 100, true)).toBe(1);
  });

  it('inverts lower-is-better values', () => {
    expect(normalizeScore(0, 0, 100, false)).toBe(1);
    expect(normalizeScore(100, 0, 100, false)).toBe(0);
  });

  it('handles equal bounds', () => {
    expect(normalizeScore(5, 5, 5, true)).toBe(1);
  });
});

describe('samplePERT', () => {
  it('returns deterministic value when min equals max', () => {
    expect(samplePERT(10, 10, 10)).toBe(10);
  });

  it('samples within bounds', () => {
    for (let i = 0; i < 100; i++) {
      const sample = samplePERT(10, 20, 30);
      expect(sample).toBeGreaterThanOrEqual(10);
      expect(sample).toBeLessThanOrEqual(30);
    }
  });
});

describe('percentile', () => {
  it('returns correct median and tails', () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(percentile(values, 50)).toBe(5.5);
    expect(percentile(values, 10)).toBe(1.9);
    expect(percentile(values, 90)).toBe(9.1);
  });

  it('returns 0 for empty input', () => {
    expect(percentile([], 50)).toBe(0);
  });
});

describe('getUtilityFunction', () => {
  it('is identity for neutral profile', () => {
    const fn = getUtilityFunction('neutral');
    expect(fn(0.5)).toBe(0.5);
  });

  it('is concave for risk-averse profile (diminishing marginal utility)', () => {
    const fn = getUtilityFunction('risk-averse');
    expect(fn(0.5)).toBeGreaterThan(0.5);
    expect(fn(0.9) - fn(0.8)).toBeLessThan(fn(0.2) - fn(0.1));
  });

  it('rewards high scores for risk-seeking profile', () => {
    const fn = getUtilityFunction('risk-seeking');
    expect(fn(0.5)).toBeLessThan(fn(0.9));
  });
});

describe('runSimulation', () => {
  const options = [
    { id: 'o1', name: 'Safe' },
    { id: 'o2', name: 'Risky' },
  ];
  const criteria = [
    { id: 'c1', name: 'Payoff', weight: 100, isPositive: true },
  ];
  const uncertainties = {
    o1_c1: { min: 70, mode: 75, max: 80 },
    o2_c1: { min: 40, mode: 75, max: 95 },
  };

  it('ranks the safer option higher under risk-averse profile', () => {
    const neutral = runSimulation(options, criteria, uncertainties, 500, 'neutral');
    const riskAverse = runSimulation(options, criteria, uncertainties, 500, 'risk-averse');

    expect(neutral.results.o1.mean).toBeGreaterThan(neutral.results.o2.mean);
    expect(riskAverse.results.o1.winProbability).toBeGreaterThanOrEqual(
      riskAverse.results.o2.winProbability
    );
  });

  it('includes sample runs, attribution, and pairwise data', () => {
    const result = runSimulation(options, criteria, uncertainties, 200, 'neutral');

    expect(result.iterations).toBe(200);
    expect(result.sampleRuns.length).toBeGreaterThan(0);
    expect(result.sampleRuns[0].options.length).toBe(2);
    expect(result.factorAttribution.winnerGap.length).toBeGreaterThan(0);
    expect(result.pairwise.length).toBe(1);
  });

  it('defaults to 10,000 iterations', () => {
    expect(DEFAULT_ITERATIONS).toBe(10000);
  });

  it('normalizes weights to sum to 1', () => {
    const multiCriteria = [
      { id: 'c1', name: 'A', weight: 50, isPositive: true },
      { id: 'c2', name: 'B', weight: 50, isPositive: true },
    ];
    const multiUncertainties = {
      o1_c1: { min: 80, mode: 90, max: 100 },
      o1_c2: { min: 80, mode: 90, max: 100 },
      o2_c1: { min: 10, mode: 20, max: 30 },
      o2_c2: { min: 10, mode: 20, max: 30 },
    };
    const result = runSimulation(options, multiCriteria, multiUncertainties, 100, 'neutral');
    const weightSum = result.normalizedCriteria.reduce((sum, c) => sum + c.normWeight, 0);
    expect(weightSum).toBeCloseTo(1, 5);
    expect(result.results.o1.winProbability).toBeGreaterThan(result.results.o2.winProbability);
  });
});

describe('generateInsights', () => {
  it('mentions risk profile when not neutral', () => {
    const simData = runSimulation(
      [{ id: 'o1', name: 'A' }, { id: 'o2', name: 'B' }],
      [{ id: 'c1', name: 'Score', weight: 100, isPositive: true }],
      {
        o1_c1: { min: 80, mode: 90, max: 100 },
        o2_c1: { min: 10, mode: 20, max: 30 },
      },
      100,
      'risk-averse'
    );
    const insights = generateInsights(simData, [{ id: 'c1', name: 'Score', weight: 100 }]);
    expect(insights.descriptive.some(d => d.includes('risk-averse'))).toBe(true);
  });
});
