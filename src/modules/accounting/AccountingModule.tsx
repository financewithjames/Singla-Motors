import React, { useState } from 'react';
import {
  BookOpen,
  Scale,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';
import {
  generateTrialBalance,
  generateProfitAndLoss,
  generateBalanceSheet,
} from '../../services/accountingEngine';

export const AccountingModule: React.FC = () => {
  const { activeBranchId } = useApp();

  const [activeReport, setActiveReport] = useState<'trial_balance' | 'pnl' | 'balance_sheet' | 'ledger'>(
    'trial_balance'
  );

  const journalEntries = db.getJournalEntries(activeBranchId);
  const invoices = db.getInvoices(activeBranchId);
  const expenses = db.getExpenses(activeBranchId);
  const vehicles = db.getVehicles(activeBranchId);
  const parts = db.getParts(activeBranchId);

  // Calculate reports
  const trialBalance = generateTrialBalance(journalEntries);
  const pnl = generateProfitAndLoss(invoices, expenses, vehicles);
  const balanceSheet = generateBalanceSheet(journalEntries, vehicles, parts, pnl.netProfit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#173B63] dark:text-sky-400" />
            Accounts & Financial Books
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automatic book entries for all sales, purchases, shop expenses, and cash counter closings
          </p>
        </div>

        {/* Report Selector Tabs */}
        <div className="flex items-center rounded-lg bg-slate-100 p-0.5 text-xs font-medium dark:bg-slate-800">
          <button
            onClick={() => setActiveReport('trial_balance')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeReport === 'trial_balance'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Accounts Summary (Trial Balance)
          </button>
          <button
            onClick={() => setActiveReport('pnl')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeReport === 'pnl'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Profit & Loss Statement
          </button>
          <button
            onClick={() => setActiveReport('balance_sheet')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeReport === 'balance_sheet'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Balance Sheet
          </button>
          <button
            onClick={() => setActiveReport('ledger')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeReport === 'ledger'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            All Book Entries ({journalEntries.length})
          </button>
        </div>
      </div>

      {/* Trial Balance Statement */}
      {activeReport === 'trial_balance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <Scale className="h-6 w-6 text-[#173B63] dark:text-sky-400" />
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Accounts Summary (Trial Balance)</h3>
                <p className="text-xs text-slate-500">
                  Verification that all money in and money out entries match up
                </p>
              </div>
            </div>

            {trialBalance.isBalanced ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="h-4 w-4" />
                Books Are in Balance
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <AlertTriangle className="h-4 w-4" />
                Difference: ₹{trialBalance.difference}
              </span>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                    <th className="py-2.5 px-4 font-semibold">Account Code</th>
                    <th className="py-2.5 px-4 font-semibold">Account Name</th>
                    <th className="py-2.5 px-4 font-semibold">Type</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Money Coming In / Debit (₹)</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Money Going Out / Credit (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {trialBalance.rows.map((row) => (
                    <tr key={row.accountId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{row.accountId}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {row.accountName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-medium text-slate-500">
                          {row.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 dark:text-white font-medium">
                        {row.debitBalance > 0 ? `₹${row.debitBalance.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 dark:text-white font-medium">
                        {row.creditBalance > 0 ? `₹${row.creditBalance.toLocaleString('en-IN')}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 bg-slate-50 font-bold text-xs dark:bg-slate-800/80">
                    <td colSpan={3} className="py-3 px-4 text-slate-900 dark:text-white">
                      TOTAL
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 dark:text-white text-sm">
                      ₹{trialBalance.totalDebit.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 dark:text-white text-sm">
                      ₹{trialBalance.totalCredit.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Profit & Loss Statement */}
      {activeReport === 'pnl' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 max-w-4xl mx-auto space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Profit & Loss Statement</h3>
              <p className="text-xs text-slate-500">How much your dealership earned and spent</p>
            </div>

            {/* Income Section */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                1. Sales Income (Revenue)
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Sales from Electric Vehicles:</span>
                  <span className="font-mono font-semibold tabular-nums">₹{pnl.salesRevenueEV.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Sales from Accessories & Spares:</span>
                  <span className="font-mono font-semibold tabular-nums">₹{pnl.salesRevenueSpares.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-slate-200 dark:border-slate-700 pt-1.5 text-slate-900 dark:text-white">
                  <span>Total Sales Income:</span>
                  <span className="font-mono text-emerald-600 tabular-nums">₹{pnl.totalRevenue.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Cost of Goods Sold */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                2. Purchase Cost of Vehicles & Goods Sold
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Factory Purchase Cost of Sold Vehicles:</span>
                  <span className="font-mono tabular-nums">₹{pnl.cogsEV.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Cost of Accessories & Spares Sold:</span>
                  <span className="font-mono tabular-nums">₹{pnl.cogsSpares.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-slate-200 dark:border-slate-700 pt-1.5 text-slate-900 dark:text-white">
                  <span>Total Purchase Cost:</span>
                  <span className="font-mono text-rose-600 tabular-nums">₹{pnl.totalCOGS.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Gross Profit Banner */}
            <div className="p-3.5 rounded-lg bg-sky-50 dark:bg-sky-950/30 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-sm text-sky-900 dark:text-sky-200">Gross Profit:</span>
                <span className="text-xs text-sky-700 dark:text-sky-300 ml-2">
                  (Sales minus vehicle purchase costs — {pnl.grossProfitMarginPercent}% margin)
                </span>
              </div>
              <span className="font-mono text-base font-bold text-sky-900 dark:text-sky-200 tabular-nums">
                ₹{pnl.grossProfit.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Operating Expenses */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-xs uppercase tracking-wider text-rose-700 dark:text-rose-400">
                3. Showroom Running Expenses
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 space-y-2">
                {pnl.expenseBreakdown.map((exp) => (
                  <div key={exp.category} className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>{exp.category}:</span>
                    <span className="font-mono tabular-nums">₹{exp.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold border-t border-slate-200 dark:border-slate-700 pt-1.5 text-slate-900 dark:text-white">
                  <span>Total Shop Expenses:</span>
                  <span className="font-mono text-rose-600 tabular-nums">₹{pnl.totalExpenses.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Net Profit Final */}
            <div className="p-4 rounded-xl bg-[#173B63] text-white flex justify-between items-center text-sm shadow-md">
              <div>
                <div className="font-bold text-base">Net Profit (Your Final Earnings):</div>
                <div className="text-xs opacity-80">
                  After all factory purchases and showroom expenses ({pnl.netProfitMarginPercent}% net margin)
                </div>
              </div>
              <div className="font-mono text-xl font-bold tabular-nums">
                ₹{pnl.netProfit.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Balance Sheet */}
      {activeReport === 'balance_sheet' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 max-w-4xl mx-auto space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Balance Sheet</h3>
              <p className="text-xs text-slate-500">What your dealership owns (Assets) vs what it owes (Liabilities)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Assets */}
              <div className="space-y-3">
                <div className="font-bold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Assets (What Dealership Owns)
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 space-y-2.5">
                  {balanceSheet.assets.map((a) => (
                    <div key={a.name} className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>{a.name}:</span>
                      <span className="font-mono font-semibold tabular-nums">₹{a.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold border-t border-slate-200 dark:border-slate-700 pt-2 text-sm text-slate-900 dark:text-white">
                    <span>Total Assets:</span>
                    <span className="font-mono text-emerald-600 tabular-nums">₹{balanceSheet.totalAssets.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Liabilities & Equity */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider text-rose-700 dark:text-rose-400">
                    Liabilities (What Dealership Owes)
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 space-y-2">
                    {balanceSheet.liabilities.map((l) => (
                      <div key={l.name} className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>{l.name}:</span>
                        <span className="font-mono font-semibold tabular-nums">₹{l.amount.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold border-t border-slate-200 dark:border-slate-700 pt-1.5 text-slate-900 dark:text-white">
                      <span>Total Liabilities:</span>
                      <span className="font-mono text-rose-600 tabular-nums">₹{balanceSheet.totalLiabilities.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider text-[#173B63] dark:text-sky-400">
                    Owner's Equity & Capital
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 space-y-2">
                    {balanceSheet.equity.map((e) => (
                      <div key={e.name} className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>{e.name}:</span>
                        <span className="font-mono font-semibold tabular-nums">₹{e.amount.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold border-t border-slate-200 dark:border-slate-700 pt-1.5 text-slate-900 dark:text-white">
                      <span>Total Equity:</span>
                      <span className="font-mono tabular-nums">₹{balanceSheet.totalEquity.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Journal Entries List */}
      {activeReport === 'ledger' && (
        <div className="space-y-3">
          {journalEntries.map((entry) => (
            <div
              key={entry.id}
              className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-2 text-xs"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="font-mono">{entry.entryNumber}</span>
                    <span className="text-slate-400">·</span>
                    <span>{entry.narration}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Date: {entry.date} · Recorded by: {entry.createdBy} · Type: {entry.referenceType}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-2 space-y-1">
                {entry.lines.map((l, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className={l.debit > 0 ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500 pl-4'}>
                      {l.accountName}
                    </span>
                    <div className="space-x-4 font-mono tabular-nums">
                      {l.debit > 0 && <span className="font-semibold text-emerald-600">Debit ₹{l.debit.toLocaleString('en-IN')}</span>}
                      {l.credit > 0 && <span className="font-semibold text-rose-600">Credit ₹{l.credit.toLocaleString('en-IN')}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
