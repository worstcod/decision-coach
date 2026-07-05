import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getMeasureMeta } from './criterionTypes';
import {
  getFactorsForDomain,
  getLibraryFactorsGrouped,
  getScenario,
  getFactorById,
  catalogFactorToCriterion,
} from './factorCatalog';
import CustomFactorModal from './CustomFactorModal';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function FactorPicker({
  domainId,
  scenarioId,
  criteria,
  setCriteria,
  onNext,
  onBack,
}) {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [expandedWhy, setExpandedWhy] = useState(null);

  const scenario = scenarioId ? getScenario(domainId, scenarioId) : null;
  const suggestedIds = new Set(scenario?.factorIds || []);
  const selectedCatalogIds = new Set(criteria.filter(c => c.catalogId).map(c => c.catalogId));

  const domainFactors = domainId === 'CUSTOM'
    ? getLibraryFactorsGrouped().flatMap(g => g.factors)
    : getFactorsForDomain(domainId);

  const uniqueDomainFactors = [...new Map(domainFactors.map(f => [f.id, f])).values()];

  const sortedFactors = [...uniqueDomainFactors].sort((a, b) => {
    const aSelected = selectedCatalogIds.has(a.id);
    const bSelected = selectedCatalogIds.has(b.id);
    const aSuggested = suggestedIds.has(a.id);
    const bSuggested = suggestedIds.has(b.id);
    if (aSelected !== bSelected) return aSelected ? -1 : 1;
    if (aSuggested !== bSuggested) return aSuggested ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  const toggleFactor = (factor) => {
    if (selectedCatalogIds.has(factor.id)) {
      setCriteria(criteria.filter(c => c.catalogId !== factor.id));
    } else {
      const existing = criteria.find(c => c.catalogId === factor.id);
      setCriteria([...criteria.filter(c => c.catalogId !== factor.id), catalogFactorToCriterion(factor, existing?.weight)]);
    }
  };

  const customCriteria = criteria.filter(c => !c.catalogId);

  const handleRename = (critId, name) => {
    setCriteria(criteria.map(c => c.id === critId ? { ...c, name } : c));
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-3xl font-bold text-slate-900 mb-2">What matters for this decision?</h2>
      <p className="text-slate-500 mb-4">
        {domainId === 'CUSTOM'
          ? 'Check every factor you want to compare. Start with 2–6 for best results.'
          : scenario
            ? <>Suggested for <strong>{scenario.title}</strong> — uncheck anything that doesn't apply, add more from the library.</>
            : 'Select the factors you want to compare.'}
      </p>

      {scenario && (
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-900">
          <strong>Suggested:</strong> {scenario.factorIds.map(id => getFactorById(id)?.name || id).join(' · ')}
        </div>
      )}

      <div className="space-y-2 mb-6">
        {sortedFactors.map(factor => {
          const selected = selectedCatalogIds.has(factor.id);
          const meta = getMeasureMeta({ measureType: factor.measureType });
          const isSuggested = suggestedIds.has(factor.id);
          return (
            <label
              key={factor.id}
              className={cn(
                'flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all',
                selected ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
              )}
            >
              <div className={cn(
                'mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0',
                selected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
              )}>
                {selected && <Check size={14} strokeWidth={3} />}
              </div>
              <input
                type="checkbox"
                className="sr-only"
                checked={selected}
                onChange={() => toggleFactor(factor)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-900">{factor.name}</span>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{meta.label}</span>
                  {isSuggested && (
                    <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full font-medium">Suggested</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setExpandedWhy(expandedWhy === factor.id ? null : factor.id); }}
                  className="text-xs text-indigo-600 hover:underline mt-1"
                >
                  {expandedWhy === factor.id ? 'Hide why' : 'Why include this?'}
                </button>
                {expandedWhy === factor.id && (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{factor.why}</p>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {customCriteria.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-700 mb-2">Your custom factors</h3>
          <div className="space-y-2">
            {customCriteria.map(crit => {
              const meta = getMeasureMeta(crit);
              return (
                <div key={crit.id} className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <input
                    type="text"
                    value={crit.name}
                    onChange={e => handleRename(crit.id, e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none font-semibold text-slate-900"
                  />
                  <span className="text-xs text-slate-500">{meta.label}</span>
                  <button
                    type="button"
                    onClick={() => setCriteria(criteria.filter(c => c.id !== crit.id))}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-8">
        <button
          type="button"
          onClick={() => setShowCustomModal(true)}
          className="flex items-center text-indigo-600 font-medium hover:text-indigo-800 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl"
        >
          <Plus size={18} className="mr-1.5" /> Add custom factor
        </button>
      </div>

      {criteria.length < 2 && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
          Select at least <strong>2 factors</strong> to compare your options meaningfully.
        </p>
      )}

      <div className="flex justify-between">
        <button onClick={onBack} className="px-6 py-2 text-slate-600 hover:text-slate-900 font-medium">Back</button>
        <button
          onClick={onNext}
          disabled={criteria.length < 2}
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          Next Step
        </button>
      </div>

      {showCustomModal && (
        <CustomFactorModal
          onClose={() => setShowCustomModal(false)}
          onSave={(crit) => setCriteria([...criteria, crit])}
        />
      )}
    </div>
  );
}
