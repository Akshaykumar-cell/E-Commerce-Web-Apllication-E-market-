import React from 'react';
import { useCurrency } from '../services/CurrencyContext';
import { Globe } from 'lucide-react';

const CurrencySwitcher = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center space-x-1 bg-slate-900/60 border border-slate-800 rounded-lg p-1">
      <button
        onClick={() => setCurrency('USD')}
        className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all duration-200 ${
          currency === 'USD'
            ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/20'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        USD
      </button>
      <button
        onClick={() => setCurrency('INR')}
        className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all duration-200 ${
          currency === 'INR'
            ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/20'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        INR (₹)
      </button>
    </div>
  );
};

export const CurrencySwitcherMobile = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800/60 px-2">
      <span className="text-sm font-medium text-slate-400 flex items-center gap-2">
        <Globe size={16} className="text-purple-400" />
        <span>Currency</span>
      </span>
      <div className="flex bg-slate-900/60 border border-slate-800 rounded-lg p-0.5">
        <button
          onClick={() => setCurrency('USD')}
          className={`px-3 py-1 text-xs font-bold rounded-md ${
            currency === 'USD' ? 'bg-purple-600 text-white' : 'text-slate-400'
          }`}
        >
          USD
        </button>
        <button
          onClick={() => setCurrency('INR')}
          className={`px-3 py-1 text-xs font-bold rounded-md ${
            currency === 'INR' ? 'bg-purple-600 text-white' : 'text-slate-400'
          }`}
        >
          INR (₹)
        </button>
      </div>
    </div>
  );
};

export default CurrencySwitcher;
