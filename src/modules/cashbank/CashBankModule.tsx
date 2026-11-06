import React, { useState } from 'react';
import {
  Wallet,
  Landmark,
  Plus,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  DollarSign,
  Calendar,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';
import { CashRegisterClosing, BankAccount, BranchId } from '../../types';

export const CashBankModule: React.FC = () => {
  const { activeBranchId, currentUser, branches, triggerRefresh } = useApp();

  const [activeTab, setActiveTab] = useState<'cash' | 'bank' | 'upi'>('cash');
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);

  const operatingBranch =
    activeBranchId === 'all'
      ? branches[0]
      : branches.find((b) => b.id === activeBranchId) || branches[0];

  const cashClosings = db.getCashClosings(operatingBranch.id);
  const bankAccounts = db.getBankAccounts();
  const invoices = db.getInvoices(operatingBranch.id);
  const expenses = db.getExpenses(operatingBranch.id);

  // Calculate live expected cash in drawer today
  const openingCash = 15000;
  let cashSalesToday = 0;
  for (const inv of invoices.filter((i) => i.status === 'Finalized')) {
    for (const p of inv.payments) {
      if (p.method === 'Cash') {
        cashSalesToday += p.amount;
      }
    }
  }

  let cashExpensesToday = 0;
  for (const exp of expenses.filter((e) => e.paymentMethod === 'Cash' && e.approvalStatus === 'Approved')) {
    cashExpensesToday += exp.amount;
  }

  const systemExpectedCash = openingCash + cashSalesToday - cashExpensesToday;

  // Closing Form State
  const [closingForm, setClosingForm] = useState({
    date: new Date().toISOString().split('T')[0],
    physicalCashCounted: systemExpectedCash,
    differenceReason: '',
  });

  const difference = Number(closingForm.physicalCashCounted) - systemExpectedCash;

  const handleSubmitClosing = (e: React.FormEvent) => {
    e.preventDefault();

    db.submitCashClosing(
      {
        branchId: operatingBranch.id,
        date: closingForm.date,
        closedBy: currentUser.name,
        openingCash,
        cashSalesToday,
        cashExpensesToday,
        systemExpectedCash,
        physicalCashCounted: Number(closingForm.physicalCashCounted),
        difference,
        differenceReason: difference !== 0 ? closingForm.differenceReason : undefined,
      },
      currentUser
    );

    setIsClosingModalOpen(false);
    triggerRefresh();
  };

  // UPI Payments list
  const upiTransactions: {
    invoiceNumber: string;
    customerName: string;
    amount: number;
    referenceNo?: string;
    date: string;
    status: string;
  }[] = [];

  for (const inv of invoices.filter((i) => i.status === 'Finalized')) {
    for (const p of inv.payments) {
      if (p.method === 'UPI') {
        upiTransactions.push({
          invoiceNumber: inv.invoiceNumber,
          customerName: inv.customerName,
          amount: p.amount,
          referenceNo: p.referenceNo,
          date: p.date,
          status: p.status,
        });
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="h-5 w-5 text-teal-600" />
            Cash Drawer & Banks
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daily cash drawer count, bank balances, and UPI payments for {operatingBranch.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium dark:bg-slate-800">
            <button
              onClick={() => setActiveTab('cash')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'cash'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Daily Cash Closings
            </button>
            <button
              onClick={() => setActiveTab('bank')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'bank'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Bank Accounts ({bankAccounts.length})
            </button>
            <button
              onClick={() => setActiveTab('upi')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'upi'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              UPI Payments ({upiTransactions.length})
            </button>
          </div>

          {activeTab === 'cash' && (
            <button
              onClick={() => {
                setClosingForm({
                  date: new Date().toISOString().split('T')[0],
                  physicalCashCounted: systemExpectedCash,
                  differenceReason: '',
                });
                setIsClosingModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#173B63] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#102a45]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Close Cash Counter for Today</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'cash' && (
        <div className="space-y-6">
          {/* Current Drawer Status Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Today's Cash Drawer Balance
                </h3>
                <p className="text-xs text-slate-500">Live tally of money coming in and out of the cash counter</p>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {operatingBranch.name}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <div className="text-slate-500">Morning Opening Cash</div>
                <div className="mt-1 text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  ₹{openingCash.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20">
                <div className="text-emerald-700 dark:text-emerald-300 font-semibold">+ Cash Sales Received</div>
                <div className="mt-1 text-base font-bold font-mono text-emerald-800 dark:text-emerald-200 tabular-nums">
                  ₹{cashSalesToday.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-rose-50/60 dark:bg-rose-950/20">
                <div className="text-rose-700 dark:text-rose-300 font-semibold">- Cash Expenses Paid</div>
                <div className="mt-1 text-base font-bold font-mono text-rose-800 dark:text-rose-200 tabular-nums">
                  ₹{cashExpensesToday.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#173B63] text-white">
                <div className="opacity-80">Expected Cash in Drawer</div>
                <div className="mt-1 text-lg font-bold font-mono tabular-nums">
                  ₹{systemExpectedCash.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Past Closings Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Past Daily Closings</h3>
                <p className="text-xs text-slate-500">History of physical cash counts compared with computer sales</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                    <th className="py-2.5 px-4 font-semibold">Date</th>
                    <th className="py-2.5 px-4 font-semibold">Closed By</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Computer Total (₹)</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Physical Counted (₹)</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Difference (₹)</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cashClosings.map((c) => {
                    const isMismatch = c.difference !== 0;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{c.date}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{c.closedBy}</td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                          ₹{c.systemExpectedCash.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                          ₹{c.physicalCashCounted.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                          {c.difference === 0 ? (
                            <span className="text-emerald-600">Matched (₹0)</span>
                          ) : (
                            <span className="text-rose-600">
                              {c.difference > 0 ? `+₹${c.difference}` : `-₹${Math.abs(c.difference)} (Shortage)`}
                            </span>
                          )}
                          {c.differenceReason && (
                            <div className="text-[10px] text-rose-600 italic">"{c.differenceReason}"</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                              c.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                            }`}
                          >
                            {c.status === 'Approved' ? 'Matched' : 'Shortage Flagged'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bank' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bankAccounts.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">{b.bankName}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded dark:bg-slate-800">
                  {b.accountType} A/c
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="text-slate-500">Account No: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{b.accountNumber}</span></div>
                <div className="text-slate-500">IFSC: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{b.ifscCode}</span></div>
                <div className="text-slate-500">{b.branchName}</div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Available Bank Balance</div>
                <div className="text-xl font-bold font-mono text-[#173B63] dark:text-sky-400 mt-0.5 tabular-nums">
                  ₹{b.currentBalance.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'upi' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">UPI QR Payments</h3>
            <p className="text-xs text-slate-500">Payments received on showroom QR codes with UTR reference numbers</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                  <th className="py-2.5 px-4 font-semibold">Bill No</th>
                  <th className="py-2.5 px-4 font-semibold">Date</th>
                  <th className="py-2.5 px-4 font-semibold">Customer</th>
                  <th className="py-2.5 px-4 font-semibold">Bank UTR Reference</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Amount (₹)</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {upiTransactions.map((u, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-white">
                      {u.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{u.date}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{u.customerName}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {u.referenceNo || 'Direct QR Scan'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                      ₹{u.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        Received in Bank
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Daily Cash Closing Modal */}
      {isClosingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Daily Cash Counter Closing
              </h3>
              <button
                onClick={() => setIsClosingModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitClosing} className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Opening Cash Balance:</span>
                  <span className="font-mono">₹{openingCash.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Cash Sales Received Today:</span>
                  <span className="font-mono font-semibold">+₹{cashSalesToday.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Cash Expenses Paid Today:</span>
                  <span className="font-mono font-semibold">-₹{cashExpensesToday.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-1.5">
                  <span>Expected Total in Drawer:</span>
                  <span className="font-mono">₹{systemExpectedCash.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Physical Cash Counted in Drawer (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={closingForm.physicalCashCounted}
                  onChange={(e) =>
                    setClosingForm({ ...closingForm, physicalCashCounted: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm font-mono font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Difference Status */}
              <div
                className={`p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
                  difference === 0
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : difference > 0
                    ? 'bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-200'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
                }`}
              >
                <span>Difference:</span>
                <span className="font-mono">
                  {difference === 0
                    ? 'Exact Match (₹0)'
                    : difference > 0
                    ? `+₹${difference} (Extra Cash)`
                    : `-₹${Math.abs(difference)} (Cash Shortage!)`}
                </span>
              </div>

              {difference !== 0 && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reason for Difference *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Returned ₹300 change by mistake / pending check"
                    value={closingForm.differenceReason}
                    onChange={(e) => setClosingForm({ ...closingForm, differenceReason: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsClosingModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#173B63] text-white font-semibold hover:bg-[#102a45]"
                >
                  Confirm & Submit Closing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
