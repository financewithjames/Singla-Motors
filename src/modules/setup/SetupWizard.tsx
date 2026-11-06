import React from 'react';
import { Sliders, Sparkles, RotateCcw, CheckCircle2, Building, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';

export const SetupWizard: React.FC = () => {
  const { triggerRefresh, setActiveModule } = useApp();
  const isDemo = db.isDemoModeActive();

  const handleResetToClean = () => {
    if (confirm('Start with a completely clean showroom? All sample bills, customers, and test scooters will be cleared.')) {
      db.resetToFreshData();
      triggerRefresh();
      alert('Showroom reset to a clean database!');
    }
  };

  const handleRestoreSample = () => {
    if (confirm('Load sample showroom data with pre-filled Ather, Ola, TVS scooters, test bills, and accounts?')) {
      db.restoreDemoData();
      triggerRefresh();
      alert('Sample test data loaded successfully!');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="h-5 w-5 text-[#173B63] dark:text-sky-400" />
          Quick Setup & Reset
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage sample test data or start fresh with an empty showroom database
        </p>
      </div>

      {/* Mode Status Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Current Database Mode</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isDemo
                ? 'Sample demo data is loaded with realistic Ather, Ola, TVS scooters, past bills, and accounts.'
                : 'Clean live mode with only your own entered records.'}
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isDemo
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
            }`}
          >
            {isDemo ? 'Sample Demo Mode' : 'Live Mode'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Load Sample Data */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 space-y-3 flex flex-col justify-between">
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>Load Sample Showroom Data</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Fills your showroom with sample scooters, spare parts, customer leads, past bills, and accounts so you can test all features easily.
              </p>
            </div>
            <button
              onClick={handleRestoreSample}
              className="w-full py-2 px-3 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 flex items-center justify-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Load Sample Data</span>
            </button>
          </div>

          {/* Reset Clean */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 space-y-3 flex flex-col justify-between">
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <RotateCcw className="h-4 w-4 text-rose-600" />
                <span>Start Fresh (Clear All Data)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Wipes all sample invoices, vehicles, and customer leads so you can begin entering your real showroom stock and real customer sales.
              </p>
            </div>
            <button
              onClick={handleResetToClean}
              className="w-full py-2 px-3 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 flex items-center justify-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear & Start Fresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Showroom Information */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3 text-xs">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Building className="h-4 w-4 text-[#173B63] dark:text-sky-400" />
          <span>Configured Showroom Hubs</span>
        </h3>
        <p className="text-slate-500">
          Singla Motors is configured with Store A (Patiala Central Hub) and Store B (Chandigarh Showroom). You can toggle between them or view both combined from the showroom selector in the top bar.
        </p>
        <div className="pt-2">
          <button
            onClick={() => setActiveModule('dashboard')}
            className="px-4 py-2 rounded-lg bg-[#173B63] text-white text-xs font-semibold hover:bg-[#102a45]"
          >
            Go to Owner Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
