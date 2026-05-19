import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, BookOpen, Target, Activity, Brain, PieChart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TUTORIAL_STEPS = [
  {
    title: "Welcome to Decision Intelligence",
    icon: <BookOpen className="w-8 h-8 text-indigo-500" />,
    content: (
      <div className="space-y-4 text-slate-600">
        <p>Traditional "Pros & Cons" lists are mathematically flawed. They ignore uncertainty, risk, and the fact that humans are terrible at guessing exact numbers.</p>
        <p>This app uses <strong>Monte Carlo Simulations</strong> and <strong>Probabilistic Modeling</strong> to help you make decisions like a quantitative analyst, while keeping the interface as simple as possible.</p>
        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-800">
          <strong>The Example Journey:</strong> Imagine you are choosing between a <strong>Stable Corporate Job</strong> and a <strong>High-Risk Startup</strong>. Let's walk through how this app calculates the winner.
        </div>
      </div>
    )
  },
  {
    title: "1. Defining Factors & Weights",
    icon: <Target className="w-8 h-8 text-emerald-500" />,
    content: (
      <div className="space-y-4 text-slate-600">
        <p>First, you list what matters to you (e.g., Salary, Work-Life Balance) and assign a Weight (0-100) to each.</p>
        <h4 className="font-bold text-slate-900 mt-4">The Math: Min-Max Normalization</h4>
        <p>If Salary is in dollars ($100k) and Happiness is 1-10, adding them directly breaks the math (dollars will mathematically overpower happiness).</p>
        <p>To fix this, our engine automatically normalizes all outcomes to a strict <strong>0 to 1 scale</strong> before weights are applied. This ensures your assigned weights are perfectly respected, regardless of the unit.</p>
      </div>
    )
  },
  {
    title: "2. Embracing Uncertainty (Beta-PERT)",
    icon: <Activity className="w-8 h-8 text-blue-500" />,
    content: (
      <div className="space-y-4 text-slate-600">
        <p>Instead of guessing an exact Salary, you provide three numbers:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Worst Case:</strong> $60k</li>
          <li><strong>Most Likely:</strong> $90k</li>
          <li><strong>Best Case:</strong> $150k (huge upside)</li>
        </ul>
        <h4 className="font-bold text-slate-900 mt-4">The Math: Beta-PERT Distribution</h4>
        <p>The app converts your 3 numbers into a smooth probability curve. It's not a rigid triangle—it has smooth tails, representing how real-world events actually unfold. The engine then picks random points from this curve to simulate potential futures.</p>
      </div>
    )
  },
  {
    title: "3. Risk Profiles & Utility",
    icon: <Brain className="w-8 h-8 text-purple-500" />,
    content: (
      <div className="space-y-4 text-slate-600">
        <p>Two people facing the same decision might choose differently based on their risk tolerance.</p>
        <h4 className="font-bold text-slate-900 mt-4">The Math: Utility Functions</h4>
        <ul className="space-y-2">
          <li><strong className="text-slate-800">Risk-Neutral (Score = X):</strong> Looks purely at the mathematical average.</li>
          <li><strong className="text-slate-800">Risk-Averse (Score = log(X)):</strong> Applies a logarithmic curve. This heavily penalizes options that have severe downside risks, favoring stability.</li>
          <li><strong className="text-slate-800">Risk-Seeking (Score = X²):</strong> Applies an exponential curve. This heavily rewards massive upside potential, ignoring the risk of failure.</li>
        </ul>
      </div>
    )
  },
  {
    title: "4. The Monte Carlo Simulation",
    icon: <PieChart className="w-8 h-8 text-rose-500" />,
    content: (
      <div className="space-y-4 text-slate-600">
        <p>The app simulates up to <strong>10,000 possible parallel universes</strong>. In each universe, it pulls random variables from your Beta-PERT curves, normalizes them, weights them, applies your Risk Utility, and calculates a final score.</p>
        <h4 className="font-bold text-slate-900 mt-4">Understanding the Metrics:</h4>
        <ul className="space-y-2 text-sm md:text-base">
          <li><strong className="text-slate-800">Win Probability:</strong> The percentage of simulated universes where this option had the highest final score.</li>
          <li><strong className="text-slate-800">Downside Risk:</strong> The mathematical probability of an option scoring severely below the average outcome.</li>
          <li><strong className="text-slate-800">Expected Utility:</strong> The true average value of the option <em>after</em> applying your psychological risk profile.</li>
        </ul>
      </div>
    )
  }
];

export default function Tutorial({ onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) setCurrentStep(s => s + 1);
    else onClose();
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl min-h-[500px] flex flex-col md:flex-row overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 rounded-full transition-colors">
          <X size={24} />
        </button>
        
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-[30%] bg-slate-50 border-r border-slate-100 p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-8">How it Works</h2>
          <div className="space-y-6">
            {TUTORIAL_STEPS.map((step, idx) => (
              <div key={idx} className={`flex items-center gap-3 transition-opacity duration-300 ${currentStep === idx ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${currentStep === idx ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {idx + 1}
                </div>
                <span className={`text-sm font-semibold transition-colors ${currentStep === idx ? 'text-indigo-900' : 'text-slate-500'}`}>
                  {step.title.replace(/^\d+\.\s*/, '')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-8 md:p-12 bg-white">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6 inline-flex p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  {TUTORIAL_STEPS[currentStep].icon}
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-6">
                  {TUTORIAL_STEPS[currentStep].title}
                </h2>
                <div className="text-lg leading-relaxed">
                  {TUTORIAL_STEPS[currentStep].content}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={prev}
              disabled={currentStep === 0}
              className={`px-6 py-3 font-medium rounded-xl flex items-center transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <ArrowLeft className="mr-2" size={20} /> Back
            </button>
            <div className="flex gap-2">
              {TUTORIAL_STEPS.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentStep ? 'bg-indigo-600 w-6' : 'bg-slate-200'}`} />
              ))}
            </div>
            <button
              onClick={next}
              className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all flex items-center"
            >
              {currentStep === TUTORIAL_STEPS.length - 1 ? 'Start Deciding' : 'Next'} <ArrowRight className="ml-2" size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
