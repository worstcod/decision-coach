import { describe, it, expect } from 'vitest';
import {
  getScenariosForDomain,
  getScenario,
  buildCriteriaFromScenario,
  getFactorsForDomain,
  getScenarioContext,
  getProgressStep,
} from './factorCatalog';

describe('factorCatalog', () => {
  it('provides scenarios per guided domain', () => {
    expect(getScenariosForDomain('JOB').length).toBeGreaterThanOrEqual(5);
    expect(getScenariosForDomain('FINANCE').length).toBeGreaterThanOrEqual(5);
    expect(getScenariosForDomain('LIFE').length).toBeGreaterThanOrEqual(5);
    expect(getScenariosForDomain('CUSTOM')).toHaveLength(0);
  });

  it('builds criteria from a scenario with stable ids', () => {
    const criteria = buildCriteriaFromScenario('JOB', 'job_startup_vs_stable');
    expect(criteria.length).toBe(5);
    expect(criteria.some(c => c.catalogId === 'salary')).toBe(true);
    expect(criteria.find(c => c.catalogId === 'salary')?.id).toBe('c_salary');
  });

  it('returns domain factor library including universal factors', () => {
    const jobFactors = getFactorsForDomain('JOB');
    expect(jobFactors.some(f => f.id === 'salary')).toBe(true);
    expect(jobFactors.some(f => f.id === 'happiness')).toBe(true);
  });

  it('returns scenario-specific estimate hints', () => {
    const ctx = getScenarioContext('JOB', 'job_compare_offers');
    expect(ctx.estimateHint).toContain('90000');
    expect(ctx.optionPlaceholders).toHaveLength(2);
  });

  it('adjusts progress for custom domain skipping scenario step', () => {
    expect(getProgressStep(3, 'CUSTOM')).toBe(2);
    expect(getProgressStep(4, 'JOB')).toBe(4);
  });
});
