import { describe, it, expect } from 'vitest';
import { wilsonInterval, isStatisticalTie } from './statistics.js';
import { applyMacroScenario, MACRO_SCENARIOS } from './macroScenarios.js';
import { violatesVeto } from './veto.js';
import { runTOPSIS, runMinimaxRegret } from './alternativeMethods.js';
import { createRng } from './rng.js';
import { runSimulation } from './index.js';

describe('wilsonInterval', () => {
  it('returns interval containing point estimate', () => {
    const ci = wilsonInterval(700, 1000);
    expect(ci.low).toBeLessThanOrEqual(0.7);
    expect(ci.high).toBeGreaterThanOrEqual(0.7);
  });
});

describe('isStatisticalTie', () => {
  it('detects overlapping intervals', () => {
    expect(isStatisticalTie([
      { point: 0.52, low: 0.48, high: 0.56 },
      { point: 0.50, low: 0.46, high: 0.54 },
    ])).toBe(true);
  });
});

describe('applyMacroScenario', () => {
  it('shifts positive factor values in optimistic mode', () => {
    const uncertainties = { o1_c1: { min: 5, mode: 7, max: 9 } };
    const criteria = [{ id: 'c1', isPositive: true }];
    const next = applyMacroScenario(uncertainties, criteria, 'optimistic');
    expect(next.o1_c1.mode).toBeGreaterThan(7);
  });
});

describe('violatesVeto', () => {
  it('flags values below minimum threshold', () => {
    expect(violatesVeto({ vetoEnabled: true, vetoDirection: 'min', vetoThreshold: 7 }, 5)).toBe(true);
    expect(violatesVeto({ vetoEnabled: true, vetoDirection: 'min', vetoThreshold: 7 }, 8)).toBe(false);
  });
});

describe('alternative methods', () => {
  const options = [{ id: 'o1', name: 'A' }, { id: 'o2', name: 'B' }];
  const criteria = [{ id: 'c1', name: 'Pay', weight: 100, isPositive: true }];
  const uncertainties = {
    o1_c1: { min: 8, mode: 9, max: 10 },
    o2_c1: { min: 4, mode: 5, max: 6 },
  };
  const bounds = { c1: { min: 4, max: 10 } };

  it('TOPSIS picks higher option', () => {
    const r = runTOPSIS(options, criteria, uncertainties, bounds);
    expect(r.winnerId).toBe('o1');
  });

  it('minimax regret picks higher option', () => {
    const r = runMinimaxRegret(options, criteria, uncertainties, bounds);
    expect(r.winnerId).toBe('o1');
  });
});

describe('seeded simulation', () => {
  it('produces identical results with same seed', () => {
    const options = [{ id: 'o1', name: 'A' }, { id: 'o2', name: 'B' }];
    const criteria = [{ id: 'c1', name: 'X', weight: 100, isPositive: true }];
    const uncertainties = {
      o1_c1: { min: 6, mode: 8, max: 10 },
      o2_c1: { min: 4, mode: 5, max: 7 },
    };
    const a = runSimulation(options, criteria, uncertainties, 200, 'neutral', 42);
    const b = runSimulation(options, criteria, uncertainties, 200, 'neutral', 42);
    expect(a.winningOptionId).toBe(b.winningOptionId);
    expect(a.seed).toBe(42);
    expect(b.seed).toBe(42);
  });
});

describe('createRng', () => {
  it('is deterministic', () => {
    const a = createRng(123);
    const b = createRng(123);
    expect(a()).toBe(b());
  });
});
