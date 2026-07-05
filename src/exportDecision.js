import { DOMAINS } from './factorCatalog';
import { getScenarioContext } from './factorCatalog';
import { SCHEMA_VERSION } from './sessionStorage';

export function buildExportPayload(state) {
  const scenarioContext = getScenarioContext(state.decisionType, state.scenarioId);
  const domain = DOMAINS[state.decisionType];

  return {
    app: 'Decision Coach',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    decision: {
      domain: domain?.title ?? state.decisionType,
      scenario: scenarioContext?.title ?? null,
      options: (state.options || []).filter(o => o.name?.trim()),
      factors: (state.criteria || []).filter(c => c.name?.trim()).map(c => ({
        id: c.id,
        name: c.name,
        weight: c.weight,
        measureType: c.measureType,
        isPositive: c.isPositive !== false,
      })),
      estimates: state.uncertainties,
      riskProfile: state.riskProfile,
    },
    results: state.results
      ? {
          iterations: state.results.iterations,
          riskUtility: state.results.riskUtility,
          winningOptionId: state.results.winningOptionId,
          options: Object.values(state.results.results).map(o => ({
            name: o.name,
            winProbability: o.winProbability,
            expectedUtility: o.expectedUtility,
            downsideRisk: o.downsideRisk,
            percentiles: o.percentiles,
          })),
          pairwise: state.results.pairwise,
        }
      : null,
    insights: state.insights,
    alternativeMethods: state.alternativeMethods ?? null,
    simulationSeed: state.simulationSeed ?? null,
  };
}

export function downloadDecisionJson(state, filename) {
  const payload = buildExportPayload(state);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (filename || 'decision').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
  a.href = url;
  a.download = `${safeName || 'decision'}-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadInspectorJson(simulationData) {
  const payload = {
    exportedAt: new Date().toISOString(),
    iterations: simulationData.iterations,
    seed: simulationData.seed,
    sampleRuns: simulationData.sampleRuns,
    factorAttribution: simulationData.factorAttribution,
    pairwise: simulationData.pairwise,
    winningOptionId: simulationData.winningOptionId,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `simulation-inspector-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function openPrintableSummary(state) {
  const payload = buildExportPayload(state);
  const winner = payload.results?.options?.sort(
    (a, b) => b.winProbability - a.winProbability
  )[0];

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Decision Coach — ${payload.decision.options.map(o => o.name).join(' vs ')}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 2rem auto; color: #1e293b; line-height: 1.5; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .meta { color: #64748b; font-size: 0.875rem; margin-bottom: 1.5rem; }
    .hero { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem; }
    .hero strong { font-size: 1.25rem; color: #4338ca; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.875rem; }
    th, td { border: 1px solid #e2e8f0; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #f8fafc; }
    .disclaimer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.75rem; color: #64748b; }
    @media print { body { margin: 1rem; } }
  </style>
</head>
<body>
  <h1>Decision Coach — Summary</h1>
  <p class="meta">${payload.decision.domain}${payload.decision.scenario ? ` · ${payload.decision.scenario}` : ''} · Exported ${new Date(payload.exportedAt).toLocaleString()}</p>

  <div class="hero">
    <div>Recommendation</div>
    <strong>${winner?.name ?? '—'}</strong>
    ${winner ? `<div>${Math.round(winner.winProbability * 100)}% win probability · ${payload.results.iterations.toLocaleString()} simulations</div>` : ''}
  </div>

  <h2>Options compared</h2>
  <ul>${payload.decision.options.map(o => `<li>${o.name}</li>`).join('')}</ul>

  <h2>Factors & weights</h2>
  <table>
    <thead><tr><th>Factor</th><th>Weight (pts)</th></tr></thead>
    <tbody>${payload.decision.factors.map(f => `<tr><td>${f.name}</td><td>${f.weight}</td></tr>`).join('')}</tbody>
  </table>

  ${payload.results ? `
  <h2>Results</h2>
  <table>
    <thead><tr><th>Option</th><th>Win %</th><th>Expected utility</th><th>Downside risk</th></tr></thead>
    <tbody>${payload.results.options.map(o => `
      <tr>
        <td>${o.name}</td>
        <td>${Math.round(o.winProbability * 100)}%</td>
        <td>${Math.round(o.expectedUtility * 100)}</td>
        <td>${Math.round(o.downsideRisk * 100)}%</td>
      </tr>`).join('')}</tbody>
  </table>` : ''}

  ${payload.insights?.humanTake ? `<h2>Summary</h2><p>${payload.insights.humanTake}</p>` : ''}

  <p class="disclaimer">
    Decision Coach is a decision support tool, not professional advice. Results reflect your inputs and a simplified model
    (independent factors, compensatory weighting). Combine with your own judgment before acting.
  </p>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) return false;
  win.document.write(html);
  win.document.close();
  return true;
}
