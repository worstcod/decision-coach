import { ArrowRight, HelpCircle, Upload, ShieldAlert } from 'lucide-react';
import DecisionHistory from '../DecisionHistory';

export default function LandingStep({ onStart, onHelp, onImport, onLoadHistory, onMathDoc }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-full">
        <ShieldAlert size={16} aria-hidden /> No login required
      </div>
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
        Stop Overthinking.<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Decide with Clarity.</span>
      </h1>
      <p className="text-xl text-slate-600 mb-10 max-w-2xl">
        Monte Carlo simulation and weighted factors — private, in your browser.
      </p>
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={onStart}
          className="group inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 shadow-lg"
        >
          Start Decision <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" aria-hidden />
        </button>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={onHelp} className="inline-flex items-center text-slate-500 hover:text-indigo-600 font-medium bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200">
            <HelpCircle size={20} className="mr-2" aria-hidden /> How to use
          </button>
          <button type="button" onClick={onMathDoc} className="inline-flex items-center text-slate-500 hover:text-indigo-600 font-medium bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200">
            How the math works
          </button>
          <button type="button" onClick={onImport} className="inline-flex items-center text-slate-500 hover:text-indigo-600 font-medium bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200">
            <Upload size={20} className="mr-2" aria-hidden /> Import file
          </button>
        </div>
        <DecisionHistory onLoad={onLoadHistory} />
      </div>
    </div>
  );
}
