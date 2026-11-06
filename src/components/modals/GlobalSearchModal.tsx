import React, { useState, useEffect } from 'react';
import { Search, X, Bike, FileText, User, Wrench, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    activeBranchId,
    setActiveModule,
    openPrintInvoice,
  } = useApp();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isGlobalSearchOpen) {
      setQuery('');
    }
  }, [isGlobalSearchOpen]);

  if (!isGlobalSearchOpen) return null;

  const vehicles = db.getVehicles(activeBranchId);
  const invoices = db.getInvoices(activeBranchId);
  const customers = db.getCustomers();
  const parts = db.getParts(activeBranchId);

  const cleanQ = query.trim().toLowerCase();

  const matchedVehicles = cleanQ
    ? vehicles.filter(
        (v) =>
          v.chassisNumber.toLowerCase().includes(cleanQ) ||
          v.motorNumber.toLowerCase().includes(cleanQ) ||
          v.model.toLowerCase().includes(cleanQ) ||
          v.brand.toLowerCase().includes(cleanQ)
      )
    : [];

  const matchedInvoices = cleanQ
    ? invoices.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(cleanQ) ||
          i.customerName.toLowerCase().includes(cleanQ) ||
          i.customerMobile.includes(cleanQ)
      )
    : [];

  const matchedCustomers = cleanQ
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(cleanQ) ||
          c.mobile.includes(cleanQ) ||
          (c.email && c.email.toLowerCase().includes(cleanQ))
      )
    : [];

  const matchedParts = cleanQ
    ? parts.filter(
        (p) =>
          p.name.toLowerCase().includes(cleanQ) ||
          p.partNumber.toLowerCase().includes(cleanQ)
      )
    : [];

  const hasResults =
    matchedVehicles.length > 0 ||
    matchedInvoices.length > 0 ||
    matchedCustomers.length > 0 ||
    matchedParts.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search by Chassis number, Customer name, Phone, Bill number..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsGlobalSearchOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!cleanQ ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Type a chassis VIN, customer name, mobile number, or bill number to find it instantly.
            </div>
          ) : !hasResults ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No matching records found for "{query}".
            </div>
          ) : (
            <>
              {/* Vehicles */}
              {matchedVehicles.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Bike className="h-3.5 w-3.5 text-purple-600" />
                    <span>Vehicles in Stock ({matchedVehicles.length})</span>
                  </div>
                  <div className="grid gap-1.5">
                    {matchedVehicles.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => {
                          setActiveModule('vehicles');
                          setIsGlobalSearchOpen(false);
                        }}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 text-left dark:border-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-white">
                            {v.brand} {v.model} ({v.color})
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            Chassis: {v.chassisNumber} · Motor: {v.motorNumber}
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                              v.status === 'Available'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {v.status}
                          </span>
                          <div className="text-xs font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
                            ₹{v.sellingPriceExShowroom.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices */}
              {matchedInvoices.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-sky-600" />
                    <span>Bills & Invoices ({matchedInvoices.length})</span>
                  </div>
                  <div className="grid gap-1.5">
                    {matchedInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 text-left dark:border-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-white">
                            {inv.invoiceNumber} — {inv.customerName}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Phone: {inv.customerMobile} · Date: {inv.invoiceDate}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                            ₹{inv.grandTotal.toLocaleString('en-IN')}
                          </div>
                          <button
                            onClick={() => {
                              openPrintInvoice(inv);
                              setIsGlobalSearchOpen(false);
                            }}
                            className="p-1.5 rounded-md text-[#173B63] bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300 text-xs font-semibold flex items-center gap-1"
                          >
                            <span>View Bill</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers */}
              {matchedCustomers.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Customers ({matchedCustomers.length})</span>
                  </div>
                  <div className="grid gap-1.5">
                    {matchedCustomers.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setActiveModule('crm');
                          setIsGlobalSearchOpen(false);
                        }}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 text-left dark:border-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-white">{c.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Mobile: {c.mobile} · {c.city}
                          </div>
                        </div>
                        <div className="text-right text-xs font-mono text-slate-600 dark:text-slate-300">
                          {c.vehiclesOwned.length} Vehicle(s)
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Spare Parts */}
              {matchedParts.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench className="h-3.5 w-3.5 text-amber-600" />
                    <span>Spare Parts ({matchedParts.length})</span>
                  </div>
                  <div className="grid gap-1.5">
                    {matchedParts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setActiveModule('parts');
                          setIsGlobalSearchOpen(false);
                        }}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 text-left dark:border-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-white">{p.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            Part #{p.partNumber} · {p.brandCompatible}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                            ₹{p.sellingPrice.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[11px] text-slate-500">{p.quantityInStock} in stock</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
