import React, { useState } from 'react';
import { X } from 'lucide-react';
import { MEASURE_TYPES, enrichCriterion } from './criterionTypes';

export default function CustomFactorModal({ onClose, onSave }) {
  const [name, setName] = useState('');
  const [measureType, setMeasureType] = useState('score10');
  const [isPositive, setIsPositive] = useState(true);

  const handleSave = () => {
    if (!name.trim()) return;
    const id = `c_custom_${Date.now()}`;
    onSave(enrichCriterion({
      id,
      catalogId: null,
      name: name.trim(),
      measureType,
      isPositive,
      weight: 15,
      why: 'Custom factor defined by you.',
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Add custom factor</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Factor name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Manager quality, Visa ease"
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">How is it measured?</label>
            <select
              value={measureType}
              onChange={e => setMeasureType(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            >
              {Object.values(MEASURE_TYPES).map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Better direction</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsPositive(true)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border ${isPositive ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'border-slate-200 text-slate-600'}`}
              >
                Higher is better
              </button>
              <button
                type="button"
                onClick={() => setIsPositive(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border ${!isPositive ? 'bg-rose-50 border-rose-300 text-rose-800' : 'border-slate-200 text-slate-600'}`}
              >
                Lower is better
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            Add factor
          </button>
        </div>
      </div>
    </div>
  );
}
