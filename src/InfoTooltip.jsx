import { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

export default function InfoTooltip({ children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  return (
    <span
      ref={ref}
      className="relative inline-flex items-center justify-center ml-2 align-middle"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-label="More information"
        onClick={(e) => {
          e.preventDefault();
          setOpen(v => !v);
        }}
        className="text-slate-400 hover:text-indigo-500 focus:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-full transition-colors"
      >
        <HelpCircle size={14} />
      </button>
      <div
        role="tooltip"
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-xs font-normal rounded-lg z-50 shadow-xl text-left leading-relaxed transition-all ${
          open ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        {children}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
      </div>
    </span>
  );
}
