import React, { useState } from 'react';
import { Wrench, BatteryCharging, AlertTriangle, Search, Plus, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';

export const PartsInventory: React.FC = () => {
  const { activeBranchId } = useApp();

  const [activeTab, setActiveTab] = useState<'parts' | 'batteries' | 'accessories'>('parts');
  const [searchQuery, setSearchQuery] = useState('');

  const parts = db.getParts(activeBranchId);
  const batteries = db.getBatteries(activeBranchId);
  const accessories = db.getAccessories(activeBranchId);

  const lowStockParts = parts.filter((p) => p.quantityInStock <= p.reorderLevel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Spare Parts & Batteries
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Stock levels for genuine parts, replacement battery packs, and accessories
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium dark:bg-slate-800">
            <button
              onClick={() => setActiveTab('parts')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'parts'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Spare Parts ({parts.length})
            </button>
            <button
              onClick={() => setActiveTab('batteries')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'batteries'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Battery Packs ({batteries.length})
            </button>
            <button
              onClick={() => setActiveTab('accessories')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'accessories'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Accessories ({accessories.length})
            </button>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockParts.length > 0 && activeTab === 'parts' && (
        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              <strong>Low Stock Notice:</strong> {lowStockParts.length} spare part(s) are running low and need reordering soon ({lowStockParts.map((p) => p.name).join(', ')}).
            </span>
          </div>
        </div>
      )}

      {/* Content Tables */}
      {activeTab === 'parts' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                  <th className="py-2.5 px-4 font-semibold">Part Name</th>
                  <th className="py-2.5 px-4 font-semibold">Part Number</th>
                  <th className="py-2.5 px-4 font-semibold">Fits Scooter</th>
                  <th className="py-2.5 px-4 font-semibold text-right">In Stock</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Cost Price (₹)</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Selling Price (₹)</th>
                  <th className="py-2.5 px-4 font-semibold text-right">GST %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {parts.map((p) => {
                  const isLow = p.quantityInStock <= p.reorderLevel;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{p.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{p.partNumber}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{p.brandCompatible}</td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-mono font-bold tabular-nums px-2 py-0.5 rounded text-[11px] ${
                            isLow
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {p.quantityInStock} pcs {isLow ? '(Low)' : ''}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                        ₹{p.unitCost.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                        ₹{p.sellingPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">{p.gstRate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'batteries' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                  <th className="py-2.5 px-4 font-semibold">Battery Brand</th>
                  <th className="py-2.5 px-4 font-semibold">Serial Number</th>
                  <th className="py-2.5 px-4 font-semibold">Capacity</th>
                  <th className="py-2.5 px-4 font-semibold">Chemistry</th>
                  <th className="py-2.5 px-4 font-semibold">Fits Scooter</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Purchase Cost (₹)</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Selling Price (₹)</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {batteries.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{b.brand}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{b.serialNumber}</td>
                    <td className="py-3 px-4 font-mono font-medium">{b.capacityKwh} kWh</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{b.chemistry}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{b.compatibleModel}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                      ₹{b.purchaseCost.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                      ₹{b.sellingPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'accessories' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                  <th className="py-2.5 px-4 font-semibold">Accessory Item</th>
                  <th className="py-2.5 px-4 font-semibold">Category</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Quantity in Stock</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Cost Price (₹)</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Selling Price (₹)</th>
                  <th className="py-2.5 px-4 font-semibold text-right">GST %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {accessories.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{a.name}</td>
                    <td className="py-3 px-4 text-slate-500">{a.category}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-800 dark:text-slate-200">
                      {a.quantityInStock} pcs
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                      ₹{a.unitCost.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                      ₹{a.sellingPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">{a.gstRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
