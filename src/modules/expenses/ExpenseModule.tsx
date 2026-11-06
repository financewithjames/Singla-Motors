import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  DollarSign,
  AlertCircle,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';
import { ExpenseRecord, ExpenseCategory, BranchId } from '../../types';

export const ExpenseModule: React.FC = () => {
  const { activeBranchId, currentUser, branches, triggerRefresh } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);

  const expenses = db.getExpenses(activeBranchId);

  // Form State
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    branchId: activeBranchId === 'all' ? 'branch_store_a' : activeBranchId,
    category: 'Electricity' as ExpenseCategory,
    description: '',
    amount: 1500,
    gstAmount: 0,
    vendorName: '',
    vendorGstin: '',
    paymentMethod: 'Bank Transfer' as ExpenseRecord['paymentMethod'],
  });

  const totalExpenseAmount = expenses.reduce((acc, e) => acc + e.amount, 0);
  const pendingApprovalsCount = expenses.filter((e) => e.approvalStatus === 'Pending').length;

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.description || !expenseForm.vendorName) {
      alert('Please fill expense description and vendor name.');
      return;
    }

    db.addExpense(
      {
        date: expenseForm.date,
        branchId: expenseForm.branchId as BranchId,
        category: expenseForm.category,
        description: expenseForm.description,
        amount: Number(expenseForm.amount),
        gstAmount: Number(expenseForm.gstAmount),
        vendorName: expenseForm.vendorName,
        vendorGstin: expenseForm.vendorGstin || undefined,
        paymentMethod: expenseForm.paymentMethod,
        paidBy: currentUser.name,
      },
      currentUser
    );

    setIsAddExpenseModalOpen(false);
    setExpenseForm({
      ...expenseForm,
      description: '',
      vendorName: '',
      vendorGstin: '',
      amount: 1500,
    });
    triggerRefresh();
  };

  const handleApprove = (id: string) => {
    db.approveExpense(id, currentUser);
    triggerRefresh();
  };

  const handleReject = (id: string) => {
    db.rejectExpense(id, currentUser);
    triggerRefresh();
  };

  const categories: ExpenseCategory[] = [
    'Showroom Rent',
    'Electricity',
    'Staff Refreshments',
    'Office Supplies',
    'Marketing & Ads',
    'Internet & Utilities',
    'Transportation & Freight',
    'Loading & Unloading',
    'Bank Charges',
    'Repairs & Maintenance',
    'Miscellaneous',
  ];

  const filteredExpenses = expenses.filter((e) => {
    if (selectedCategory === 'all') return true;
    return e.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-amber-600" />
            Shop Expenses
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rent, power bills, staff refreshments, marketing, and repairs with owner approval for bills over ₹5,000
          </p>
        </div>

        <button
          onClick={() => setIsAddExpenseModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#173B63] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#102a45]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Total Expenses Logged</div>
          <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
            ₹{totalExpenseAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{expenses.length} bills recorded</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Waiting for Owner Approval</div>
          <div className="text-lg font-bold font-mono tabular-nums text-amber-600 mt-1">
            {pendingApprovalsCount} Bills
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">Expenses over ₹5,000</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">Approved & Deducted</div>
          <div className="text-lg font-bold font-mono tabular-nums text-emerald-600 mt-1">
            {expenses.filter((e) => e.approvalStatus === 'Approved').length} Bills
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5 font-medium">Included in Profit & Loss</div>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-xs">
        <Filter className="h-3.5 w-3.5 text-slate-400" />
        <span className="font-semibold text-slate-600 dark:text-slate-300">Category:</span>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Expenses Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                <th className="py-2.5 px-4 font-semibold">Expense No</th>
                <th className="py-2.5 px-4 font-semibold">Date</th>
                <th className="py-2.5 px-4 font-semibold">Category</th>
                <th className="py-2.5 px-4 font-semibold">Description & Vendor</th>
                <th className="py-2.5 px-4 font-semibold text-right">Amount (₹)</th>
                <th className="py-2.5 px-4 font-semibold text-right">Payment</th>
                <th className="py-2.5 px-4 font-semibold text-right">Approval Status</th>
                <th className="py-2.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-white">
                    {exp.expenseNo}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{exp.date}</td>
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{exp.category}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{exp.description}</div>
                    <div className="text-[11px] text-slate-400">Paid to: {exp.vendorName}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                    ₹{exp.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300">
                    {exp.paymentMethod}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        exp.approvalStatus === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : exp.approvalStatus === 'Pending'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}
                    >
                      {exp.approvalStatus === 'Pending' ? 'Waiting for Owner' : exp.approvalStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {exp.approvalStatus === 'Pending' && currentUser.role === 'super_admin' ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleApprove(exp.id)}
                          className="px-2 py-1 text-[11px] font-semibold bg-emerald-600 text-white rounded hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(exp.id)}
                          className="px-2 py-1 text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-200 rounded hover:bg-rose-100"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        {exp.approvalStatus === 'Approved' ? `Approved by ${exp.approvedBy}` : 'Completed'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Record New Shop Expense
              </h3>
              <button
                onClick={() => setIsAddExpenseModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Showroom Branch *
                  </label>
                  <select
                    value={expenseForm.branchId}
                    onChange={(e) => setExpenseForm({ ...expenseForm, branchId: e.target.value as BranchId })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expense Category *
                  </label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as ExpenseCategory })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Purpose *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. October power bill for showroom and workshop"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vendor / Payee Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PSPCL / Landlord"
                    value={expenseForm.vendorName}
                    onChange={(e) => setExpenseForm({ ...expenseForm, vendorName: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Bank Transfer">Bank Transfer (IMPS / NEFT)</option>
                    <option value="Cash">Cash in Hand</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-[11px] text-amber-800 dark:text-amber-300">
                Notice: Expenses exceeding ₹5,000 will be held for the dealership owner to review and approve before being finalized.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#173B63] text-white font-semibold hover:bg-[#102a45]"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
