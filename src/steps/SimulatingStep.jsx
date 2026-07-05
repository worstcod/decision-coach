import { motion } from 'framer-motion';
import { DEFAULT_ITERATIONS } from '../math-engine';

export default function SimulatingStep() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]" role="status" aria-live="polite">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full mb-8"
        aria-hidden
      />
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Simulating possible futures…</h2>
      <p className="text-slate-500">Running {DEFAULT_ITERATIONS.toLocaleString()} Monte Carlo scenarios</p>
    </div>
  );
}
