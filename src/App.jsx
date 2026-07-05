import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import Tutorial from './Tutorial';
import FactorPicker from './FactorPicker';
import { collectBiasHints } from './BiasHints';
import OptionsStep from './steps/OptionsStep';
import WeightsStep from './steps/WeightsStep';
import EstimatesStep from './steps/EstimatesStep';
import { saveToHistory, buildSessionSnapshot, loadSession, saveSession, clearSession } from './sessionStorage';
import { importEncryptedFile } from './shareDecision';
import {
  buildCriteriaFromScenario,
  getScenarioContext,
} from './factorCatalog';
import {
  runSimulation,
  generateInsights,
  DEFAULT_ITERATIONS,
  applyMacroScenario,
  runTOPSIS,
  runMinimaxRegret,
  randomSeed,
} from './math-engine';
import {
  enrichCriterion,
  fromStoredUncertainty,
  isEstimateValid,
  buildInitialUncertainties,
  applyCurrencyToCriterion,
} from './criterionTypes';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const ResultsView = lazy(() => import('./ResultsView'));
import WizardHeader from './steps/WizardHeader';
import LandingStep from './steps/LandingStep';
import DomainStep from './steps/DomainStep';
import ScenarioStep from './steps/ScenarioStep';
import SimulatingStep from './steps/SimulatingStep';
import MathDoc from './MathDoc';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const saved = loadSession();
  const [step, setStep] = useState(saved?.step || 0);
  const [showHelp, setShowHelp] = useState(false);
  
  // State
  const [decisionType, setDecisionType] = useState(saved?.decisionType || null);
  const [scenarioId, setScenarioId] = useState(saved?.scenarioId || null);
  const [options, setOptions] = useState(saved?.options || [{ id: 'o1', name: '' }, { id: 'o2', name: '' }]);
  const [criteria, setCriteria] = useState(() => (saved?.criteria || []).map(enrichCriterion));
  const [uncertainties, setUncertainties] = useState(saved?.uncertainties || {}); 
  const [riskProfile, setRiskProfile] = useState(saved?.riskProfile || 'neutral');
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState(saved?.results || null);
  const [insights, setInsights] = useState(saved?.insights || null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [saveNotice, setSaveNotice] = useState(null);
  const [simpleMode, setSimpleMode] = useState(saved?.simpleMode ?? false);
  const [currency, setCurrency] = useState(saved?.currency ?? 'USD');
  const [macroScenario, setMacroScenario] = useState(saved?.macroScenario ?? 'neutral');
  const [simulationSeed, setSimulationSeed] = useState(saved?.simulationSeed ?? null);
  const [alternativeMethods, setAlternativeMethods] = useState(saved?.alternativeMethods ?? null);
  const [pairwiseComparisons, setPairwiseComparisons] = useState({});
  const [showPairwise, setShowPairwise] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showMathDoc, setShowMathDoc] = useState(false);

  // Save state
  useEffect(() => {
    if (step > 0 && !isSimulating) {
      saveSession({
        step, decisionType, scenarioId, options, criteria, uncertainties, riskProfile, results, insights,
        simpleMode, currency, macroScenario, simulationSeed, alternativeMethods,
      });
    }
  }, [step, decisionType, scenarioId, options, criteria, uncertainties, riskProfile, results, insights, isSimulating, simpleMode, currency, macroScenario, simulationSeed, alternativeMethods]);

  useEffect(() => {
    if (step === 6) {
      setUncertainties(prev => seedUncertainties(prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, criteria, options]);

  // Computed
  const totalWeight = criteria.reduce((sum, c) => sum + Number(c.weight || 0), 0);

  const seedUncertainties = (prev) => {
    const validOptions = options.filter(o => o.name.trim());
    const validCriteria = criteria.filter(c => c.name.trim());
    const seeded = buildInitialUncertainties(validOptions, validCriteria);
    const next = { ...seeded };
    validOptions.forEach(opt => {
      validCriteria.forEach(crit => {
        const key = `${opt.id}_${crit.id}`;
        if (prev[key]) {
          const estimates = fromStoredUncertainty(crit, prev[key]);
          if (isEstimateValid(crit, estimates)) {
            next[key] = prev[key];
          }
        }
      });
    });
    return next;
  };

  const handleNext = () => {
    if (step === 5) {
      setUncertainties(prev => seedUncertainties(prev));
    }
    setStep(s => s + 1);
  };

  const handlePrev = () => {
    if (step === 3 && decisionType === 'CUSTOM') {
      setStep(1);
      return;
    }
    setStep(s => s - 1);
  };

  const selectDomain = (domainId) => {
    setDecisionType(domainId);
    setScenarioId(null);
    setUncertainties({});
    setResults(null);
    setInsights(null);
    if (domainId === 'CUSTOM') {
      setCriteria([]);
      setStep(3);
    } else {
      setStep(2);
    }
  };

  const selectScenario = (id) => {
    setScenarioId(id);
    setCriteria(buildCriteriaFromScenario(decisionType, id));
    setUncertainties({});
    setStep(3);
  };

  const scenarioContext = getScenarioContext(decisionType, scenarioId);

  const runAnalysis = () => {
    const validCriteria = criteria.filter(c => c.name.trim());
    const validOptions = options.filter(o => o.name.trim());

    const invalidFields = [];
    validOptions.forEach(opt => {
      validCriteria.forEach(crit => {
        const key = `${opt.id}_${crit.id}`;
        const estimates = fromStoredUncertainty(crit, uncertainties[key]);
        if (!isEstimateValid(crit, estimates)) {
          invalidFields.push(`"${opt.name}" → ${crit.name}`);
        }
      });
    });

    if (invalidFields.length > 0) {
      const example = invalidFields.slice(0, 3).join(', ');
      setValidationError(
        `Fix the highlighted fields (${example}${invalidFields.length > 3 ? ` +${invalidFields.length - 3} more` : ''}). ` +
        `For salary and ratings where higher is better, enter bad → likely → good (small to large). ` +
        `For commute, stress, etc. where lower is better, enter bad → likely → good (large to small).`
      );
      return;
    }

    setValidationError(null);
    setStep(7);
    setIsSimulating(true);

    const safeOptions = options.filter(o => o.name.trim());
    const safeCriteria = criteria
      .filter(c => c.name.trim() && c.weight > 0)
      .map(c => applyCurrencyToCriterion(c, currency));

    const adjustedUncertainties = applyMacroScenario(uncertainties, safeCriteria, macroScenario);
    const seed = simulationSeed ?? randomSeed();
    const simData = runSimulation(safeOptions, safeCriteria, adjustedUncertainties, DEFAULT_ITERATIONS, riskProfile, seed);
    const generatedInsights = generateInsights(simData, safeCriteria);
    const alt = {
      topsis: runTOPSIS(safeOptions, safeCriteria, adjustedUncertainties, simData.criteriaBounds),
      minimaxRegret: runMinimaxRegret(safeOptions, safeCriteria, adjustedUncertainties, simData.criteriaBounds),
    };

    setSimulationSeed(seed);
    setAlternativeMethods(alt);
    setResults({ ...simData, alternativeMethods: alt });
    setInsights(generatedInsights);
    setIsSimulating(false);
    setStep(8);
  };

  const restart = () => {
    if (window.confirm("Start over? This will clear all your data.")) {
      clearSession();
      setStep(0);
      setDecisionType(null);
      setScenarioId(null);
      setOptions([{ id: 'o1', name: '' }, { id: 'o2', name: '' }]);
      setCriteria([]);
      setUncertainties({});
      setRiskProfile('neutral');
      setResults(null);
      setInsights(null);
      setSaveNotice(null);
      setSimpleMode(false);
      setCurrency('USD');
      setMacroScenario('neutral');
      setSimulationSeed(null);
      setAlternativeMethods(null);
      setPairwiseComparisons({});
      setShowPairwise(false);
    }
  };

  const loadSnapshot = (snapshot) => {
    setDecisionType(snapshot.decisionType ?? null);
    setScenarioId(snapshot.scenarioId ?? null);
    setOptions(snapshot.options ?? [{ id: 'o1', name: '' }, { id: 'o2', name: '' }]);
    setCriteria((snapshot.criteria || []).map(enrichCriterion));
    setUncertainties(snapshot.uncertainties ?? {});
    setRiskProfile(snapshot.riskProfile ?? 'neutral');
    setResults(snapshot.results ?? null);
    setInsights(snapshot.insights ?? null);
    setSimpleMode(snapshot.simpleMode ?? false);
    setCurrency(snapshot.currency ?? 'USD');
    setMacroScenario(snapshot.macroScenario ?? 'neutral');
    setSimulationSeed(snapshot.simulationSeed ?? null);
    setAlternativeMethods(snapshot.alternativeMethods ?? null);
    setStep(snapshot.results ? 8 : 1);
    setSaveNotice(null);
  };

  const handleImportFile = () => {
    importEncryptedFile((data) => {
      const opts = data.decision?.options || data.options || [{ id: 'o1', name: '' }, { id: 'o2', name: '' }];
      const crits = (data.decision?.factors || data.criteria || []).map(enrichCriterion);
      loadSnapshot({
        decisionType: data.decision?.domain ? 'CUSTOM' : (data.decisionType || 'CUSTOM'),
        scenarioId: data.scenarioId ?? null,
        options: opts,
        criteria: crits,
        uncertainties: data.decision?.estimates || data.uncertainties || {},
        riskProfile: data.decision?.riskProfile || data.riskProfile || 'neutral',
        results: data.results?.winningOptionId ? data.results : (data.results || null),
        insights: data.insights ?? null,
        simpleMode: false,
        currency: 'USD',
        macroScenario: 'neutral',
        simulationSeed: data.simulationSeed ?? null,
        alternativeMethods: data.alternativeMethods ?? null,
      });
    });
  };

  const handleSaveToHistory = () => {
    const defaultName = options.filter(o => o.name.trim()).map(o => o.name).join(' vs ') || 'My decision';
    const name = window.prompt('Name this decision:', defaultName);
    if (!name?.trim()) return;
    saveToHistory({
      name: name.trim(),
      snapshot: buildSessionSnapshot({
        decisionType, scenarioId, options, criteria, uncertainties, riskProfile, results, insights,
        simpleMode, currency, macroScenario, simulationSeed, alternativeMethods,
      }),
    });
    setSaveNotice('Saved to My past decisions on the home screen.');
  };

  const getExportState = () => ({
    decisionType, scenarioId, options, criteria, uncertainties, riskProfile, results, insights,
    simpleMode, currency, macroScenario, simulationSeed, alternativeMethods,
  });

  // ---------------- Step views (Options/Weights/Estimates remain here; see src/steps/) ---------------- //

  const renderLanding = () => (
    <LandingStep
      onStart={() => setStep(1)}
      onHelp={() => setShowHelp(true)}
      onImport={handleImportFile}
      onLoadHistory={loadSnapshot}
      onMathDoc={() => setShowMathDoc(true)}
    />
  );

  const renderDecisionType = () => <DomainStep onSelect={selectDomain} />;

  const renderScenario = () => (
    <ScenarioStep decisionType={decisionType} onSelect={selectScenario} onBack={handlePrev} />
  );

  const validOptionsForHints = options.filter(o => o.name.trim());
  const validCriteriaForHints = criteria.filter(c => c.name.trim());
  const biasHints = useMemo(
    () => collectBiasHints(validOptionsForHints, validCriteriaForHints, uncertainties),
    [validOptionsForHints, validCriteriaForHints, uncertainties]
  );

  const renderSimulating = () => <SimulatingStep />;

  const renderResults = () => (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[40vh] text-slate-500">Loading results…</div>
    }>
      <ResultsView
        results={results}
        insights={insights}
        uncertainties={uncertainties}
        options={options}
        criteria={criteria}
        riskProfile={riskProfile}
        alternativeMethods={alternativeMethods}
        simulationSeed={simulationSeed}
        saveNotice={saveNotice}
        showCompare={showCompare}
        setShowCompare={setShowCompare}
        onSave={handleSaveToHistory}
        onEdit={() => setStep(6)}
        onRestart={restart}
        getExportState={getExportState}
        onMathDoc={() => setShowMathDoc(true)}
      />
    </Suspense>
  );

  // Main Render
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg">
        Skip to main content
      </a>
      <WizardHeader step={step} decisionType={decisionType} onRestart={restart} />

      {/* Main Content Area */}
      <main id="main-content" className={cn("pt-16 pb-20", step === 0 ? "pt-0" : "")}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && renderLanding()}
            {step === 1 && renderDecisionType()}
            {step === 2 && renderScenario()}
            {step === 3 && (
              <OptionsStep
                options={options}
                setOptions={setOptions}
                scenarioContext={scenarioContext}
                onBack={handlePrev}
                onNext={handleNext}
              />
            )}
            {step === 4 && (
              <FactorPicker
                domainId={decisionType}
                scenarioId={scenarioId}
                criteria={criteria}
                setCriteria={setCriteria}
                onNext={handleNext}
                onBack={handlePrev}
              />
            )}
            {step === 5 && (
              <WeightsStep
                criteria={criteria}
                setCriteria={setCriteria}
                totalWeight={totalWeight}
                showPairwise={showPairwise}
                setShowPairwise={setShowPairwise}
                pairwiseComparisons={pairwiseComparisons}
                setPairwiseComparisons={setPairwiseComparisons}
                onBack={handlePrev}
                onNext={handleNext}
              />
            )}
            {step === 6 && (
              <EstimatesStep
                options={options}
                criteria={criteria}
                uncertainties={uncertainties}
                setUncertainties={setUncertainties}
                simpleMode={simpleMode}
                setSimpleMode={setSimpleMode}
                currency={currency}
                setCurrency={setCurrency}
                macroScenario={macroScenario}
                setMacroScenario={setMacroScenario}
                scenarioContext={scenarioContext}
                validationError={validationError}
                setValidationError={setValidationError}
                biasHints={biasHints}
                showAdvanced={showAdvanced}
                setShowAdvanced={setShowAdvanced}
                riskProfile={riskProfile}
                setRiskProfile={setRiskProfile}
                onBack={handlePrev}
                onRunAnalysis={runAnalysis}
              />
            )}
            {step === 7 && renderSimulating()}
            {step === 8 && renderResults()}
          </motion.div>
        </AnimatePresence>
      </main>

      {showHelp && <Tutorial onClose={() => setShowHelp(false)} />}
      {showMathDoc && <MathDoc onClose={() => setShowMathDoc(false)} />}
    </div>
  );
}
