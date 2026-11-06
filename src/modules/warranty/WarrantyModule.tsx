import React, { useState } from 'react';
import { Shield, ShieldCheck, AlertCircle, Search } from 'lucide-react';
import { db } from '../../services/db';

export const WarrantyModule: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const warranties = db.getWarranties();

  const filtered = warranties.filter((w) => {
    return (
      w.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.customerMobile.includes(searchQuery) ||
      w.chassisNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.batterySerial.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-600" />
          Vehicle & Battery Warranties
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Track 3-year vehicle, 5-to-8 year battery pack, and motor warranty duration for sold scooters
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 w-full sm:w-96 text-xs">
        <Search className="h-4 w-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search customer, phone, or chassis number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
        />
      </div>

      {/* Warranty Records Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                <th className="py-2.5 px-4 font-semibold">Customer</th>
                <th className="py-2.5 px-4 font-semibold">Scooter Model</th>
                <th className="py-2.5 px-4 font-semibold">Chassis (VIN)</th>
                <th className="py-2.5 px-4 font-semibold">Purchase Date</th>
                <th className="py-2.5 px-4 font-semibold">Vehicle Warranty Ends</th>
                <th className="py-2.5 px-4 font-semibold">Battery Warranty Ends</th>
                <th className="py-2.5 px-4 font-semibold text-right">Warranty Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{w.customerName}</div>
                    <div className="text-[11px] text-slate-400">{w.customerMobile}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{w.vehicleModel}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    {w.chassisNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{w.saleDate}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {w.vehicleWarrantyExpires}
                  </td>
                  <td className="py-3 px-4 text-emerald-700 dark:text-emerald-300 font-semibold">
                    {w.batteryWarrantyExpires}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <ShieldCheck className="h-3 w-3" />
                      <span>{w.status}</span>
                    </span>
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
