import React from 'react';
import { Building, MapPin, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';

export const BranchManagement: React.FC = () => {
  const { branches } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Building className="h-5 w-5 text-[#173B63] dark:text-sky-400" />
          Showroom Branches
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Addresses, GSTIN registration numbers, and contact details for your Patiala and Chandigarh showrooms
        </p>
      </div>

      {/* Showroom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {branches.map((b) => {
          const vehicles = db.getVehicles(b.id).filter((v) => v.status === 'Available');
          const invoices = db.getInvoices(b.id).filter((i) => i.status === 'Finalized');
          const totalSales = invoices.reduce((acc, i) => acc + i.grandTotal, 0);

          return (
            <div
              key={b.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{b.name}</h3>
                    {b.isCentralHub && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#173B63] text-white">
                        Main Central Hub
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{b.city}, {b.state}</div>
                </div>

                <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md dark:bg-slate-800">
                  {b.code}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{b.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{b.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{b.email}</span>
                </div>
                <div className="flex items-center gap-2 font-mono font-semibold text-slate-800 dark:text-slate-200 pt-1">
                  <FileText className="h-4 w-4 text-[#173B63] dark:text-sky-400 shrink-0" />
                  <span>GSTIN: {b.gstin} (State Code: {b.stateCode})</span>
                </div>
              </div>

              {/* Live Numbers Strip */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <div className="text-slate-400 text-[10px] font-bold uppercase">Ready Stock on Floor</div>
                  <div className="text-base font-bold font-mono text-purple-600 mt-0.5">
                    {vehicles.length} Electric Vehicles
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <div className="text-slate-400 text-[10px] font-bold uppercase">Total Showroom Sales</div>
                  <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5 tabular-nums">
                    ₹{totalSales.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
