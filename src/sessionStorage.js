import { enrichCriterion } from './criterionTypes';

export const SCHEMA_VERSION = 3;
export const SESSION_KEY = 'decisionCoachState';
export const HISTORY_KEY = 'decisionCoachHistory';
export const MAX_HISTORY = 20;

/** Map legacy wizard steps (v1) to current step numbers after scenario + factor steps were added. */
function migrateStep(step, decisionType, scenarioId) {
  if (step == null || step <= 1) return step ?? 0;
  let next = step + 1;
  if (decisionType && decisionType !== 'CUSTOM' && !scenarioId && next > 2) {
    next = 2;
  }
  return Math.min(next, 8);
}

export function migrateState(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const version = raw.schemaVersion ?? 1;
  if (version >= SCHEMA_VERSION) {
    return {
      ...raw,
      criteria: (raw.criteria || []).map(enrichCriterion),
      simpleMode: raw.simpleMode ?? false,
      currency: raw.currency ?? 'USD',
      macroScenario: raw.macroScenario ?? 'neutral',
      simulationSeed: raw.simulationSeed ?? null,
      alternativeMethods: raw.alternativeMethods ?? null,
    };
  }

  if (version === 2) {
    return {
      ...raw,
      schemaVersion: SCHEMA_VERSION,
      criteria: (raw.criteria || []).map(enrichCriterion),
      simpleMode: false,
      currency: 'USD',
      macroScenario: 'neutral',
      simulationSeed: null,
      alternativeMethods: null,
    };
  }

  const decisionType = raw.decisionType ?? null;
  const scenarioId = raw.scenarioId ?? null;

  return {
    schemaVersion: SCHEMA_VERSION,
    step: migrateStep(raw.step, decisionType, scenarioId),
    decisionType,
    scenarioId,
    options: raw.options ?? [{ id: 'o1', name: '' }, { id: 'o2', name: '' }],
    criteria: (raw.criteria || []).map(enrichCriterion),
    uncertainties: raw.uncertainties ?? {},
    riskProfile: raw.riskProfile ?? 'neutral',
    results: raw.results ?? null,
    insights: raw.insights ?? null,
    simpleMode: false,
    currency: 'USD',
    macroScenario: 'neutral',
    simulationSeed: null,
    alternativeMethods: null,
  };
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return migrateState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveSession(state) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ ...state, schemaVersion: SCHEMA_VERSION })
  );
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveToHistory(entry) {
  const history = loadHistory();
  const next = [
    {
      id: entry.id || `dec_${Date.now()}`,
      name: entry.name,
      savedAt: entry.savedAt || new Date().toISOString(),
      snapshot: entry.snapshot,
    },
    ...history.filter(h => h.id !== entry.id),
  ].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function deleteFromHistory(id) {
  const next = loadHistory().filter(h => h.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function buildSessionSnapshot(state) {
  return {
    schemaVersion: SCHEMA_VERSION,
    decisionType: state.decisionType,
    scenarioId: state.scenarioId,
    options: state.options,
    criteria: state.criteria,
    uncertainties: state.uncertainties,
    riskProfile: state.riskProfile,
    results: state.results,
    insights: state.insights,
    simpleMode: state.simpleMode ?? false,
    currency: state.currency ?? 'USD',
    macroScenario: state.macroScenario ?? 'neutral',
    simulationSeed: state.simulationSeed ?? null,
    alternativeMethods: state.alternativeMethods ?? null,
  };
}
