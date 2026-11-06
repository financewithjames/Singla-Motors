import React from 'react';
import {
  X,
  ShoppingCart,
  UserPlus,
  Bike,
  FileSpreadsheet,
  CalendarCheck,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QuickActionModal: React.FC = () => {
  const { isQuickActionOpen, setIsQuickActionOpen, setActiveModule } = useApp();

  if (!isQuickActionOpen) return null;

  const actions = [
    {
      title: 'Create New Bill',
      subtitle: 'Open the checkout counter to sell a scooter or accessories',
      icon: ShoppingCart,
      color: 'bg-emerald-600',
      action: () => {
        setActiveModule('pos');
        setIsQuickActionOpen(false);
      },
    },
    {
      title: 'Add Customer Enquiry',
      subtitle: 'Record a new walk-in customer, phone enquiry, or test ride',
      icon: UserPlus,
      color: 'bg-[#173B63]',
      action: () => {
        setActiveModule('crm');
        setIsQuickActionOpen(false);
      },
    },
    {
      title: 'Add Vehicle to Stock',
      subtitle: 'Record a new scooter received from the manufacturer by chassis number',
      icon: Bike,
      color: 'bg-purple-600',
      action: () => {
        setActiveModule('vehicles');
        setIsQuickActionOpen(false);
      },
    },
    {
      title: 'Log Shop Expense',
      subtitle: 'Enter electricity, rent, tea/refreshments, or local marketing bill',
      icon: FileSpreadsheet,
      color: 'bg-amber-600',
      action: () => {
        setActiveModule('expenses');
        setIsQuickActionOpen(false);
      },
    },
    {
      title: 'Create Repair Job Card',
      subtitle: 'Open service ticket, check battery health, and assign mechanic',
      icon: CalendarCheck,
      color: 'bg-sky-600',
      action: () => {
        setActiveModule('service');
        setIsQuickActionOpen(false);
      },
    },
    {
      title: 'Close Cash Counter Today',
      subtitle: 'Count cash in drawer and match with system total',
      icon: Wallet,
      color: 'bg-teal-600',
      action: () => {
        setActiveModule('cash_bank');
        setIsQuickActionOpen(false);
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Quick Actions</h3>
            <p className="text-xs text-slate-500">Pick an everyday showroom task to jump straight to it</p>
          </div>
          <button
            onClick={() => setIsQuickActionOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.title}
                onClick={act.action}
                className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/80 text-left transition-all"
              >
                <div className={`p-2.5 rounded-lg text-white ${act.color} shrink-0 mt-0.5 shadow-2xs`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-slate-900 dark:text-white">{act.title}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {act.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
