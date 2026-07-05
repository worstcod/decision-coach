import { describe, it, expect } from 'vitest';
import { migrateState, SCHEMA_VERSION } from './sessionStorage.js';
import { enrichCriterion } from './criterionTypes.js';

describe('migrateState', () => {
  it('returns null for invalid input', () => {
    expect(migrateState(null)).toBeNull();
    expect(migrateState(undefined)).toBeNull();
  });

  it('passes through v2 state with enriched criteria', () => {
    const raw = {
      schemaVersion: SCHEMA_VERSION,
      step: 5,
      decisionType: 'JOB',
      scenarioId: 'startup_vs_corp',
      criteria: [{ id: 'salary', name: 'Salary', weight: 50 }],
    };
    const migrated = migrateState(raw);
    expect(migrated.step).toBe(5);
    expect(migrated.scenarioId).toBe('startup_vs_corp');
    expect(migrated.criteria[0].measureType).toBeDefined();
  });

  it('bumps legacy steps and forces scenario pick when missing', () => {
    const raw = {
      step: 5,
      decisionType: 'JOB',
      options: [{ id: 'o1', name: 'A' }],
      criteria: [{ id: 'salary', name: 'Salary', weight: 50, measureType: 'salary', isPositive: true }],
    };
    const migrated = migrateState(raw);
    expect(migrated.schemaVersion).toBe(SCHEMA_VERSION);
    expect(migrated.step).toBe(2);
    expect(migrated.scenarioId).toBeNull();
  });

  it('maps legacy results step 7 to 8', () => {
    const raw = {
      step: 7,
      decisionType: 'CUSTOM',
      results: { winningOptionId: 'o1' },
    };
    const migrated = migrateState(raw);
    expect(migrated.step).toBe(8);
  });

  it('enriches legacy criteria without measureType', () => {
    const crit = enrichCriterion({ id: 'x', name: 'Test', weight: 10 });
    expect(crit.measureType).toBeDefined();
  });
});
