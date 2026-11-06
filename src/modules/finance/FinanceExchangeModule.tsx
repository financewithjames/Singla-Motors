import React, { useState } from 'react';
import {
  Landmark,
  ArrowRightLeft,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';
import { FinanceApplication, OldVehicleExchange, BranchId } from '../../types';

export const FinanceExchangeModule: React.FC = () => {
  const { activeBranchId, currentUser, branches, triggerRefresh } = useApp();

  const [activeTab, setActiveTab] = useState<'finance' | 'exchange'>('finance');
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);

  const financeApps = db.getFinanceApps(activeBranchId);
  const exchanges = db.getExchanges(activeBranchId);

  // New Loan Form State
  const [finForm, setFinForm] = useState({
    customerId: '',
    customerName: '',
    customerMobile: '',
    vehicleModel: 'Ather 450X Gen 3',
    vehiclePrice: 144999,
    financierName: 'Bajaj Finserv' as FinanceApplication['financierName'],
    loanAmountApplied: 100000,
    downPayment: 44999,
    interestRate: 8.99,
    tenureMonths: 24,
    branchId: activeBranchId === 'all' ? 'branch_store_a' : activeBranchId,
  });

  // New Exchange Form State
  const [excForm, setExcForm] = useState({
    customerId: '',
    customerName: '',
    customerMobile: '',
    brand: 'Honda',
    model: 'Activa 4G',
    registrationNumber: '',
    chassisNumber: '',
    yearOfMfg: 2017,
    odometerReadingKm: 38000,
    conditionGrade: 'B (Good)' as OldVehicleExchange['conditionGrade'],
    evaluatedValue: 22000,
    agreedExchangeValue: 22000,
    branchId: activeBranchId === 'all' ? 'branch_store_a' : activeBranchId,
  });

  const handleCreateFinance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finForm.customerName || !finForm.customerMobile) {
      alert('Please fill customer name and mobile.');
      return;
    }
    db.addFinanceApp(
      {
        ...finForm,
        branchId: finForm.branchId as BranchId,
        status: 'Under Review',
        disbursementReceivedInBank: false,
      },
      currentUser
    );
    setIsFinanceModalOpen(false);
    triggerRefresh();
  };

  const handleCreateExchange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!excForm.customerName || !excForm.registrationNumber) {
      alert('Please fill customer name and registration number.');
      return;
    }
    db.addExchange(
      {
        ...excForm,
        branchId: excForm.branchId as BranchId,
        approvedBy: currentUser.name,
        status: 'Approved',
        photos: [],
      },
      currentUser
    );
    setIsExchangeModalOpen(false);
    triggerRefresh();
  };

  const handleMarkLoanReceived = (appId: string) => {
    const utr = prompt('Enter Bank UTR Reference Number received from finance company:');
    if (utr) {
      db.updateFinanceStatus(appId, 'Disbursed', utr, currentUser);
      alert('Loan marked as received in bank!');
      triggerRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Landmark className="h-5 w-5 text-purple-600" />
            Vehicle Loans & Old Bike Exchange
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Bank loan tracking and trade-in exchange for old petrol scooters and bikes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium dark:bg-slate-800">
            <button
              onClick={() => setActiveTab('finance')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'finance'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Loan Applications ({financeApps.length})
            </button>
            <button
              onClick={() => setActiveTab('exchange')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'exchange'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Old Bike Trade-Ins ({exchanges.length})
            </button>
          </div>

          {activeTab === 'finance' ? (
            <button
              onClick={() => setIsFinanceModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#173B63] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#102a45]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Loan Application</span>
            </button>
          ) : (
            <button
              onClick={() => setIsExchangeModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#173B63] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#102a45]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Old Bike Trade-In</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'finance' ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            <strong>Helpful Note:</strong> A loan is marked as completed only after the bank or finance company actually transfers the money to your showroom bank account (with UTR reference).
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                    <th className="py-2.5 px-4 font-semibold">Application No</th>
                    <th className="py-2.5 px-4 font-semibold">Customer</th>
                    <th className="py-2.5 px-4 font-semibold">Financier</th>
                    <th className="py-2.5 px-4 font-semibold">Scooter Model</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Loan Amount (₹)</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Down Payment (₹)</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Status</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {financeApps.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-white">
                        {f.applicationNo}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{f.customerName}</div>
                        <div className="text-[11px] text-slate-400">{f.customerMobile}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {f.financierName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{f.vehicleModel}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                        ₹{f.loanAmountApplied.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                        ₹{f.downPayment.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            f.status === 'Disbursed'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : f.status === 'Approved'
                              ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          }`}
                        >
                          {f.status === 'Disbursed' ? 'Money in Bank' : f.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {f.status !== 'Disbursed' ? (
                          <button
                            onClick={() => handleMarkLoanReceived(f.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-[#173B63] bg-sky-50 rounded hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300"
                          >
                            Mark Received (UTR)
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">
                            UTR: {f.bankUtrReference}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Old Bike Exchanges */
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Old Bike Trade-Ins</h3>
            <p className="text-xs text-slate-500">Valuation of petrol scooters and bikes exchanged by customers</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                  <th className="py-2.5 px-4 font-semibold">Exchange No</th>
                  <th className="py-2.5 px-4 font-semibold">Customer</th>
                  <th className="py-2.5 px-4 font-semibold">Old Bike / Scooter</th>
                  <th className="py-2.5 px-4 font-semibold">Registration No</th>
                  <th className="py-2.5 px-4 font-semibold">Condition</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Exchange Value (₹)</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {exchanges.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-white">
                      {e.exchangeNo}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {e.customerName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{e.brand} {e.model}</div>
                      <div className="text-[11px] text-slate-400">Year: {e.yearOfMfg} · {e.odometerReadingKm} km</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      {e.registrationNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{e.conditionGrade}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                      ₹{e.agreedExchangeValue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Loan Modal */}
      {isFinanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                New Vehicle Loan Application
              </h3>
              <button
                onClick={() => setIsFinanceModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFinance} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Customer name"
                  value={finForm.customerName}
                  onChange={(e) => setFinForm({ ...finForm, customerName: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10-digit number"
                  value={finForm.customerMobile}
                  onChange={(e) => setFinForm({ ...finForm, customerMobile: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Financier Company *
                  </label>
                  <select
                    value={finForm.financierName}
                    onChange={(e) => setFinForm({ ...finForm, financierName: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Bajaj Finserv">Bajaj Finserv</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="Tata Capital">Tata Capital</option>
                    <option value="IDFC First Bank">IDFC First Bank</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Loan Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={finForm.loanAmountApplied}
                    onChange={(e) => setFinForm({ ...finForm, loanAmountApplied: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFinanceModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#173B63] text-white font-semibold hover:bg-[#102a45]"
                >
                  Save Loan Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Exchange Modal */}
      {isExchangeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Add Old Bike Trade-In
              </h3>
              <button
                onClick={() => setIsExchangeModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExchange} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Customer name"
                    value={excForm.customerName}
                    onChange={(e) => setExcForm({ ...excForm, customerName: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Registration No *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PB-11-AB-1234"
                    value={excForm.registrationNumber}
                    onChange={(e) => setExcForm({ ...excForm, registrationNumber: e.target.value.toUpperCase() })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Make & Model *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Honda Activa 4G"
                    value={excForm.model}
                    onChange={(e) => setExcForm({ ...excForm, model: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Year of Manufacture
                  </label>
                  <input
                    type="number"
                    value={excForm.yearOfMfg}
                    onChange={(e) => setExcForm({ ...excForm, yearOfMfg: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Agreed Exchange Value (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={excForm.agreedExchangeValue}
                  onChange={(e) => setExcForm({ ...excForm, agreedExchangeValue: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono font-bold"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  This amount will be deducted directly from the customer's new EV bill
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsExchangeModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#173B63] text-white font-semibold hover:bg-[#102a45]"
                >
                  Save Exchange
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
