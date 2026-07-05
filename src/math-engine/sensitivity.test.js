import { describe, it, expect } from 'vitest';
import { scaleWeights, runSensitivityAnalysis, SENSITIVITY_ITERATIONS } from './sensitivity.js';
import { runSimulation } from './index.js';

describe('scaleWeights', () => {
  const criteria = [
    { id: 'a', name: 'A', weight: 60 },
    { id: 'b', name: 'B', weight: 40 },
  ];

  it('preserves total weight when scaling one factor', () => {
    const scaled = scaleWeights(criteria, 'a', 1.5);
    const total = scaled.reduce((s, c) => s + c.weight, 0);
    expect(total).toBeCloseTo(100, 5);
    expect(scaled.find(c => c.id === 'a').weight).toBeCloseTo(90, 5);
  });

  it('can zero out a factor weight', () => {
    const scaled = scaleWeights(criteria, 'a', 0);
    expect(scaled.find(c => c.id === 'a').weight).toBe(0);
    expect(scaled.find(c => c.id === 'b').weight).toBeCloseTo(100, 5);
  });
});

describe('runSensitivityAnalysis', () => {
  const options = [
    { id: 'o1', name: 'Safe' },
    { id: 'o2', name: 'Risky' },
  ];
  const criteria = [
    { id: 'c1', name: 'Payoff', weight: 80, isPositive: true },
    { id: 'c2', name: 'Risk', weight: 20, isPositive: false },
  ];
  const uncertainties = {
    o1_c1: { min: 8, mode: 9, max: 10 },
    o1_c2: { min: 1, mode: 2, max: 3 },
    o2_c1: { min: 3, mode: 5, max: 10 },
    o2_c2: { min: 7, mode: 8, max: 9 },
  };

  it('returns one row per criterion with curve data', () => {
    const base = runSimulation(options, criteria, uncertainties, 500, 'neutral');
    const analysis = runSensitivityAnalysis(
      options,
      criteria,
      uncertainties,
      'neutral',
      base.winningOptionId,
      500
    );
    expect(analysis).toHaveLength(2);
    expect(analysis[0].curve.length).toBeGreaterThan(5);
    expect(analysis[0].summary).toBeTruthy();
  });

  it('uses lighter iteration count by default', () => {
    expect(SENSITIVITY_ITERATIONS).toBeLessThan(10000);
  });
});
