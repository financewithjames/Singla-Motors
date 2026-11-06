import React, { useState } from 'react';
import {
  TrendingUp,
  Bike,
  DollarSign,
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  Wallet,
  Landmark,
  Percent,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';
import { generateProfitAndLoss } from '../../services/accountingEngine';

export const OwnerDashboard: React.FC = () => {
  const {
    activeBranchId,
    setActiveBranchId,
    branches,
    setActiveModule,
    openPrintInvoice,
    currentUser,
    refreshTrigger,
  } = useApp();

  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'fy'>('month');

  // Load live data from db
  const vehicles = db.getVehicles(activeBranchId);
  const invoices = db.getInvoices(activeBranchId);
  const expenses = db.getExpenses(activeBranchId);
  const cashClosings = db.getCashClosings(activeBranchId);
  const securityAlerts = db.getSecurityAlerts(activeBranchId);

  const finalizedInvoices = invoices.filter((i) => i.status === 'Finalized');

  // Key KPI calculations
  const totalRevenue = finalizedInvoices.reduce((acc, i) => acc + i.grandTotal, 0);

  const vehiclesSold = finalizedInvoices.reduce(
    (acc, inv) => acc + inv.items.filter((item) => item.itemType === 'Vehicle').length,
    0
  );

  const availableVehicles = vehicles.filter((v) => v.status === 'Available');
  const totalInventoryValue = availableVehicles.reduce((acc, v) => acc + v.totalLandedCost, 0);

  // Slow moving vehicles (> 60 days)
  const now = new Date().getTime();
  const oldStockVehicles = availableVehicles.filter((v) => {
    const diffDays = Math.floor((now - new Date(v.purchaseDate).getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 60;
  });

  // Profit calculations
  const pnl = generateProfitAndLoss(invoices, expenses, vehicles);
  const grossProfit = pnl.grossProfit;
  const netProfit = pnl.netProfit;
  const totalExpenses = pnl.totalExpenses;

  // Real liquid collections
  let cashCollected = 0;
  let upiCollected = 0;
  let bankCollected = 0;
  let financeDisbursed = 0;
  let customerReceivables = 0;

  for (const inv of finalizedInvoices) {
    customerReceivables += inv.balanceDue;
    for (const p of inv.payments) {
      if (p.method === 'Cash') cashCollected += p.amount;
      if (p.method === 'UPI') upiCollected += p.amount;
      if (p.method === 'Bank Transfer') bankCollected += p.amount;
      if (p.method === 'Loan') financeDisbursed += p.amount;
    }
  }

  // Pending Approvals queue for owner
  const pendingExpenses = expenses.filter((e) => e.approvalStatus === 'Pending');
  const flaggedCashClosings = cashClosings.filter((c) => c.status === 'Flagged');
  const openAlerts = securityAlerts.filter((a) => a.status === 'Open');

  return (
    <div className="space-y-6">
      {/* Top Welcome Strip */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Owner Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Quick overview of sales, cash in hand, vehicles in stock, and profits across your branches
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg dark:bg-slate-800 self-start sm:self-auto">
          {(
            [
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
              { id: 'fy', label: 'This Year' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setDateFilter(t.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                dateFilter === t.id
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actionable Alerts Banner */}
      {openAlerts.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-900/60 dark:bg-rose-950/30">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                  {openAlerts.length} Item(s) Need Your Attention
                </h3>
                <div className="mt-1 space-y-1">
                  {openAlerts.map((fa) => (
                    <div key={fa.id} className="text-xs text-rose-800 dark:text-rose-300">
                      <span className="font-semibold">{fa.branchName}:</span> {fa.title} — {fa.description}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveModule('audit_security')}
              className="text-xs font-semibold text-rose-700 underline hover:text-rose-900 dark:text-rose-300 shrink-0"
            >
              View All Alerts
            </button>
          </div>
        </div>
      )}

      {/* Primary Numbers Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Sales */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Sales</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="font-semibold text-emerald-600">{vehiclesSold} Electric Vehicles</span>
            <span>sold</span>
          </div>
        </div>

        {/* Gross Profit */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Gross Profit</span>
            <Percent className="h-4 w-4 text-sky-600" />
          </div>
          <div className="mt-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
            ₹{grossProfit.toLocaleString('en-IN')}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Margin: <span className="font-semibold text-slate-700 dark:text-slate-300">{pnl.grossProfitMarginPercent}%</span> (Sales minus vehicle cost)
          </div>
        </div>

        {/* Net Profit */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Net Profit (Earnings)</span>
            <DollarSign className="h-4 w-4 text-[#173B63] dark:text-sky-400" />
          </div>
          <div className="mt-2 text-xl font-bold tracking-tight text-[#173B63] dark:text-sky-400 font-mono tabular-nums">
            ₹{netProfit.toLocaleString('en-IN')}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Shop Expenses: <span className="font-semibold text-rose-600 font-mono">₹{totalExpenses.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Vehicles in Stock */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Vehicles in Showroom</span>
            <Bike className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
            ₹{totalInventoryValue.toLocaleString('en-IN')}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="font-semibold text-purple-600">{availableVehicles.length} Units ready to sell</span>
            {oldStockVehicles.length > 0 && (
              <span className="text-amber-600 font-medium">· {oldStockVehicles.length} Slow moving</span>
            )}
          </div>
        </div>
      </div>

      {/* Money Received vs Pending Balances */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Money Received vs Pending Payments
            </h3>
            <p className="text-xs text-slate-500">
              Breakdown of cash in drawer, bank deposits, loan payments, and pending customer dues
            </p>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Important: Sales total is not the same as actual cash in bank
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-4">
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
            <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1">
              <Wallet className="h-3 w-3 text-emerald-600" />
              Cash Received
            </div>
            <div className="mt-1 text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              ₹{cashCollected.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Physical Counter Cash</div>
          </div>

          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
            <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1">
              <Landmark className="h-3 w-3 text-sky-600" />
              Bank & UPI
            </div>
            <div className="mt-1 text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              ₹{(upiCollected + bankCollected).toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Online & Net Banking</div>
          </div>

          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
            <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-purple-600" />
              Financier Loans
            </div>
            <div className="mt-1 text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              ₹{financeDisbursed.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Bajaj / HDFC / Tata Capital</div>
          </div>

          <div className="rounded-lg bg-amber-50/60 p-3 dark:bg-amber-950/20">
            <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 uppercase flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-600" />
              Pending From Customers
            </div>
            <div className="mt-1 text-base font-bold font-mono text-amber-800 dark:text-amber-200 tabular-nums">
              ₹{customerReceivables.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">Remaining Balance Due</div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Showrooms Comparison & Approvals Waiting for Owner */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Showroom Performance */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Showroom Performance Comparison</h3>
              <p className="text-xs text-slate-500">Patiala Central Hub vs Chandigarh Showroom</p>
            </div>
            <button
              onClick={() => setActiveModule('branch_admin')}
              className="text-xs font-semibold text-[#173B63] hover:underline dark:text-sky-400"
            >
              Manage Showrooms
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                  <th className="pb-2 font-semibold">Showroom</th>
                  <th className="pb-2 font-semibold text-right">Sales</th>
                  <th className="pb-2 font-semibold text-right">Vehicles Sold</th>
                  <th className="pb-2 font-semibold text-right">In Stock</th>
                  <th className="pb-2 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {branches.map((b) => {
                  const bInvoices = db.getInvoices(b.id).filter((i) => i.status === 'Finalized');
                  const bRevenue = bInvoices.reduce((acc, i) => acc + i.grandTotal, 0);
                  const bUnits = bInvoices.reduce(
                    (acc, i) => acc + i.items.filter((item) => item.itemType === 'Vehicle').length,
                    0
                  );
                  const bStock = db.getVehicles(b.id).filter((v) => v.status === 'Available').length;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-100">{b.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {b.city} · GSTIN: {b.gstin}
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                        ₹{bRevenue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {bUnits} EVs
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-purple-600 font-medium">
                        {bStock} in stock
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Approvals Waiting for Owner */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Approvals Waiting for Owner ({pendingExpenses.length + flaggedCashClosings.length})
              </h3>
              <p className="text-xs text-slate-500">Review and approve items that need owner permission</p>
            </div>
            <span className="text-[11px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md dark:bg-amber-950/40">
              Needs Owner Sign-off
            </span>
          </div>

          <div className="space-y-3">
            {pendingExpenses.length === 0 && flaggedCashClosings.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1 opacity-75" />
                All branch expenses and cash closing records are approved and reconciled.
              </div>
            ) : (
              <>
                {flaggedCashClosings.map((fc) => (
                  <div
                    key={fc.id}
                    className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-900/60 dark:bg-amber-950/20 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200">
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                        <span>Cash Difference (Shortage of ₹{Math.abs(fc.difference)})</span>
                      </div>
                      <div className="text-[11px] text-amber-800 dark:text-amber-300 mt-1">
                        Counted: ₹{fc.physicalCashCounted.toLocaleString('en-IN')} vs Expected: ₹{fc.systemExpectedCash.toLocaleString('en-IN')}
                      </div>
                      {fc.differenceReason && (
                        <div className="text-[11px] text-amber-700 italic mt-0.5">
                          "{fc.differenceReason}"
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setActiveModule('cash_bank')}
                      className="px-2 py-1 text-xs font-medium text-amber-800 bg-amber-100 rounded-md hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-100 shrink-0"
                    >
                      Check Register
                    </button>
                  </div>
                ))}

                {pendingExpenses.map((pe) => (
                  <div
                    key={pe.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        {pe.expenseNo} — {pe.category}
                      </div>
                      <div className="text-xs font-mono font-bold text-rose-600 mt-0.5 tabular-nums">
                        ₹{pe.amount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {pe.description} (Paid to {pe.vendorName})
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => db.approveExpense(pe.id, currentUser)}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => db.rejectExpense(pe.id, currentUser)}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 flex items-center gap-1 dark:bg-rose-950/40"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Showroom Sales */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Customer Bills</h3>
            <p className="text-xs text-slate-500">Latest vehicle deliveries and customer billing records</p>
          </div>
          <button
            onClick={() => setActiveModule('pos')}
            className="text-xs font-semibold text-[#173B63] hover:underline dark:text-sky-400"
          >
            Open Billing Counter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                <th className="pb-2 font-semibold">Bill No</th>
                <th className="pb-2 font-semibold">Customer</th>
                <th className="pb-2 font-semibold">Showroom</th>
                <th className="pb-2 font-semibold">Vehicle / Items</th>
                <th className="pb-2 font-semibold text-right">Total Bill</th>
                <th className="pb-2 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {finalizedInvoices.slice(0, 5).map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-2.5 font-mono font-medium text-slate-900 dark:text-white">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-2.5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{inv.customerName}</div>
                    <div className="text-[11px] text-slate-400">{inv.customerMobile}</div>
                  </td>
                  <td className="py-2.5 text-slate-600 dark:text-slate-300">
                    {inv.branchId === 'branch_store_a' ? 'Patiala' : 'Chandigarh'}
                  </td>
                  <td className="py-2.5 text-slate-600 dark:text-slate-300">
                    {inv.items[0]?.description}
                    {inv.items.length > 1 && ` + ${inv.items.length - 1} more`}
                  </td>
                  <td className="py-2.5 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                    ₹{inv.grandTotal.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => openPrintInvoice(inv)}
                      className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                    >
                      View Bill
                    </button>
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
