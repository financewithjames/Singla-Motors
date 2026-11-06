import React from 'react';
import { Clock, AlertTriangle, Bike, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';

export const DeadStockReport: React.FC = () => {
  const { activeBranchId } = useApp();

  const vehicles = db.getVehicles(activeBranchId).filter((v) => v.status === 'Available');
  const now = new Date().getTime();

  // Categorize vehicles by real age since purchaseDate
  const categorized = {
    fresh: [] as typeof vehicles, // 0-30 days
    normal: [] as typeof vehicles, // 31-60 days
    slow: [] as typeof vehicles, // 61-90 days
    dead: [] as typeof vehicles, // 90+ days
  };

  for (const v of vehicles) {
    const pDate = new Date(v.purchaseDate).getTime();
    const daysInStock = Math.floor((now - pDate) / (1000 * 60 * 60 * 24));

    if (daysInStock <= 30) {
      categorized.fresh.push(v);
    } else if (daysInStock <= 60) {
      categorized.normal.push(v);
    } else if (daysInStock <= 90) {
      categorized.slow.push(v);
    } else {
      categorized.dead.push(v);
    }
  }

  const deadValue = categorized.dead.reduce((acc, v) => acc + v.totalLandedCost, 0);
  const slowValue = categorized.slow.reduce((acc, v) => acc + v.totalLandedCost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-600" />
          Slow Moving & Old Stock
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          See how long vehicles have been sitting in your showroom since they arrived from the manufacturer
        </p>
      </div>

      {/* Blocked Money Alert */}
      {categorized.dead.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-900/60 dark:bg-rose-950/30">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                Notice: ₹{deadValue.toLocaleString('en-IN')} Tied Up in Old Stock ({categorized.dead.length} vehicle(s) in showroom over 3 months)
              </h3>
              <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">
                Vehicles unsold after 3 months tie up cash. Consider running a festival discount, free helmet offer, or contacting the manufacturer for an exchange.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Time Buckets Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Under 1 Month (Fresh)</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-emerald-600 mt-1">
            {categorized.fresh.length} Units
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
            ₹{categorized.fresh.reduce((a, v) => a + v.totalLandedCost, 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>1 to 2 Months</span>
            <span className="h-2 w-2 rounded-full bg-sky-500"></span>
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
            {categorized.normal.length} Units
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
            ₹{categorized.normal.reduce((a, v) => a + v.totalLandedCost, 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>2 to 3 Months (Slow)</span>
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-amber-600 mt-1">
            {categorized.slow.length} Units
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
            ₹{slowValue.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3.5 dark:border-rose-900 dark:bg-rose-950/20">
          <div className="text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
            <span>Over 3 Months (Old)</span>
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-rose-600 mt-1">
            {categorized.dead.length} Units
          </div>
          <div className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5 font-mono">
            ₹{deadValue.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* List of Slow Moving & Old Vehicles */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Vehicles In Showroom ({vehicles.length})
            </h3>
            <p className="text-xs text-slate-500">Arranged with oldest vehicles first so you can clear them</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                <th className="py-2.5 px-4 font-semibold">Vehicle</th>
                <th className="py-2.5 px-4 font-semibold">Chassis (VIN)</th>
                <th className="py-2.5 px-4 font-semibold">Date Received</th>
                <th className="py-2.5 px-4 font-semibold text-right">Days in Showroom</th>
                <th className="py-2.5 px-4 font-semibold text-right">Purchase Cost (₹)</th>
                <th className="py-2.5 px-4 font-semibold text-right">Selling Price (₹)</th>
                <th className="py-2.5 px-4 font-semibold text-right">Advice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {vehicles
                .map((v) => {
                  const daysInStock = Math.floor(
                    (now - new Date(v.purchaseDate).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return { ...v, daysInStock };
                })
                .sort((a, b) => b.daysInStock - a.daysInStock)
                .map((v) => {
                  const isOld = v.daysInStock > 90;
                  const isSlow = v.daysInStock > 60 && v.daysInStock <= 90;

                  return (
                    <tr
                      key={v.id}
                      className={
                        isOld
                          ? 'bg-rose-50/30 dark:bg-rose-950/10'
                          : isSlow
                          ? 'bg-amber-50/20 dark:bg-amber-950/10'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {v.brand} {v.model} ({v.color})
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {v.chassisNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{v.purchaseDate}</td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-mono font-bold tabular-nums px-2 py-0.5 rounded text-[11px] ${
                            isOld
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                              : isSlow
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {v.daysInStock} days
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                        ₹{v.totalLandedCost.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                        ₹{v.sellingPriceExShowroom.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isOld ? (
                          <span className="text-[11px] font-semibold text-rose-600">
                            Offer 5% Discount
                          </span>
                        ) : isSlow ? (
                          <span className="text-[11px] font-medium text-amber-600">
                            Pitch to Walk-ins
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-medium">Fresh Stock</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
