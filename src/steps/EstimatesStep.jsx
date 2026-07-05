import { useMemo } from 'react';
import { Brain, AlertTriangle, Copy } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import InfoTooltip from '../InfoTooltip';
import BiasHints from '../BiasHints';
import MacroScenarioPicker from '../MacroScenarioPicker';
import {
  fromStoredUncertainty,
  toStoredUncertainty,
  getMeasureMeta,
  getScenarioLabels,
  isEstimateValid,
  CURRENCY_OPTIONS,
  applySimpleModeToCriterion,
  toSimpleModeUncertainty,
} from '../criterionTypes';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function EstimatesStep({
  options,
  criteria,
  uncertainties,
  setUncertainties,
  simpleMode,
  setSimpleMode,
  currency,
  setCurrency,
  macroScenario,
  setMacroScenario,
  scenarioContext,
  validationError,
  setValidationError,
  biasHints,
  showAdvanced,
  setShowAdvanced,
  riskProfile,
  setRiskProfile,
  onBack,
  onRunAnalysis,
}) {
  const validOptions = useMemo(() => options.filter(o => o.name.trim()), [options]);
  const validCriteria = useMemo(() => criteria.filter(c => c.name.trim()), [criteria]);
  const displayCriteria = simpleMode
    ? validCriteria.map(c => applySimpleModeToCriterion(c))
    : validCriteria;

  const copyFromFirstOption = (targetOptId) => {
    if (validOptions.length < 2) return;
    const sourceId = validOptions[0].id;
    setUncertainties(prev => {
      const next = { ...prev };
      validCriteria.forEach(crit => {
        const sourceKey = `${sourceId}_${crit.id}`;
        if (prev[sourceKey]) {
          next[`${targetOptId}_${crit.id}`] = { ...prev[sourceKey] };
        }
      });
      return next;
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-3xl font-bold text-slate-900 mb-2">Estimate each option</h2>
      <p className="text-slate-500 mb-4">
        {simpleMode
          ? 'Simple mode: rate each factor 1–10 for every option. Ranges are inferred automatically.'
          : 'For every option, enter three estimates per factor: a bad scenario, what\'s most likely, and a good scenario.'}
      </p>

      <div className="flex flex-wrap gap-4 mb-6">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-xl">
          <input
            type="checkbox"
            checked={simpleMode}
            onChange={e => setSimpleMode(e.target.checked)}
            className="rounded text-indigo-600"
            aria-label="Simple mode (1–10 only)"
          />
          Simple mode (1–10 only)
        </label>
        {!simpleMode && (
          <label className="flex items-center gap-2 text-sm text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-xl">
            Currency
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="border-none outline-none bg-transparent font-medium"
              aria-label="Currency"
            >
              {CURRENCY_OPTIONS.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <MacroScenarioPicker value={macroScenario} onChange={setMacroScenario} />
      <BiasHints hints={biasHints} />

      <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-900">
        {scenarioContext.estimateHint || 'Enter three estimates per factor: bad scenario, most likely, and good scenario.'}
      </div>

      {validationError && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm" role="alert">
          <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" aria-hidden />
          <p>{validationError}</p>
        </div>
      )}

      <div className="space-y-12">
        {validOptions.map((opt, optIdx) => (
          <div key={opt.id} className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h3 className="text-2xl font-bold text-indigo-900 flex items-center">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm mr-3" aria-hidden>{optIdx + 1}</span>
                {opt.name}
              </h3>
              {optIdx > 0 && (
                <button
                  type="button"
                  onClick={() => copyFromFirstOption(opt.id)}
                  className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg hover:shadow-sm transition-all"
                >
                  <Copy size={14} className="mr-1.5" aria-hidden /> Copy from {validOptions[0].name}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayCriteria.map(crit => {
                const key = `${opt.id}_${crit.id}`;
                const meta = getMeasureMeta(crit);
                const labels = getScenarioLabels(crit);
                const stored = uncertainties[key];
                const estimates = fromStoredUncertainty(crit, stored);
                const invalid = !isEstimateValid(crit, estimates);

                const updateEstimate = (field, val) => {
                  const next = { ...estimates, [field]: Number(val) };
                  if (simpleMode && field === 'likely') {
                    setUncertainties(prev => ({
                      ...prev,
                      [key]: toSimpleModeUncertainty(crit, Number(val)),
                    }));
                  } else {
                    setUncertainties(prev => ({
                      ...prev,
                      [key]: toStoredUncertainty(crit, next),
                    }));
                  }
                  setValidationError(null);
                };

                if (simpleMode) {
                  return (
                    <div key={crit.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                      <div className="font-semibold text-slate-800 mb-3">{crit.name}</div>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={estimates.likely}
                          onChange={e => updateEstimate('likely', e.target.value)}
                          className="flex-1 accent-indigo-600"
                          aria-label={`${crit.name} rating for ${opt.name}`}
                        />
                        <span className="text-2xl font-bold text-indigo-700 w-10 text-center" aria-hidden>{estimates.likely}</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={crit.id}
                    className={cn(
                      'bg-white p-5 rounded-2xl shadow-sm border relative overflow-hidden',
                      invalid ? 'border-red-300 ring-1 ring-red-200' : 'border-slate-100'
                    )}
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400" aria-hidden />
                    <div className="font-semibold text-slate-800 mb-1 ml-2">{crit.name}</div>
                    <p className="text-xs text-slate-500 ml-2 mb-1">{meta.label} · {meta.hint}</p>
                    <p className="text-xs text-indigo-600 ml-2 mb-3">{labels.orderHint}</p>

                    <div className="space-y-3 ml-2">
                      {(['pessimistic', 'likely', 'optimistic']).map((field) => {
                        const isLikely = field === 'likely';
                        const label = labels[field];
                        return (
                          <div key={field} className="flex items-center justify-between text-sm gap-2">
                            <label
                              htmlFor={`${key}-${field}`}
                              className={cn('flex-1', isLikely ? 'text-slate-800 font-medium' : 'text-slate-500')}
                            >
                              {label}
                            </label>
                            <div className="flex items-center gap-2 shrink-0">
                              <input
                                id={`${key}-${field}`}
                                type="number"
                                value={estimates[field]}
                                placeholder={meta.placeholders[field]}
                                onChange={e => updateEstimate(field, e.target.value)}
                                className={cn(
                                  'w-28 px-3 py-1.5 border rounded-lg text-right focus:ring-2 outline-none tabular-nums',
                                  invalid ? 'border-red-300 bg-red-50 focus:ring-red-400' :
                                  isLikely ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium focus:ring-indigo-500' :
                                  'bg-slate-50 border-slate-200 focus:ring-indigo-500'
                                )}
                                aria-label={`${crit.name} ${label} for ${opt.name}`}
                              />
                              <span className="text-slate-400 text-xs w-10 text-right">{meta.unit}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
          aria-expanded={showAdvanced}
        >
          {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings (Risk Profiles)'}
        </button>

        {showAdvanced && (
          <div className="mt-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
            <div>
              <h4 className="font-bold text-slate-900 mb-1 flex items-center">
                Your Risk Tolerance
                <InfoTooltip>
                  <strong>Risk-Averse:</strong> Mathematically penalizes options that have bad worst-case scenarios.<br /><br />
                  <strong>Neutral:</strong> Looks purely at the average mathematical outcome.<br /><br />
                  <strong>Risk-Seeking:</strong> Heavily rewards options with massive best-case potential, ignoring the downside.
                </InfoTooltip>
              </h4>
              <p className="text-sm text-slate-500">How do you feel about taking chances for a higher payoff?</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl" role="group" aria-label="Risk tolerance">
              {['risk-averse', 'neutral', 'risk-seeking'].map(prof => (
                <button
                  key={prof}
                  type="button"
                  onClick={() => setRiskProfile(prof)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all',
                    riskProfile === prof ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  )}
                  aria-pressed={riskProfile === prof}
                >
                  {prof.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <button type="button" onClick={onBack} className="px-6 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors">Back</button>
        <button
          type="button"
          onClick={onRunAnalysis}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-blue-700 shadow-md hover:shadow-lg transition-all flex items-center"
        >
          <Brain className="mr-2" size={20} aria-hidden /> Analyze Decision
        </button>
      </div>
    </div>
  );
}
