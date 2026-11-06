import React from 'react';
import { Truck, Building2, Phone, Mail, FileText } from 'lucide-react';
import { db } from '../../services/db';

export const PurchaseModule: React.FC = () => {
  const suppliers = db.getSuppliers();
  const totalPayables = suppliers.reduce((acc, s) => acc + s.currentPayableBalance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Truck className="h-5 w-5 text-[#173B63] dark:text-sky-400" />
          Factory Purchases & Manufacturers
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Suppliers, vehicle manufacturers, and payments owed for showroom inventory
        </p>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Total Money Owed to Manufacturers</div>
          <div className="text-xl font-bold font-mono text-rose-600 mt-1 tabular-nums">
            ₹{totalPayables.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across {suppliers.length} authorized manufacturers</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Authorized Dealership Partners</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            4 Major EV Brands
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Ather Energy, Ola Electric, TVS, Bajaj Chetak</div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Manufacturer Directory</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                <th className="py-2.5 px-4 font-semibold">Manufacturer Name</th>
                <th className="py-2.5 px-4 font-semibold">Category</th>
                <th className="py-2.5 px-4 font-semibold">GSTIN</th>
                <th className="py-2.5 px-4 font-semibold">Factory / Head Office</th>
                <th className="py-2.5 px-4 font-semibold">Contact</th>
                <th className="py-2.5 px-4 font-semibold text-right">Balance Owed (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{s.name}</td>
                  <td className="py-3 px-4 text-slate-500">{s.category}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">{s.gstin}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{s.city}, {s.state}</td>
                  <td className="py-3 px-4 text-slate-500">{s.phone}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                    ₹{s.currentPayableBalance.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
