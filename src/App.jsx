import React, { useState, useEffect, useMemo } from 'react';
import { Brain, ArrowRight, Plus, Trash2, RotateCcw, AlertTriangle, TrendingUp, ShieldAlert, Edit2, HelpCircle, X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { PRESETS } from './presets';
import Tutorial from './Tutorial';
import { runSimulation, generateInsights } from './math-engine';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, CartesianGrid, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const loadState = () => {
  try {
    const s = localStorage.getItem('decisionCoachState');
    if (s) return JSON.parse(s);
  } catch (e) {}
  return null;
};

const InfoTooltip = ({ children }) => (
  <div className="group relative inline-flex items-center justify-center ml-2 align-middle">
    <div className="text-slate-400 hover:text-indigo-500 cursor-help transition-colors">
      <HelpCircle size={14} />
    </div>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-xs font-normal rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl pointer-events-none text-left leading-relaxed">
      {children}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
    </div>
  </div>
);

export default function App() {
  const saved = loadState();
  const [step, setStep] = useState(saved?.step || 0);
  const [showHelp, setShowHelp] = useState(false);
  
  // State
  const [decisionType, setDecisionType] = useState(saved?.decisionType || null);
  const [options, setOptions] = useState(saved?.options || [{ id: 'o1', name: '' }, { id: 'o2', name: '' }]);
  const [criteria, setCriteria] = useState(saved?.criteria || []);
  const [uncertainties, setUncertainties] = useState(saved?.uncertainties || {}); 
  const [riskProfile, setRiskProfile] = useState(saved?.riskProfile || 'neutral');
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState(saved?.results || null);
  const [insights, setInsights] = useState(saved?.insights || null);

  // Save state
  useEffect(() => {
    if (step > 0 && !isSimulating) {
      localStorage.setItem('decisionCoachState', JSON.stringify({
        step, decisionType, options, criteria, uncertainties, riskProfile, results, insights
      }));
    }
  }, [step, decisionType, options, criteria, uncertainties, riskProfile, results, insights, isSimulating]);

  // Computed
  const totalWeight = criteria.reduce((sum, c) => sum + Number(c.weight || 0), 0);

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const startDecision = (presetKey) => {
    setDecisionType(presetKey);
    setCriteria(PRESETS[presetKey].criteria.map(c => ({
      ...c, 
      isPositive: c.isPositive !== false,
      unit: c.unit || '/100'
    })));
    setStep(2);
  };

  const runAnalysis = () => {
    const validCriteria = criteria.filter(c => c.name.trim());
    const validOptions = options.filter(o => o.name.trim());
    
    let hasError = false;
    validOptions.forEach(opt => {
      validCriteria.forEach(crit => {
        const key = `${opt.id}_${crit.id}`;
        const vals = uncertainties[key] || { min: 0, mode: 50, max: 100 };
        if (vals.min > vals.max || vals.mode < vals.min || vals.mode > vals.max) {
          hasError = true;
        }
      });
    });

    if (hasError) {
      alert("Please fix the invalid ranges highlighted in red. Ensure Worst <= Likely <= Best.");
      return;
    }

    setStep(6);
    setIsSimulating(true);
    
    setTimeout(() => {
      const safeOptions = options.filter(o => o.name.trim());
      const safeCriteria = criteria.filter(c => c.name.trim() && c.weight > 0);
      
      const simData = runSimulation(safeOptions, safeCriteria, uncertainties, 2000, riskProfile);
      const generatedInsights = generateInsights(simData, safeCriteria);
      
      setResults(simData);
      setInsights(generatedInsights);
      setIsSimulating(false);
      setStep(7);
    }, 1500);
  };

  const restart = () => {
    if (window.confirm("Start over? This will clear all your data.")) {
      localStorage.removeItem('decisionCoachState');
      setStep(0);
      setDecisionType(null);
      setOptions([{ id: 'o1', name: '' }, { id: 'o2', name: '' }]);
      setCriteria([]);
      setUncertainties({});
      setRiskProfile('neutral');
      setResults(null);
      setInsights(null);
    }
  };

  // ---------------- Renderers ---------------- //

  const renderLanding = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-full">
        <ShieldAlert size={16} /> No login required
      </div>
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
        Stop Overthinking.<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Decide with Clarity.</span>
      </h1>
      <p className="text-xl text-slate-600 mb-10 max-w-2xl">
        A smart decision coach that uses probability and simulation to help you make better, statistically sound choices in seconds.
      </p>
      <div className="flex flex-col items-center gap-6">
        <button 
          onClick={() => setStep(1)}
          className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-indigo-600 font-pj rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 shadow-lg hover:shadow-xl"
        >
          Start Decision <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </button>
        <button 
          onClick={() => setShowHelp(true)}
          className="inline-flex items-center text-slate-500 hover:text-indigo-600 font-medium transition-colors bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200 hover:shadow-md"
        >
          <HelpCircle size={20} className="mr-2" /> How to use this app?
        </button>
      </div>
    </div>
  );

  const renderDecisionType = () => (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900">What kind of decision are you making?</h2>
        <p className="text-slate-500 mt-2">Select a template to preload common factors, or start from scratch.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(PRESETS).map(([key, preset]) => (
          <button 
            key={key}
            onClick={() => startDecision(key)}
            className="flex items-start p-6 text-left transition-all bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:shadow-lg group"
          >
            <div className="text-4xl mr-4 group-hover:scale-110 transition-transform">{preset.icon}</div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{preset.title}</h3>
              <p className="text-slate-500">{preset.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderOptions = () => (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-3xl font-bold text-slate-900 mb-2">What are your options?</h2>
      <p className="text-slate-500 mb-8">Enter the choices you are considering (2 to 5 options).</p>
      
      <div className="space-y-4">
        {options.map((opt, idx) => (
          <div key={opt.id} className="flex items-center gap-3">
            <div className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
              <input 
                type="text" 
                value={opt.name}
                onChange={e => {
                  const newOps = [...options];
                  newOps[idx].name = e.target.value;
                  setOptions(newOps);
                }}
                placeholder={`Option ${idx + 1} (e.g., Startup, MNC)`}
                className="w-full bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400"
                autoFocus={idx === 0}
              />
            </div>
            {options.length > 2 && (
              <button 
                onClick={() => setOptions(options.filter(o => o.id !== opt.id))}
                className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        ))}
      </div>

      {options.length < 5 && (
        <button 
          onClick={() => setOptions([...options, { id: `o${Date.now()}`, name: '' }])}
          className="mt-4 flex items-center text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
        >
          <Plus size={20} className="mr-1" /> Add Option
        </button>
      )}

      <div className="mt-12 flex justify-between">
        <button onClick={handlePrev} className="px-6 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors">Back</button>
        <button 
          onClick={handleNext} 
          disabled={options.filter(o => o.name.trim()).length < 2}
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
        >
          Next Step
        </button>
      </div>
    </div>
  );

  const renderCriteria = () => (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-3xl font-bold text-slate-900 mb-2">What factors matter?</h2>
      <p className="text-slate-500 mb-8">
        Define the criteria you will use to evaluate your options.
        <InfoTooltip>
          <strong>Factors (Criteria)</strong> are the dimensions you care about. Ensure you correctly toggle whether a high score is good (e.g. Salary) or bad (e.g. Commute Time) so the math engine rewards the right outcome.
        </InfoTooltip>
      </p>

      <div className="space-y-4">
        {criteria.map((crit, idx) => (
          <div key={crit.id} className="flex items-center gap-3">
            <div className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all flex flex-col sm:flex-row sm:items-center gap-2">
              <input 
                type="text" 
                value={crit.name}
                onChange={e => {
                  const newC = [...criteria];
                  newC[idx].name = e.target.value;
                  setCriteria(newC);
                }}
                placeholder={`Factor ${idx + 1}`}
                className="flex-[2] bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 py-1 min-w-[120px]"
              />
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2">
                <span className="text-xs text-slate-400 mr-1">Unit:</span>
                <input 
                  type="text"
                  value={crit.unit || ''}
                  onChange={e => {
                    const newC = [...criteria];
                    newC[idx].unit = e.target.value;
                    setCriteria(newC);
                  }}
                  placeholder="/10, $, etc."
                  className="w-16 bg-transparent border-none outline-none text-xs text-slate-700 py-1.5"
                />
              </div>
              <button
                onClick={() => {
                  const newC = [...criteria];
                  newC[idx].isPositive = !(crit.isPositive !== false);
                  setCriteria(newC);
                }}
                className={cn(
                  "flex items-center text-xs px-2 py-1.5 rounded-lg border transition-colors whitespace-nowrap",
                  crit.isPositive !== false 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                    : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                )}
                title="Toggle if a higher score is better or worse for this factor"
              >
                {crit.isPositive !== false ? <><ArrowUpCircle size={14} className="mr-1"/> Higher is Better</> : <><ArrowDownCircle size={14} className="mr-1"/> Lower is Better</>}
              </button>
            </div>
            {criteria.length > 1 && (
              <button 
                onClick={() => setCriteria(criteria.filter(c => c.id !== crit.id))}
                className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button 
        onClick={() => setCriteria([...criteria, { id: `c${Date.now()}`, name: '', weight: 10, isPositive: true, unit: '/100' }])}
        className="mt-4 flex items-center text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
      >
        <Plus size={20} className="mr-1" /> Add Custom Factor
      </button>

      <div className="mt-12 flex justify-between">
        <button onClick={handlePrev} className="px-6 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors">Back</button>
        <button 
          onClick={handleNext} 
          disabled={criteria.filter(c => c.name.trim()).length < 1}
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
        >
          Next Step
        </button>
      </div>
    </div>
  );

  const renderWeights = () => (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-3xl font-bold text-slate-900 mb-2">How important is each factor?</h2>
      <p className="text-slate-500 mb-6">
        Assign relative importance to each factor. The numbers will be automatically normalized into percentages.
        <InfoTooltip>
          <strong>Weights</strong> determine how much influence a factor has on the final decision. Because they are normalized, giving two factors "10" and "10" is mathematically identical to giving them "50" and "50".
        </InfoTooltip>
      </p>

      <div className="mb-8 p-4 rounded-xl flex items-center justify-between border shadow-sm transition-colors duration-300 bg-white">
        <div className="font-medium text-slate-700">Total Raw Points:</div>
        <div className="text-2xl font-bold text-indigo-600">
          {totalWeight}
        </div>
      </div>

      <div className="space-y-6">
        {criteria.map((crit, idx) => (
          <div key={crit.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between mb-3">
              <label className="font-semibold text-slate-900">{crit.name || `Factor ${idx + 1}`}</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">{totalWeight > 0 ? Math.round((crit.weight / totalWeight) * 100) : 0}% weight</span>
                <span className="text-indigo-600 font-mono font-bold bg-indigo-50 px-2 py-0.5 rounded-md">{crit.weight} pts</span>
              </div>
            </div>
            <input 
              type="range" 
              min="0" max="100" 
              value={crit.weight}
              onChange={e => {
                const newC = [...criteria];
                newC[idx].weight = Number(e.target.value);
                setCriteria(newC);
              }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-300" 
                style={{ width: `${totalWeight > 0 ? (crit.weight / totalWeight) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button 
          onClick={() => {
            const eqWeight = Math.floor(100 / criteria.length);
            const remainder = 100 % criteria.length;
            setCriteria(criteria.map((c, i) => ({
              ...c,
              weight: eqWeight + (i === 0 ? remainder : 0)
            })));
          }}
          className="flex items-center text-sm text-slate-500 hover:text-slate-900 font-medium"
        >
          <RotateCcw size={16} className="mr-1" /> Auto-balance
        </button>
      </div>

      <div className="mt-12 flex justify-between">
        <button onClick={handlePrev} className="px-6 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors">Back</button>
        <button 
          onClick={handleNext} 
          disabled={totalWeight === 0}
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
        >
          Next Step
        </button>
      </div>
    </div>
  );

  const renderUncertainty = () => {
    const validOptions = options.filter(o => o.name.trim());
    const validCriteria = criteria.filter(c => c.name.trim());

    return (
      <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Estimate possible outcomes</h2>
        <p className="text-slate-500 mb-8">
          For each factor, estimate the <span className="font-semibold">worst case</span>, <span className="font-semibold">most likely</span>, and <span className="font-semibold">best case</span> scenario.
          <InfoTooltip>
            <strong>Why three numbers?</strong> Real life is uncertain. By giving a range, the Monte Carlo engine can simulate thousands of possible futures (good and bad) rather than just assuming an "average" outcome every time. This helps protect you against downside risk.
          </InfoTooltip>
        </p>

        <div className="space-y-12">
          {validOptions.map(opt => (
            <div key={opt.id} className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200">
              <h3 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm mr-3">✓</span>
                {opt.name}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {validCriteria.map(crit => {
                  const key = `${opt.id}_${crit.id}`;
                  const vals = uncertainties[key] || { min: 0, mode: 50, max: 100 };

                  const updateVal = (field, val) => {
                    setUncertainties(prev => ({
                      ...prev,
                      [key]: { ...vals, [field]: Number(val) }
                    }));
                  };

                  return (
                    <div key={crit.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400" />
                      <div className="font-semibold text-slate-800 mb-1 ml-2 flex items-center justify-between">
                        <span>{crit.name}</span>
                        {crit.isPositive === false && <span className="text-[10px] uppercase font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Lower = Better</span>}
                      </div>
                      
                      <div className="space-y-4 ml-2 mt-4">
                        <div className="flex items-center justify-between text-sm">
                          <label className="text-slate-500 w-20">Worst</label>
                          <div className="flex items-center gap-2">
                            <input type="number" value={vals.min} onChange={e => updateVal('min', e.target.value)} className={cn("w-24 px-3 py-1 bg-slate-50 border rounded-lg text-right focus:ring-2 outline-none", vals.min > vals.max || vals.min > vals.mode ? "border-red-400 text-red-600 focus:ring-red-500 bg-red-50" : "border-slate-200 focus:ring-indigo-500")} />
                            <span className="text-slate-400 w-8 text-xs">{crit.unit}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <label className="text-slate-700 font-medium w-20">Likely</label>
                          <div className="flex items-center gap-2">
                            <input type="number" value={vals.mode} onChange={e => updateVal('mode', e.target.value)} className={cn("w-24 px-3 py-1 bg-indigo-50 border font-medium rounded-lg text-right focus:ring-2 outline-none", vals.mode < vals.min || vals.mode > vals.max ? "border-red-400 text-red-600 focus:ring-red-500 bg-red-50" : "border-indigo-200 text-indigo-700 focus:ring-indigo-500")} />
                            <span className="text-slate-400 w-8 text-xs">{crit.unit}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <label className="text-slate-500 w-20">Best</label>
                          <div className="flex items-center gap-2">
                            <input type="number" value={vals.max} onChange={e => updateVal('max', e.target.value)} className={cn("w-24 px-3 py-1 bg-slate-50 border rounded-lg text-right focus:ring-2 outline-none", vals.max < vals.min || vals.max < vals.mode ? "border-red-400 text-red-600 focus:ring-red-500 bg-red-50" : "border-slate-200 focus:ring-indigo-500")} />
                            <span className="text-slate-400 w-8 text-xs">{crit.unit}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-900 mb-1 flex items-center">
              Your Risk Tolerance
              <InfoTooltip>
                <strong>Risk-Averse:</strong> Mathematically penalizes options that have bad worst-case scenarios.<br/><br/>
                <strong>Neutral:</strong> Looks purely at the average mathematical outcome.<br/><br/>
                <strong>Risk-Seeking:</strong> Heavily rewards options with massive best-case potential, ignoring the downside.
              </InfoTooltip>
            </h4>
            <p className="text-sm text-slate-500">How do you feel about taking chances for a higher payoff?</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['risk-averse', 'neutral', 'risk-seeking'].map(prof => (
              <button
                key={prof}
                onClick={() => setRiskProfile(prof)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all",
                  riskProfile === prof ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                {prof.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button onClick={handlePrev} className="px-6 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors">Back</button>
          <button 
            onClick={runAnalysis} 
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-blue-700 shadow-md hover:shadow-lg transition-all flex items-center"
          >
            <Brain className="mr-2" size={20} /> Analyze Decision
          </button>
        </div>
      </div>
    );
  };

  const renderSimulating = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full mb-8"
      />
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Simulating possible futures...</h2>
      <p className="text-slate-500">Running thousands of Monte Carlo scenarios</p>
    </div>
  );

  const renderResults = () => {
    if (!results || !insights) return null;

    const winner = results.results[results.winningOptionId];
    const chartData = Object.values(results.results).map(opt => ({
      name: opt.name,
      WinProb: Math.round(opt.winProbability * 100)
    }));

    // Data for Factor Comparison (Radar Chart)
    const radarData = results.normalizedCriteria.map(crit => {
      const dataPoint = { subject: crit.name };
      Object.values(results.results).forEach(opt => {
        const input = uncertainties[`${opt.id}_${crit.id}`] || { mode: 0 };
        const bounds = results.criteriaBounds[crit.id];
        let normalized = 0;
        if (bounds && bounds.max > bounds.min) {
          normalized = (input.mode - bounds.min) / (bounds.max - bounds.min);
          if (crit.isPositive === false) {
            normalized = 1 - normalized;
          }
        } else {
          normalized = 1;
        }
        dataPoint[opt.name] = Math.round(normalized * 100);
      });
      return dataPoint;
    });
    
    const riskData = Object.values(results.results).map(opt => ({
      name: opt.name,
      'Downside Risk %': Math.round(opt.downsideRisk * 100),
      'Upside Potential %': Math.round((opt.scores.filter(s => s > opt.mean + opt.stdDev).length / results.iterations) * 100)
    }));
    
    const optionColors = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

    // Data for histogram of the winner
    const histBins = 20;
    const scores = winner.scores;
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const binSize = (maxScore - minScore) / histBins;
    
    const histData = Array.from({length: histBins}, (_, i) => {
      const binMin = minScore + i * binSize;
      const binMax = binMin + binSize;
      const count = scores.filter(s => s >= binMin && s < binMax).length;
      return {
        bin: Math.round(binMin + binSize/2),
        count
      };
    });

    const confidenceColors = {
      High: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Medium: 'bg-amber-100 text-amber-800 border-amber-200',
      Low: 'bg-rose-100 text-rose-800 border-rose-200'
    };

    return (
      <div className="max-w-5xl mx-auto py-8 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-8">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Decision Analysis</h2>
          <div className="flex gap-3">
            <button onClick={() => setStep(5)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center">
              <Edit2 size={16} className="mr-2" /> Edit Inputs
            </button>
            <button onClick={restart} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center">
              <RotateCcw size={16} className="mr-2" /> Restart
            </button>
          </div>
        </div>

        {/* HERO RECOMMENDATION */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-indigo-100/20 relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500" />
          <p className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-4">Recommendation</p>
          <h1 className="text-5xl font-extrabold text-slate-900 mb-6">
            Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">{winner.name}</span>
          </h1>
          
          <div className="flex justify-center items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800">{Math.round(winner.winProbability * 100)}%</div>
              <div className="text-sm text-slate-500 font-medium">Win Probability</div>
            </div>
            <div className="w-px h-10 bg-slate-200"></div>
            <div className="text-center">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-bold border ${confidenceColors[insights.confidence]}`}>
                {insights.confidence} Confidence
              </div>
              <div className="text-sm text-slate-500 font-medium mt-1">Statistical Backing</div>
            </div>
          </div>
        </div>

        {/* HUMAN TAKE */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <Brain size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-indigo-900 mb-2">The Human Take</h3>
              <p className="text-indigo-800 leading-relaxed text-lg">
                {insights.humanTake}
              </p>
            </div>
          </div>
        </div>

        {/* INSIGHTS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Why this works */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 flex items-center mb-4">
              <TrendingUp size={18} className="mr-2 text-emerald-500" /> Why this works
            </h3>
            <ul className="space-y-3">
              {insights.descriptive.map((item, i) => (
                <li key={i} className="flex items-start text-slate-600">
                  <span className="text-emerald-500 mr-2 mt-0.5">•</span> {item}
                </li>
              ))}
              {insights.diagnostic.map((item, i) => (
                <li key={i} className="flex items-start text-slate-600">
                  <span className="text-emerald-500 mr-2 mt-0.5">•</span> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Risks & Warnings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 flex items-center mb-4">
              <AlertTriangle size={18} className="mr-2 text-amber-500" /> What to watch
            </h3>
            {insights.warnings.length > 0 ? (
              <ul className="space-y-3">
                {insights.warnings.map((item, i) => (
                  <li key={i} className="flex items-start text-slate-600">
                    <span className="text-amber-500 mr-2 mt-0.5">!</span> {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic">No major statistical warnings detected. Your inputs are balanced.</p>
            )}
            
            {insights.sensitivity.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-700 mb-2">Sensitivity Note:</h4>
                <p className="text-sm text-slate-600">{insights.sensitivity[0]}</p>
              </div>
            )}
          </div>
        </div>

        {/* VISUALIZATIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-80">
            <h3 className="font-bold text-slate-900 mb-6">Win Probability Breakdown</h3>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontWeight: 500}} />
                <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="WinProb" radius={[0, 4, 4, 0]} barSize={32}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === winner.name ? '#4f46e5' : '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-80">
            <h3 className="font-bold text-slate-900 mb-6">Distribution of Outcomes for {winner.name}</h3>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={histData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="bin" tickFormatter={(val) => Math.round(val)} tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis hide />
                <RechartsTooltip cursor={{fill: '#f1f5f9'}} formatter={(val) => [`${val} occurrences`, 'Frequency']} labelFormatter={(val) => `Score ~${val}`} />
                <Bar dataKey="count" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ADVANCED VISUALIZATIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="font-bold text-slate-900 mb-2">Factor Comparison</h3>
            <p className="text-sm text-slate-500 mb-6">Normalized comparison of options based on your most likely estimates (further out is better).</p>
            <div className="flex-1 min-h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  {Object.values(results.results).map((opt, idx) => (
                    <Radar
                      key={opt.id}
                      name={opt.name}
                      dataKey={opt.name}
                      stroke={optionColors[idx % optionColors.length]}
                      fill={optionColors[idx % optionColors.length]}
                      fillOpacity={0.4}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="font-bold text-slate-900 mb-2">Volatility (Risk vs Upside)</h3>
            <p className="text-sm text-slate-500 mb-6">Probability of experiencing an extreme outcome (good or bad) compared to the average expectation.</p>
            <div className="flex-1 min-h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontWeight: 500}} />
                  <YAxis hide />
                  <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Downside Risk %" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Upside Potential %" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* DECISION TREE VISUAL */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-32 bg-indigo-600 blur-[120px] rounded-full opacity-20" />
          <h3 className="font-bold text-xl mb-6 flex items-center relative z-10">
            Path Visualization
          </h3>
          <div className="relative z-10 flex flex-col md:flex-row gap-8">
            {Object.values(results.results).slice(0, 3).map(opt => (
              <div key={opt.id} className="flex-1">
                <div className="font-bold text-indigo-300 mb-4 pb-2 border-b border-slate-700">{opt.name}</div>
                <div className="space-y-4 relative before:absolute before:left-3 before:top-4 before:bottom-4 before:w-px before:bg-slate-700">
                  
                  <div className="relative pl-8">
                    <div className="absolute left-[9px] top-2 w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-slate-900" />
                    <div className="text-sm font-bold text-emerald-400">Best Case</div>
                    <div className="text-xs text-slate-400">Top 10% outcomes</div>
                  </div>
                  
                  <div className="relative pl-8">
                    <div className="absolute left-[9px] top-2 w-2 h-2 rounded-full bg-blue-400 ring-4 ring-slate-900" />
                    <div className="text-sm font-bold text-blue-400">Most Likely</div>
                    <div className="text-xs text-slate-400">Average expectation</div>
                  </div>

                  <div className="relative pl-8">
                    <div className="absolute left-[9px] top-2 w-2 h-2 rounded-full bg-amber-400 ring-4 ring-slate-900" />
                    <div className="text-sm font-bold text-amber-400">Worst Case</div>
                    <div className="text-xs text-slate-400">Bottom 10% outcomes</div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  };

  const renderHelpModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 text-left">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            <HelpCircle className="mr-3 text-indigo-600" /> How to Use Decision Coach
          </h2>
          <button 
            onClick={() => setShowHelp(false)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-2">1. What is this tool?</h3>
            <p>
              Decision Coach helps you make complex choices by breaking them down into numbers and running a mathematical simulation (Monte Carlo). Instead of a simple "pros and cons" list, it considers uncertainty and tells you mathematically which option gives you the best chance of success.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-2">2. Options & Factors</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Options:</strong> The choices you are weighing (e.g., "Startup Job" vs "Corporate Job").</li>
              <li><strong>Factors:</strong> What matters to you (e.g., "Salary", "Work-Life Balance").</li>
              <li><strong>Weights:</strong> How important each factor is, totaling 100 points. (If Salary is half your decision, give it 50).</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-indigo-900 mb-4 pb-2 border-b border-indigo-100">3. The Magic: Worst, Likely, Best</h3>
            <p className="mb-4">
              When evaluating an option against a factor, you don't just pick one number. Real life is uncertain! You provide three numbers (typically on a 0-100 scale, or real currency):
            </p>
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-3">
              <p><strong>Worst Case:</strong> If everything goes wrong, what is the lowest realistic score?</p>
              <p><strong>Likely (Mode):</strong> What do you honestly expect will happen?</p>
              <p><strong>Best Case:</strong> If everything goes perfectly, what is the highest score?</p>
            </div>
            
            <div className="mt-6 bg-indigo-50 border border-indigo-100 p-5 rounded-xl">
              <h4 className="font-bold text-indigo-900 mb-2">Real World Example: Evaluating "Startup Job"</h4>
              <p className="mb-2">Let's look at the factor <strong>"Work-Life Balance (0-100)"</strong>:</p>
              <ul className="list-disc pl-5 space-y-1 text-indigo-800">
                <li><strong>Worst (20):</strong> They might expect me to work weekends constantly.</li>
                <li><strong>Likely (50):</strong> It will probably be long hours, but manageable.</li>
                <li><strong>Best (80):</strong> They might actually respect the flexible hours they promised.</li>
              </ul>
              <p className="mt-3 text-sm text-indigo-700">
                <em>Why this matters:</em> By giving a range, the tool can simulate thousands of possible futures where the startup is sometimes amazing and sometimes terrible, rather than just assuming it will be average every time.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-2">4. The Results</h3>
            <p>
              After simulating 2,000 parallel universes, the tool tells you which option won the most often, giving you a <strong>Win Probability</strong> and human-readable insights into why.
            </p>
          </section>
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button 
            onClick={() => setShowHelp(false)}
            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Got it, let's start!
          </button>
        </div>
      </div>
    </div>
  );

  // Main Render
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navbar Minimal */}
      {step > 0 && step < 7 && (
        <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="font-bold text-slate-900 flex items-center gap-2 cursor-pointer" onClick={restart}>
              <Brain className="text-indigo-600" /> Decision Coach
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  step >= i ? "w-6 bg-indigo-600" : "w-2 bg-slate-200"
                )} />
              ))}
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={cn("pt-16 pb-20", step === 0 ? "pt-0" : "")}>
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
            {step === 2 && renderOptions()}
            {step === 3 && renderCriteria()}
            {step === 4 && renderWeights()}
            {step === 5 && renderUncertainty()}
            {step === 6 && renderSimulating()}
            {step === 7 && renderResults()}
          </motion.div>
        </AnimatePresence>
      </main>

      {showHelp && <Tutorial onClose={() => setShowHelp(false)} />}
    </div>
  );
}
