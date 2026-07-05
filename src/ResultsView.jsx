import {
  Brain, RotateCcw, AlertTriangle, TrendingUp, Edit2, Download, Printer, Bookmark, Info, GitCompare, Lock,
} from 'lucide-react';
import SensitivityPanel from './SensitivityPanel';
import SimulationInspector from './SimulationInspector';
import MethodComparison from './MethodComparison';
import OptionHistograms from './OptionHistograms';
import CompareDecisions from './CompareDecisions';
import { downloadDecisionJson, openPrintableSummary, downloadInspectorJson } from './exportDecision';
import { downloadEncryptedExport } from './shareDecision';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  CartesianGrid, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
} from 'recharts';

export default function ResultsView({
  results,
  insights,
  uncertainties,
  options,
  criteria,
  riskProfile,
  alternativeMethods,
  simulationSeed,
  saveNotice,
  showCompare,
  setShowCompare,
  onSave,
  onEdit,
  onRestart,
  getExportState,
  onMathDoc,
}) {
  if (!results || !insights) return null;

  const winner = results.results[results.winningOptionId];
  const chartData = Object.values(results.results).map(opt => ({
    name: opt.name,
    WinProb: Math.round(opt.winProbability * 100),
  }));

  const radarData = results.normalizedCriteria.map(crit => {
    const dataPoint = { subject: crit.name };
    Object.values(results.results).forEach(opt => {
      const input = uncertainties[`${opt.id}_${crit.id}`] || { mode: 0 };
      const bounds = results.criteriaBounds[crit.id];
      let normalized = 0;
      if (bounds && bounds.max > bounds.min) {
        normalized = (input.mode - bounds.min) / (bounds.max - bounds.min);
        if (crit.isPositive === false) normalized = 1 - normalized;
      } else {
        normalized = 1;
      }
      dataPoint[opt.name] = Math.round(normalized * 100);
    });
    return dataPoint;
  });

  const riskData = Object.values(results.results).map(opt => ({
    name: opt.name,
    'Volatility (Spread)': Math.round(opt.stdDev * 100),
    'Expected Regret': Math.round(opt.expectedRegret * 100),
  }));

  const optionColors = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  const confidenceColors = {
    High: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Medium: 'bg-amber-100 text-amber-800 border-amber-200',
    Low: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  const riskProfileLabels = {
    'risk-averse': 'Risk-Averse',
    neutral: 'Risk-Neutral',
    'risk-seeking': 'Risk-Seeking',
  };
  const activeRiskLabel = riskProfileLabels[results.riskUtility || riskProfile] || 'Risk-Neutral';

  const metricsData = Object.values(results.results).map(opt => ({
    name: opt.name,
    'Expected Utility': Math.round(opt.expectedUtility * 100),
    'Downside Risk': Math.round(opt.downsideRisk * 100),
  }));

  const ci = winner.winProbabilityCI;
  const ciLabel = ci
    ? `${Math.round(winner.winProbability * 100)}% (95% CI: ${Math.round(ci.low * 100)}–${Math.round(ci.high * 100)}%)`
    : `${Math.round(winner.winProbability * 100)}%`;

  const handleEncryptedExport = async () => {
    const password = window.prompt('Choose a password for the encrypted file:');
    if (!password) return;
    await downloadEncryptedExport(getExportState(), password);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-8" role="region" aria-label="Decision results">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Decision Analysis</h2>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onSave} className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center">
            <Bookmark size={16} className="mr-2" aria-hidden /> Save
          </button>
          <button type="button" onClick={() => downloadDecisionJson(getExportState())} className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center">
            <Download size={16} className="mr-2" aria-hidden /> Export JSON
          </button>
          <button type="button" onClick={handleEncryptedExport} className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center">
            <Lock size={16} className="mr-2" aria-hidden /> Encrypted
          </button>
          <button type="button" onClick={() => openPrintableSummary(getExportState())} className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center">
            <Printer size={16} className="mr-2" aria-hidden /> Print
          </button>
          <button type="button" onClick={() => setShowCompare(v => !v)} className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center">
            <GitCompare size={16} className="mr-2" aria-hidden /> Compare
          </button>
          <button type="button" onClick={onEdit} className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center">
            <Edit2 size={16} className="mr-2" aria-hidden /> Edit Inputs
          </button>
          <button type="button" onClick={onRestart} className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center">
            <RotateCcw size={16} className="mr-2" aria-hidden /> Restart
          </button>
        </div>
      </div>

      {saveNotice && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800" role="status">{saveNotice}</div>
      )}

      {showCompare && (
        <CompareDecisions currentSnapshot={getExportState()} onClose={() => setShowCompare(false)} />
      )}

      <div className="flex items-start gap-3 p-4 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-600">
        <Info size={18} className="text-slate-400 mt-0.5 shrink-0" aria-hidden />
        <p>
          <strong className="text-slate-700">How to read this:</strong> Results reflect your estimates and weights, not guaranteed outcomes.
          The model treats factors as independent (unless you picked an environment scenario) and uses compensatory weighting.
          Must-have rules disqualify options per simulation when violated. This is decision support, not professional advice.
          {simulationSeed != null && <> Simulation seed: <code className="text-xs bg-white px-1 rounded">{simulationSeed}</code>.</>}
          {' '}
          <button type="button" onClick={onMathDoc} className="text-indigo-600 hover:underline font-medium">
            Read full math transparency →
          </button>
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-indigo-100/20 relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500" />
        <p className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-4">Recommendation</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6">
          Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">{winner.name}</span>
        </h1>
        <div className="flex justify-center items-center gap-6 flex-wrap">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-slate-800">{ciLabel}</div>
            <div className="text-sm text-slate-500 font-medium">Win Probability</div>
          </div>
          <div className="w-px h-10 bg-slate-200 hidden sm:block" aria-hidden />
          <div className="text-center">
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-bold border ${confidenceColors[insights.confidence]}`}>
              {insights.confidence} Confidence
            </div>
            {results.statisticalTie && (
              <div className="text-xs text-rose-600 mt-1 font-medium">Statistical tie possible</div>
            )}
          </div>
          <div className="w-px h-10 bg-slate-200 hidden sm:block" aria-hidden />
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-slate-800">{Math.round(winner.expectedUtility * 100)}</div>
            <div className="text-sm text-slate-500 font-medium">Expected Utility</div>
          </div>
          <div className="w-px h-10 bg-slate-200 hidden sm:block" aria-hidden />
          <div className="text-center">
            <div className="text-lg font-bold text-slate-800">{activeRiskLabel}</div>
            <div className="text-sm text-slate-500 font-medium">Risk Profile</div>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl" aria-hidden><Brain size={24} /></div>
          <div>
            <h3 className="text-lg font-bold text-indigo-900 mb-2">The Human Take</h3>
            <p className="text-indigo-800 leading-relaxed text-lg">{insights.humanTake}</p>
          </div>
        </div>
      </div>

      {alternativeMethods && (
        <MethodComparison
          monteCarloWinner={winner.name}
          topsis={alternativeMethods.topsis}
          minimaxRegret={alternativeMethods.minimaxRegret}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 flex items-center mb-4">
            <TrendingUp size={18} className="mr-2 text-emerald-500" aria-hidden /> Why this works
          </h3>
          <ul className="space-y-3">
            {insights.descriptive.map((item, i) => (
              <li key={i} className="flex items-start text-slate-600"><span className="text-emerald-500 mr-2">•</span>{item}</li>
            ))}
            {insights.diagnostic.map((item, i) => (
              <li key={i} className="flex items-start text-slate-600"><span className="text-emerald-500 mr-2">•</span>{item}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 flex items-center mb-4">
            <AlertTriangle size={18} className="mr-2 text-amber-500" aria-hidden /> What to watch
          </h3>
          {insights.warnings.length > 0 ? (
            <ul className="space-y-3">
              {insights.warnings.map((item, i) => (
                <li key={i} className="flex items-start text-slate-600"><span className="text-amber-500 mr-2">!</span>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 italic">No major statistical warnings detected.</p>
          )}
        </div>
      </div>

      <SensitivityPanel
        options={options.filter(o => o.name.trim())}
        criteria={criteria.filter(c => c.name.trim() && c.weight > 0)}
        uncertainties={uncertainties}
        riskUtility={results.riskUtility}
        baseWinnerId={results.winningOptionId}
        baseWinnerName={winner.name}
      />

      <SimulationInspector simulationData={results} criteria={results.normalizedCriteria} onExport={() => downloadInspectorJson(results)} />

      <OptionHistograms results={results} winningOptionId={results.winningOptionId} />

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-2">Risk-Adjusted Metrics</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metricsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
              <YAxis unit="%" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <RechartsTooltip cursor={{ fill: '#f1f5f9' }} />
              <Legend iconType="circle" />
              <Bar dataKey="Expected Utility" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Downside Risk" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-80">
          <h3 className="font-bold text-slate-900 mb-6">Win Probability Breakdown</h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569' }} />
              <RechartsTooltip />
              <Bar dataKey="WinProb" radius={[0, 4, 4, 0]} barSize={32}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.name === winner.name ? '#4f46e5' : '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 mb-2">Factor Comparison</h3>
          <div className="flex-1 min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <RechartsTooltip />
                <Legend iconType="circle" />
                {Object.values(results.results).map((opt, idx) => (
                  <Radar key={opt.id} name={opt.name} dataKey={opt.name} stroke={optionColors[idx % 5]} fill={optionColors[idx % 5]} fillOpacity={0.35} />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-2">Uncertainty Profile</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis hide />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="Expected Regret" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Volatility (Spread)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden">
        <h3 className="font-bold text-xl mb-2 relative z-10">Outcome Paths</h3>
        <p className="text-sm text-slate-400 mb-6 relative z-10">
          Simulated score percentiles from {results.iterations.toLocaleString()} scenarios.
        </p>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.values(results.results).slice(0, 3).map(opt => (
            <div key={opt.id}>
              <div className="font-bold text-indigo-300 mb-4 pb-2 border-b border-slate-700">{opt.name}</div>
              <div className="space-y-3 text-sm">
                <div><span className="text-emerald-400 font-bold">90th:</span> ~{Math.round(opt.percentiles.p90 * 100)}</div>
                <div><span className="text-blue-400 font-bold">50th:</span> ~{Math.round(opt.percentiles.p50 * 100)}</div>
                <div><span className="text-amber-400 font-bold">10th:</span> ~{Math.round(opt.percentiles.p10 * 100)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
