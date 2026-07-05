import { describe, it, expect } from 'vitest';
import {
  enrichCriterion,
  toStoredUncertainty,
  fromStoredUncertainty,
  isEstimateValid,
  getDefaultEstimates,
  buildInitialUncertainties,
} from './criterionTypes.js';

describe('criterionTypes', () => {
  const salaryCrit = enrichCriterion({ id: 'c1', name: 'Salary', measureType: 'salary', isPositive: true });
  const commuteCrit = enrichCriterion({ id: 'c2', name: 'Commute', measureType: 'minutes', isPositive: false });

  it('enriches criterion with measure metadata', () => {
    expect(salaryCrit.unit).toBe('$/yr');
    expect(salaryCrit.measureType).toBe('salary');
  });

  it('validates higher-is-better estimates', () => {
    expect(isEstimateValid(salaryCrit, { pessimistic: 70000, likely: 90000, optimistic: 120000 })).toBe(true);
    expect(isEstimateValid(salaryCrit, { pessimistic: 90000, likely: 70000, optimistic: 120000 })).toBe(false);
  });

  it('validates lower-is-better estimates', () => {
    expect(isEstimateValid(commuteCrit, { pessimistic: 60, likely: 35, optimistic: 15 })).toBe(true);
    expect(isEstimateValid(commuteCrit, { pessimistic: 15, likely: 35, optimistic: 60 })).toBe(false);
  });

  it('round-trips stored uncertainty', () => {
    const stored = toStoredUncertainty(salaryCrit, { pessimistic: 70000, likely: 90000, optimistic: 120000 });
    expect(fromStoredUncertainty(salaryCrit, stored)).toEqual({
      pessimistic: 70000,
      likely: 90000,
      optimistic: 120000,
    });
  });

  it('provides salary-scale defaults', () => {
    const defaults = getDefaultEstimates(salaryCrit);
    expect(defaults.likely).toBeGreaterThan(50000);
    expect(defaults.pessimistic).toBeLessThan(defaults.likely);
    expect(defaults.likely).toBeLessThan(defaults.optimistic);
  });

  it('orders cost defaults high→low for lower-is-better factors', () => {
    const costCrit = enrichCriterion({
      id: 'c1',
      name: 'Upfront Cost',
      measureType: 'dollars',
      isPositive: false,
    });
    const defaults = getDefaultEstimates(costCrit);
    expect(isEstimateValid(costCrit, defaults)).toBe(true);
    expect(defaults.pessimistic).toBeGreaterThan(defaults.optimistic);
  });

  it('orders stress defaults high→low for lower-is-better rating', () => {
    const stressCrit = enrichCriterion({
      id: 'c1',
      name: 'Stress',
      measureType: 'score10',
      isPositive: false,
    });
    const defaults = getDefaultEstimates(stressCrit);
    expect(isEstimateValid(stressCrit, defaults)).toBe(true);
    expect(defaults.pessimistic).toBeGreaterThanOrEqual(defaults.likely);
    expect(defaults.likely).toBeGreaterThanOrEqual(defaults.optimistic);
  });

  it('builds valid initial uncertainties for cost factors', () => {
    const costCrit = enrichCriterion({
      id: 'c_upfront_cost',
      catalogId: 'upfront_cost',
      name: 'Upfront Cost',
      measureType: 'dollars',
      isPositive: false,
      weight: 15,
    });
    const options = [{ id: 'o1', name: 'A' }, { id: 'o2', name: 'B' }];
    const result = buildInitialUncertainties(options, [costCrit]);
    expect(isEstimateValid(costCrit, fromStoredUncertainty(costCrit, result.o1_c_upfront_cost))).toBe(true);
  });
});
